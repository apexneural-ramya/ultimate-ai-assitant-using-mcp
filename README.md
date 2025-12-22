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

## Quick Start Guide

Follow these steps to get the project up and running:

### Step 1: Clone the Repository (if applicable)

```bash
git clone <repository-url>
cd ultimate-ai-assitant-using-mcp
```

### Step 2: Install Python Dependencies

**Option A: Using uv (Recommended)**

```bash
# Install uv if you haven't already
# Windows (PowerShell):
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
# Linux/Mac:
curl -LsSf https://astral.sh/uv/install.sh | sh

# Navigate to backend directory and install all Python dependencies
cd backend
uv sync
cd ..
```

**Option B: Using pip and venv**

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Note: Keep the virtual environment activated while working in backend directory
# To deactivate later, just type: deactivate
```

**Required Python packages:**
- fastapi - Web framework
- uvicorn - ASGI server
- python-dotenv - Environment variable management
- langchain-openai - OpenAI/OpenRouter LLM integration
- langchain-ollama - Ollama LLM integration (optional, for local LLMs)
- mcp-use - MCP protocol implementation
- orjson - Fast JSON library (required for Python 3.12 compatibility)

### Step 3: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

**Note**: Make sure you have Node.js 18+ installed. Check with `node --version`.

### Step 4: Set Up Environment Variables

#### 4.1: Backend Environment Variables

**Create `.env` file in the `backend` directory:**

```bash
# Navigate to backend directory
cd backend

# Copy the example file
cp .env.example .env

# OR create manually
# Windows (PowerShell):
Copy-Item .env.example .env
# Linux/Mac:
cp .env.example .env

# Return to root
cd ..
```

**Edit `.env` file and fill in your API keys:**

```env
# ============================================
# REQUIRED: Backend Server Configuration
# ============================================
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:3000

# ============================================
# REQUIRED: LLM Configuration
# ============================================
# Option 1: Use OpenRouter (recommended)
OPENROUTER_API_KEY=your-openrouter-api-key-here

# Option 2: Use OpenAI directly (uncomment if using)
# OPENAI_API_KEY=your-openai-api-key-here

# ============================================
# OPTIONAL: LLM Model Configuration
# ============================================
LLM_MODEL=openai/gpt-4o-mini
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
MCP_MAX_STEPS=100

# ============================================
# REQUIRED: MCP Server API Keys
# ============================================
FIRECRAWL_API_KEY=your-firecrawl-api-key-here
RAGIE_API_KEY=your-ragie-api-key-here
```

#### 4.2: Frontend Environment Variables

**Create `.env.local` file in the `frontend` directory:**

```bash
cd frontend

# Copy the example file
cp .env.example .env.local

# OR create manually
# Windows (PowerShell):
Copy-Item .env.example .env.local
# Linux/Mac:
cp .env.example .env.local

cd ..
```

**Edit `frontend/.env.local` file:**

```env
BACKEND_URL=http://localhost:8000
```

**Note**: If you change the backend port in `backend/.env`, make sure to update `BACKEND_URL` in `frontend/.env.local` accordingly.

#### 4.3: Get Your API Keys

You need to obtain API keys from the following services:

1. **OpenRouter API Key** (for LLM):
   - Sign up at [OpenRouter](https://openrouter.ai/)
   - Go to [API Keys](https://openrouter.ai/keys)
   - Create a new API key
   - Copy and paste it into `backend/.env` as `OPENROUTER_API_KEY`

2. **Firecrawl API Key** (for web scraping):
   - Sign up at [Firecrawl](https://firecrawl.dev/)
   - Go to your dashboard
   - Create a new API key
   - Copy and paste it into `backend/.env` as `FIRECRAWL_API_KEY`

3. **Ragie API Key** (for multimodal RAG):
   - Sign up at [Ragie](https://ragie.ai/)
   - Go to your dashboard
   - Create a new API key
   - Copy and paste it into `backend/.env` as `RAGIE_API_KEY`

### Step 5: Start the Backend Server

**Open Terminal 1 (or Command Prompt/PowerShell):**

⚠️ **IMPORTANT**: Always use `uv run` to ensure the correct virtual environment is used!

**Using uv (Recommended):**

```bash
# Make sure you're in the project root directory
cd ultimate-ai-assitant-using-mcp

