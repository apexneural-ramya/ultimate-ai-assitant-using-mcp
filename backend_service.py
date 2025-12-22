"""
FastAPI backend service for MCP operations.
This service handles MCP client and agent creation/management.
Run with: uvicorn backend_service:app --reload --port 8000
"""
import os
import re
import time
from typing import Dict, Optional, Any
from fastapi import FastAPI, HTTPException, Request, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, ValidationError
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from mcp_use import MCPAgent, MCPClient
import mcp_use
import warnings

warnings.filterwarnings("ignore")
mcp_use.set_debug(0)

# Load environment variables
load_dotenv()

app = FastAPI(
    title="MCP Backend Service",
    description="FastAPI backend for MCP-powered AI Assistant",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Convert FastAPI validation errors to standardized format."""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=422,
        content=StandardResponse(
            status_code=422,
            status=False,
            message="Validation error",
            path=str(request.url.path),
            data={"errors": errors}
        ).dict()
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Convert HTTP exceptions to standardized format."""
    return JSONResponse(
        status_code=exc.status_code,
        content=StandardResponse(
            status_code=exc.status_code,
            status=False,
            message=exc.detail,
            path=str(request.url.path),
            data=None
        ).dict()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Convert all other exceptions to standardized format."""
    return JSONResponse(
        status_code=500,
        content=StandardResponse(
            status_code=500,
            status=False,
            message=str(exc),
            path=str(request.url.path),
            data=None
        ).dict()
    )

# Store active agents and clients in memory (in production, use Redis or similar)
active_agents: Dict[str, MCPAgent] = {}
active_clients: Dict[str, MCPClient] = {}


class StandardResponse(BaseModel):
    """Standardized API response format"""
    status_code: int
    status: bool
    message: str
    path: str
    data: Optional[Any] = None

    class Config:
        json_schema_extra = {
            "example": {
                "status_code": 200,
                "status": True,
                "message": "Operation successful",
                "path": "/api/mcp/activate",
                "data": {}
            }
        }


class MCPConfigRequest(BaseModel):
    config: dict
    sessionId: Optional[str] = None


class QueryRequest(BaseModel):
    query: str
    sessionId: str


class ActivateResponseData(BaseModel):
    """Response data for activate endpoint"""
    sessionId: str
    servers: list[str]
    message: str


class QueryResponseData(BaseModel):
    """Response data for query endpoint"""
    result: str


class SessionListResponseData(BaseModel):
    """Response data for session list endpoint"""
    sessions: list[str]
    count: int


class SessionClearResponseData(BaseModel):
    """Response data for session clear endpoint"""
    message: str


class HealthResponseData(BaseModel):
    """Response data for health endpoint"""
    service: str


class ValidationErrorData(BaseModel):
    """Response data for validation errors"""
    errors: list[dict]


def substitute_env_vars(value: Any) -> Any:
    """Recursively substitute environment variables in config values."""
    if isinstance(value, dict):
        return {k: substitute_env_vars(v) for k, v in value.items()}
    elif isinstance(value, list):
        return [substitute_env_vars(item) for item in value]
    elif isinstance(value, str):
        # Match ${VAR_NAME} pattern
        pattern = r'\$\{([^}]+)\}'
        def replace_env(match):
            var_name = match.group(1)
            env_value = os.getenv(var_name)
            if env_value is None:
                raise ValueError(f"Environment variable {var_name} not found")
            return env_value
        return re.sub(pattern, replace_env, value)
    else:
        return value


@app.post(
    "/api/mcp/activate",
    response_model=StandardResponse,
    status_code=status.HTTP_200_OK,
    responses={
        422: {
            "model": StandardResponse,
            "description": "Validation Error",
            "content": {
                "application/json": {
                    "example": {
                        "status_code": 422,
                        "status": False,
                        "message": "Validation error",
                        "path": "/api/mcp/activate",
                        "data": {
                            "errors": [
                                {
                                    "field": "body.config",
                                    "message": "field required",
                                    "type": "value_error.missing"
                                }
                            ]
                        }
                    }
                }
            }
        },
        500: {
            "model": StandardResponse,
            "description": "Internal Server Error",
            "content": {
                "application/json": {
                    "example": {
                        "status_code": 500,
                        "status": False,
                        "message": "Internal server error",
                        "path": "/api/mcp/activate",
                        "data": None
                    }
                }
            }
        }
    }
)
async def activate_mcp_config(request: MCPConfigRequest, req: Request):
    """Activate MCP configuration and create agent."""
    try:
        config = request.config
        if not config or "mcpServers" not in config:
            return JSONResponse(
                status_code=400,
                content=StandardResponse(
                    status_code=400,
                    status=False,
                    message="Invalid configuration. mcpServers is required.",
                    path=str(req.url.path),
                    data=None
                ).dict()
            )

        # Substitute environment variables in config
        config = substitute_env_vars(config)

        # Create MCP client
        client = MCPClient.from_dict(config)

        # Create LLM
        api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
        if not api_key:
            return JSONResponse(
                status_code=500,
                content=StandardResponse(
                    status_code=500,
                    status=False,
                    message="Missing OPENROUTER_API_KEY or OPENAI_API_KEY in environment.",
                    path=str(req.url.path),
                    data=None
                ).dict()
            )

        llm = ChatOpenAI(
            model="openai/gpt-4o-mini",
            api_key=api_key,
            base_url=os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
        )

        # Create agent
        agent = MCPAgent(llm=llm, client=client, max_steps=100)

        # Store agent and client with session ID
        session_id = request.sessionId or f"session-{int(time.time() * 1000)}"
        active_agents[session_id] = agent
        active_clients[session_id] = client

        # Get available tools
        server_names = list(config["mcpServers"].keys())

        response_data = ActivateResponseData(
            sessionId=session_id,
            servers=server_names,
            message="Configuration activated successfully!"
        )

        return StandardResponse(
            status_code=200,
            status=True,
            message="Configuration activated successfully!",
            path=str(req.url.path),
            data=response_data
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content=StandardResponse(
                status_code=500,
                status=False,
                message=str(e),
                path=str(req.url.path),
                data=None
            ).dict()
        )


@app.post(
    "/api/mcp/query",
    response_model=StandardResponse,
    status_code=status.HTTP_200_OK,
    responses={
        400: {
            "model": StandardResponse,
            "description": "Bad Request",
            "content": {
                "application/json": {
                    "example": {
                        "status_code": 400,
                        "status": False,
                        "message": "Query is required",
                        "path": "/api/mcp/query",
                        "data": None
                    }
                }
            }
        },
        404: {
            "model": StandardResponse,
            "description": "Not Found",
            "content": {
                "application/json": {
                    "example": {
                        "status_code": 404,
                        "status": False,
                        "message": "Session not found. Please activate configuration first.",
                        "path": "/api/mcp/query",
                        "data": None
                    }
                }
            }
        },
        422: {
            "model": StandardResponse,
            "description": "Validation Error",
            "content": {
                "application/json": {
                    "example": {
                        "status_code": 422,
                        "status": False,
                        "message": "Validation error",
                        "path": "/api/mcp/query",
                        "data": {
                            "errors": [
                                {
                                    "field": "body.query",
                                    "message": "field required",
                                    "type": "value_error.missing"
                                }
                            ]
                        }
                    }
                }
            }
        },
        500: {
            "model": StandardResponse,
            "description": "Internal Server Error",
            "content": {
                "application/json": {
                    "example": {
                        "status_code": 500,
                        "status": False,
                        "message": "Internal server error",
                        "path": "/api/mcp/query",
                        "data": None
                    }
                }
            }
        }
    }
)
async def run_mcp_query(request: QueryRequest, req: Request):
    """Run a query through the MCP agent."""
    try:
        if not request.query:
            return JSONResponse(
                status_code=400,
                content=StandardResponse(
                    status_code=400,
                    status=False,
                    message="Query is required",
                    path=str(req.url.path),
                    data=None
                ).dict()
            )

        if not request.sessionId:
            return JSONResponse(
                status_code=400,
                content=StandardResponse(
                    status_code=400,
                    status=False,
                    message="Session ID is required. Please activate configuration first.",
                    path=str(req.url.path),
                    data=None
                ).dict()
            )

        agent = active_agents.get(request.sessionId)
        if not agent:
            return JSONResponse(
                status_code=404,
                content=StandardResponse(
                    status_code=404,
                    status=False,
                    message="Session not found. Please activate configuration first.",
                    path=str(req.url.path),
                    data=None
                ).dict()
            )

        # Run the query
        result = await agent.run(request.query)

        response_data = QueryResponseData(result=result)

        return StandardResponse(
            status_code=200,
            status=True,
            message="Query executed successfully",
            path=str(req.url.path),
            data=response_data
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content=StandardResponse(
                status_code=500,
                status=False,
                message=str(e),
                path=str(req.url.path),
                data=None
            ).dict()
        )


@app.get(
    "/health",
    response_model=StandardResponse,
    status_code=status.HTTP_200_OK,
    responses={
        500: {
            "model": StandardResponse,
            "description": "Internal Server Error",
            "content": {
                "application/json": {
                    "example": {
                        "status_code": 500,
                        "status": False,
                        "message": "Internal server error",
                        "path": "/health",
                        "data": None
                    }
                }
            }
        }
    }
)
async def health_check(req: Request):
    """Health check endpoint."""
    response_data = HealthResponseData(service="MCP Backend Service")
    return StandardResponse(
        status_code=200,
        status=True,
        message="Service is healthy",
        path=str(req.url.path),
        data=response_data
    )


@app.delete(
    "/api/mcp/session/{session_id}",
    response_model=StandardResponse,
    status_code=status.HTTP_200_OK,
    responses={
        404: {
            "model": StandardResponse,
            "description": "Not Found",
            "content": {
                "application/json": {
                    "example": {
                        "status_code": 404,
                        "status": False,
                        "message": "Session not found",
                        "path": "/api/mcp/session/{session_id}",
                        "data": None
                    }
                }
            }
        },
        422: {
            "model": StandardResponse,
            "description": "Validation Error",
            "content": {
                "application/json": {
                    "example": {
                        "status_code": 422,
                        "status": False,
                        "message": "Validation error",
                        "path": "/api/mcp/session/{session_id}",
                        "data": {
                            "errors": [
                                {
                                    "field": "path.session_id",
                                    "message": "field required",
                                    "type": "value_error.missing"
                                }
                            ]
                        }
                    }
                }
            }
        },
        500: {
            "model": StandardResponse,
            "description": "Internal Server Error",
            "content": {
                "application/json": {
                    "example": {
                        "status_code": 500,
                        "status": False,
                        "message": "Internal server error",
                        "path": "/api/mcp/session/{session_id}",
                        "data": None
                    }
                }
            }
        }
    }
)
async def clear_session(session_id: str, req: Request):
    """Clear a session and its associated agent/client."""
    try:
        if session_id in active_agents:
            del active_agents[session_id]
        if session_id in active_clients:
            del active_clients[session_id]
        
        response_data = SessionClearResponseData(message=f"Session {session_id} cleared")
        return StandardResponse(
            status_code=200,
            status=True,
            message=f"Session {session_id} cleared successfully",
            path=str(req.url.path),
            data=response_data
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content=StandardResponse(
                status_code=500,
                status=False,
                message=str(e),
                path=str(req.url.path),
                data=None
            ).dict()
        )


@app.get(
    "/api/mcp/sessions",
    response_model=StandardResponse,
    status_code=status.HTTP_200_OK,
    responses={
        500: {
            "model": StandardResponse,
            "description": "Internal Server Error",
            "content": {
                "application/json": {
                    "example": {
                        "status_code": 500,
                        "status": False,
                        "message": "Internal server error",
                        "path": "/api/mcp/sessions",
                        "data": None
                    }
                }
            }
        }
    }
)
async def list_sessions(req: Request):
    """List all active sessions."""
    response_data = SessionListResponseData(
        sessions=list(active_agents.keys()),
        count=len(active_agents)
    )
    return StandardResponse(
        status_code=200,
        status=True,
        message="Sessions retrieved successfully",
        path=str(req.url.path),
        data=response_data
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

