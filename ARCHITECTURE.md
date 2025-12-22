# Architecture Overview

This project follows a **clean separation of concerns** with a **FastAPI backend** and **Next.js React frontend**.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (Port 3000)               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  React Components                                        │ │
│  │  - ChatInterface.tsx (Chat UI)                          │ │
│  │  - MCPConfigSidebar.tsx (Configuration UI)              │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Next.js API Routes (Proxy Layer)                       │ │
│  │  - /api/mcp/activate → FastAPI                          │ │
│  │  - /api/mcp/query → FastAPI                              │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP Requests
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              FastAPI Backend (Port 8000)                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  API Endpoints                                           │ │
│  │  - POST /api/mcp/activate                               │ │
│  │  - POST /api/mcp/query                                   │ │
│  │  - GET /health                                           │ │
│  │  - DELETE /api/mcp/session/{id}                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  MCP Agent Management                                    │ │
│  │  - MCPClient creation                                    │ │
│  │  - MCPAgent initialization                               │ │
│  │  - Session management                                    │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ MCP Protocol
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    MCP Servers                               │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  Firecrawl MCP    │  │   Ragie MCP       │               │
│  │  (Web Scraping)   │  │  (Multimodal RAG)│               │
│  └──────────────────┘  └──────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### Frontend (Next.js + React)

**Location**: `frontend/`

- **UI Components**: React components for user interface
  - `ChatInterface.tsx`: Main chat interface with message display
  - `MCPConfigSidebar.tsx`: Sidebar for MCP server configuration

- **API Routes**: Next.js API routes that proxy to FastAPI
  - `app/api/mcp/activate/route.ts`: Proxies activation requests
  - `app/api/mcp/query/route.ts`: Proxies query requests

- **Benefits**:
  - Server-side rendering (SSR) support
  - API route proxying for CORS handling
  - Modern React with TypeScript
  - Responsive UI

### Backend (FastAPI)

**Location**: `backend_service.py`

- **API Endpoints**:
  - `POST /api/mcp/activate`: Creates MCP client and agent
  - `POST /api/mcp/query`: Executes queries through MCP agent
  - `GET /health`: Health check
  - `DELETE /api/mcp/session/{id}`: Clears a session
  - `GET /api/mcp/sessions`: Lists active sessions

- **Responsibilities**:
  - MCP client/agent lifecycle management
  - Session management (in-memory, can be upgraded to Redis)
  - LLM integration (OpenRouter/OpenAI)
  - Error handling and validation

- **Benefits**:
  - Async/await support for MCP operations
  - Automatic API documentation (Swagger UI at `/docs`)
  - Type validation with Pydantic
  - CORS middleware for frontend integration

## Data Flow

1. **Configuration Activation**:
   ```
   User → Next.js UI → Next.js API Route → FastAPI → MCPClient/MCPAgent creation
   ```

2. **Query Execution**:
   ```
   User → Next.js UI → Next.js API Route → FastAPI → MCPAgent → MCP Servers → LLM → Response
   ```

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **React**: UI library

### Backend
- **FastAPI**: Modern Python web framework
- **mcp-use**: MCP protocol implementation
- **langchain-openai**: LLM integration
- **uvicorn**: ASGI server

## Environment Variables

### Backend (`.env` in root)
```env
OPENROUTER_API_KEY=your-key
FIRECRAWL_API_KEY=your-key
RAGIE_API_KEY=your-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

### Frontend (`.env.local` in `frontend/`)
```env
BACKEND_URL=http://localhost:8000
```

## Running the Application

1. **Start Backend**:
   ```bash
   uvicorn backend_service:app --reload --port 8000
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access**:
   - Frontend: http://localhost:3000
   - Backend API Docs: http://localhost:8000/docs
   - Backend Health: http://localhost:8000/health

## Future Improvements

- [ ] Replace in-memory session storage with Redis
- [ ] Add authentication/authorization
- [ ] Add rate limiting
- [ ] Add request logging and monitoring
- [ ] Add WebSocket support for real-time updates
- [ ] Add database for conversation history
- [ ] Add Docker containerization
- [ ] Add CI/CD pipeline