# Start the backend server
# The host and port are read from BACKEND_HOST and BACKEND_PORT in backend/.env
uv run uvicorn backend.backend_service:app --reload --host ${BACKEND_HOST:-0.0.0.0} --port ${BACKEND_PORT:-8000}
```

**OR if you've activated the virtual environment manually:**

```bash
# Navigate to backend directory
cd backend

# First activate the virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Then run uvicorn (from backend directory, use relative import)
# Make sure BACKEND_HOST and BACKEND_PORT are set in backend/.env
uvicorn backend_service:app --reload --host 0.0.0.0 --port 8000
```

**Verify Backend is Running:**

You should see output like:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Test the Backend:**

- Open your browser and visit: http://localhost:8000/health
- You should see: `{"status":"healthy"}`
- API Documentation: http://localhost:8000/docs

**Note**: If you see `ModuleNotFoundError: No module named 'mcp_use'`, you're not using the correct virtual environment. Use `uv run` instead!

### Step 6: Start the Frontend Server

**Open Terminal 2 (a new terminal window):**

```bash
# Navigate to the frontend directory
cd frontend

# Start the Next.js development server
npm run dev
```

**Verify Frontend is Running:**

You should see output like:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - ready started server on 0.0.0.0:3000
```

**Access the Application:**

- Open your browser and visit: http://localhost:3000
- You should see the MCP AI Assistant interface

### Step 7: Verify Everything is Working

1. **Check Backend Health:**
   - Visit: http://localhost:8000/health
   - Should return: `{"status":"healthy"}`

2. **Check Frontend:**
   - Visit: http://localhost:3000
   - Should show the chat interface

3. **Check API Documentation:**
   - Visit: http://localhost:8000/docs
   - Should show Swagger UI with all available endpoints

### Step 8: Configure and Use the Application

1. **Configure MCP Servers:**
   - In the sidebar, click "Load Example Config" to see a sample configuration
   - The example uses environment variable placeholders like `${FIRECRAWL_API_KEY}`
   - Click "Activate Configuration" to initialize the MCP client
   - You should see: "✅ Configuration activated successfully!"

2. **Start Chatting:**
   - Type a question in the chat input
   - Example: "What tools do you have from MCP?"
   - The AI will use Firecrawl and Ragie MCP tools to respond

## Complete Startup Checklist

Use this checklist to ensure everything is set up correctly:

