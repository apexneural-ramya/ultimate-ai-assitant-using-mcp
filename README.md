# MCP-powered Ultimate AI Assistant

A Next.js frontend application that provides a chat interface for interacting with MCP (Model Context Protocol) servers. This app allows you to configure multiple MCP servers and chat with them using natural language.

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) with React and TypeScript
- **Backend**: Python [FastAPI](https://fastapi.tiangolo.com/) service
- [mcp-use](https://github.com/mcp-use/mcp-use) to connect LLM to MCP servers
- [Firecrawl MCP](https://github.com/mendableai/firecrawl-mcp-server) for scraping
- [Ragie MCP](https://github.com/ragieai/ragie-mcp-server) for multimodal RAG

## Prerequisites

Before starting, ensure you have the following installed:

- **Python 3.12+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 18+** and **npm** - [Download Node.js](https://nodejs.org/)
- **uv** package manager (recommended) - [Install uv](https://github.com/astral-sh/uv)
  - OR use `pip` and `venv` as alternatives
- **Git** (optional, for cloning the repository)

## Installation & Setup

### Step 1: Clone the Repository (if applicable)

```bash
git clone <repository-url>
cd ultimate-ai-assitant-using-mcp
```

### Step 2: Install Python Dependencies

**Option A: Using uv (Recommended)**

```bash
uv sync
```

**Option B: Using pip**

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Required Python packages:**
- fastapi
- uvicorn
- python-dotenv
- langchain-openai
- mcp-use

### Step 3: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Step 4: Set Up Environment Variables

**Backend Environment Variables**

Create a `.env` file in the project root directory:

```env
# LLM Configuration (OpenRouter or OpenAI)
OPENROUTER_API_KEY=your-openrouter-api-key-here
# Optional: Use OpenAI directly instead
# OPENAI_API_KEY=your-openai-api-key-here

# Optional: Override OpenRouter base URL if self-hosting
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# MCP Server API Keys
FIRECRAWL_API_KEY=your-firecrawl-api-key-here
RAGIE_API_KEY=your-ragie-api-key-here
```

**Frontend Environment Variables**

Create a `.env.local` file in the `frontend` directory:

```env
BACKEND_URL=http://localhost:8000
```

**Getting API Keys:**

1. **OpenRouter API Key**: Sign up at [OpenRouter](https://openrouter.ai/) and get your API key
2. **Firecrawl API Key**: Sign up at [Firecrawl](https://firecrawl.dev/) and get your API key
3. **Ragie API Key**: Sign up at [Ragie](https://ragie.ai/) and get your API key

### Step 5: Run the Application

You need to run both the backend and frontend servers simultaneously.

**Terminal 1 - Start Python Backend:**

⚠️ **IMPORTANT**: Always use `uv run` to ensure the correct virtual environment is used!

```bash
# Using uv (REQUIRED - ensures correct virtual environment)
uv run uvicorn backend_service:app --reload --port 8000
```

**OR if you've activated the virtual environment manually:**

```bash
# First activate the virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Then run uvicorn
uvicorn backend_service:app --reload --port 8000
```

**Note**: If you see `ModuleNotFoundError: No module named 'mcp_use'`, you're not using the correct virtual environment. Use `uv run` instead!

The backend will be available at:
- **API**: http://localhost:8000
- **API Documentation (Swagger)**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

**Terminal 2 - Start Next.js Frontend:**

```bash
cd frontend
npm run dev
```

The frontend will be available at:
- **Application**: http://localhost:3000

## Usage

### 1. Configure MCP Servers

1. Open http://localhost:3000 in your browser
2. In the sidebar, you'll see the "MCP Configuration" section
3. Click "Load Example Config" to see a sample configuration, OR
4. Paste your MCP configuration JSON directly into the text area:

```json
{
  "mcpServers": {
    "mcp-server-firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "${FIRECRAWL_API_KEY}"
      }
    },
    "ragie": {
      "command": "npx",
      "args": [
        "-y",
        "@ragieai/mcp-server",
        "--partition",
        "default"
      ],
      "env": {
        "RAGIE_API_KEY": "${RAGIE_API_KEY}"
      }
    }
  }
}
```

5. Click "Activate Configuration" to initialize the MCP client
6. You should see a success message: "✅ Configuration activated successfully!"

### 2. Chat with MCP Tools

1. Once the configuration is activated, you'll see "✅ MCP Client Active" and "✅ Agent Ready" in the sidebar
2. Type your question or request in the chat input at the bottom
3. The AI agent will use the appropriate MCP tools (Firecrawl for web scraping, Ragie for RAG) to respond
4. Example queries:
   - "What tools do you have from MCP?"
   - "Scrape the content from https://example.com"
   - "Search my documents for information about AI"

### 3. Clear Configuration

Click "Clear Chat & Config" in the sidebar to reset the configuration and chat history.

## Project Structure

```
.
├── frontend/                      # Next.js frontend application
│   ├── app/                       # Next.js app directory
│   │   ├── api/                   # API routes (proxies to Python backend)
│   │   │   └── mcp/
│   │   │       ├── activate/      # MCP activation endpoint
│   │   │       └── query/         # MCP query endpoint
│   │   ├── globals.css            # Global styles
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Main page
│   ├── components/                # React components
│   │   ├── ChatInterface.tsx      # Chat UI component
│   │   └── MCPConfigSidebar.tsx   # Configuration sidebar
│   ├── .env.local                 # Frontend environment variables
│   ├── package.json               # Frontend dependencies
│   └── tsconfig.json              # TypeScript configuration
├── backend_service.py             # FastAPI backend service
├── server.py                      # Standalone Python script (alternative)
├── .env                           # Backend environment variables
├── .env.example                   # Example environment variables
├── pyproject.toml                 # Python project configuration
├── requirements.txt                # Python dependencies (alternative)
└── README.md                      # This file
```

## API Response Format

All API endpoints return responses in a standardized format:

```json
{
  "status_code": 200,
  "status": true,
  "message": "Operation successful",
  "path": "/api/mcp/activate",
  "data": {
    // Response-specific data
  }
}
```

**Success Response Example:**
```json
{
  "status_code": 200,
  "status": true,
  "message": "Configuration activated successfully!",
  "path": "/api/mcp/activate",
  "data": {
    "sessionId": "session-1234567890",
    "servers": ["mcp-server-firecrawl", "ragie"],
    "message": "Configuration activated successfully!"
  }
}
```

**Error Response Example:**
```json
{
  "status_code": 422,
  "status": false,
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
```

## Troubleshooting

### Backend Issues

**Problem: `ModuleNotFoundError: No module named 'mcp_use'`**

**Solution:**
- Use `uv run uvicorn backend_service:app --reload --port 8000` instead of just `uvicorn`
- OR activate the virtual environment first:
  ```bash
  # Windows
  .venv\Scripts\activate
  # Linux/Mac
  source .venv/bin/activate
  ```

**Problem: Backend won't start**

**Solution:**
- Ensure all dependencies are installed: `uv sync` or `pip install -r requirements.txt`
- Check that port 8000 is not already in use
- Verify your `.env` file exists and has the required API keys

**Problem: Validation errors in API**

**Solution:**
- Ensure your MCP configuration JSON is valid
- Check that all required fields are present in the request
- Verify environment variables are set correctly

### Frontend Issues

**Problem: Frontend can't connect to backend**

**Solution:**
- Ensure the backend is running on port 8000
- Check that `BACKEND_URL=http://localhost:8000` is in `frontend/.env.local`
- Verify there are no CORS errors in the browser console

**Problem: `npm install` fails**

**Solution:**
- Ensure Node.js 18+ is installed
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- Check your internet connection

**Problem: Configuration activation fails**

**Solution:**
- Verify your API keys are correct in the `.env` file
- Check that the MCP configuration JSON is valid
- Ensure the backend is running and accessible
- Check browser console for error messages

### General Issues

**Problem: MCP servers not responding**

**Solution:**
- Verify your API keys (FIRECRAWL_API_KEY, RAGIE_API_KEY) are valid
- Check that `npx` is available in your PATH
- Ensure you have internet connectivity for MCP server downloads
- Check backend logs for detailed error messages

**Problem: Port already in use**

**Solution:**
- Backend (8000): Change port in the uvicorn command: `--port 8001`
- Frontend (3000): Change port: `npm run dev -- -p 3001`
- Update `BACKEND_URL` in `frontend/.env.local` if you change backend port

## Development

### Running in Development Mode

Both servers support hot-reload:
- Backend: `--reload` flag automatically restarts on code changes
- Frontend: Next.js automatically refreshes on file changes

### API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Testing Endpoints

You can test the API using:
- Swagger UI at `/docs`
- cURL commands
- Postman or similar tools
- The Next.js frontend

Example cURL for activation:
```bash
curl -X POST "http://localhost:8000/api/mcp/activate" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "mcpServers": {
        "mcp-server-firecrawl": {
          "command": "npx",
          "args": ["-y", "firecrawl-mcp"],
          "env": {
            "FIRECRAWL_API_KEY": "your-key"
          }
        }
      }
    }
  }'
```

## Environment Variables Reference

### Backend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes* | OpenRouter API key for LLM access |
| `OPENAI_API_KEY` | Yes* | Alternative to OpenRouter (use one) |
| `OPENROUTER_BASE_URL` | No | OpenRouter API base URL (default: https://openrouter.ai/api/v1) |
| `FIRECRAWL_API_KEY` | Yes | Firecrawl API key for web scraping |
| `RAGIE_API_KEY` | Yes | Ragie API key for multimodal RAG |

*Either `OPENROUTER_API_KEY` or `OPENAI_API_KEY` is required

### Frontend (.env.local)

| Variable | Required | Description |
|----------|----------|-------------|
| `BACKEND_URL` | Yes | Backend API URL (default: http://localhost:8000) |

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [mcp-use Library](https://github.com/mcp-use/mcp-use)
- [Firecrawl MCP](https://github.com/mendableai/firecrawl-mcp-server)
- [Ragie MCP](https://github.com/ragieai/ragie-mcp-server)

## License

[Add your license information here]

## Contributing

[Add contribution guidelines here]