- [ ] Python 3.12+ installed
- [ ] Node.js 18+ installed
- [ ] `uv` installed (or using pip/venv)
- [ ] Python dependencies installed (`cd backend && uv sync` or `cd backend && pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] `.env` file created in `backend/` directory with all required variables
- [ ] `frontend/.env.local` file created with `BACKEND_URL`
- [ ] OpenRouter API key obtained and added to `backend/.env`
- [ ] Firecrawl API key obtained and added to `backend/.env`
- [ ] Ragie API key obtained and added to `backend/.env`
- [ ] Backend server running (Terminal 1)
- [ ] Frontend server running (Terminal 2)
- [ ] Backend health check passes (http://localhost:8000/health)
- [ ] Frontend accessible (http://localhost:3000)
- [ ] MCP configuration activated successfully

## Usage

Once both servers are running (see Step 7 above), follow these steps to use the application:

### 1. Open the Application

Navigate to http://localhost:3000 in your web browser.

### 2. Configure MCP Servers

1. In the sidebar on the left, you'll see the "MCP Configuration" section
2. Click "Load Example Config" button to load a pre-configured example, OR
3. Paste your MCP configuration JSON directly into the text area:

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

**Note**: The `${FIRECRAWL_API_KEY}` and `${RAGIE_API_KEY}` placeholders will be automatically replaced with values from your `backend/.env` file.

4. Click "Activate Configuration" button to initialize the MCP client
5. Wait for the success message: "✅ Configuration activated successfully!"
6. You should see "✅ MCP Client Active" and "✅ Agent Ready" status indicators in the sidebar

### 3. Chat with MCP Tools

1. Once the configuration is activated, the chat interface will be ready
2. Type your question or request in the chat input at the bottom of the screen
3. Press Enter or click the send button
4. The AI agent will use the appropriate MCP tools to respond:
   - **Firecrawl**: For web scraping and content extraction
   - **Ragie**: For multimodal RAG (Retrieval-Augmented Generation)

**Example Queries:**
- "What tools do you have from MCP?"
- "Scrape the content from https://example.com"
- "Search my documents for information about AI"
- "What can you do with Firecrawl?"
- "Help me find information about machine learning"

### 4. Clear Configuration

To reset the configuration and start fresh:
- Click "Clear Chat & Config" button in the sidebar
- This will clear the chat history and reset the MCP configuration
- You'll need to activate the configuration again before chatting

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
├── backend/                       # Backend Python service
│   ├── __init__.py                # Backend package init
│   ├── backend_service.py         # FastAPI backend service
│   ├── server.py                  # Standalone Python script (alternative)
│   ├── .env                       # Backend environment variables
│   ├── .env.example               # Example environment variables
│   ├── pyproject.toml             # Python project configuration
│   ├── requirements.txt           # Python dependencies (alternative)
│   ├── uv.lock                    # uv lock file
│   └── .venv/                     # Python virtual environment (if using pip/venv)
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
- Use `uv run uvicorn backend.backend_service:app --reload --port 8000` from project root
- OR activate the virtual environment first:
  ```bash
  # Navigate to backend directory
  cd backend
  
  # Windows
  .venv\Scripts\activate
  # Linux/Mac
  source .venv/bin/activate
  
  # Then run (from backend directory)
  uvicorn backend_service:app --reload --port 8000
  ```

**Problem: Backend won't start**

**Solution:**
- Ensure all dependencies are installed: `cd backend && uv sync` or `cd backend && pip install -r requirements.txt`
- Check that port 8000 is not already in use
- Verify your `backend/.env` file exists and has the required API keys

**Problem: `orjson` compilation errors (Python 3.12)**

**Solution:**
- The `requirements.txt` and `pyproject.toml` already include `orjson>=3.10.0` which is compatible with Python 3.12
- If you still get compilation errors, try:
  ```bash
  cd backend
  pip install "orjson>=3.10.0" --upgrade
  pip install -r requirements.txt
  ```
- Or use `uv` which handles this automatically: `cd backend && uv sync`

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
- Verify your API keys are correct in the `backend/.env` file
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

### Backend (backend/.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `BACKEND_HOST` | **Yes** | Backend server host (must be set) |
| `BACKEND_PORT` | **Yes** | Backend server port (must be set) |
| `FRONTEND_URL` | **Yes** | Frontend URL for CORS (must be set) |
| `OPENROUTER_API_KEY` | Yes* | OpenRouter API key for LLM access |
| `OPENAI_API_KEY` | Yes* | Alternative to OpenRouter (use one) |
| `LLM_MODEL` | No | LLM model name (default: openai/gpt-4o-mini) |
| `OPENROUTER_BASE_URL` | No | OpenRouter API base URL (default: https://openrouter.ai/api/v1) |
| `MCP_MAX_STEPS` | No | Maximum steps for MCP agent (default: 100) |
| `FIRECRAWL_API_KEY` | Yes | Firecrawl API key for web scraping |
| `RAGIE_API_KEY` | Yes | Ragie API key for multimodal RAG |

*Either `OPENROUTER_API_KEY` or `OPENAI_API_KEY` is required

### Frontend (.env.local)

| Variable | Required | Description |
|----------|----------|-------------|
| `BACKEND_URL` | **Yes** | Backend API URL (must be set, no default) |

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


