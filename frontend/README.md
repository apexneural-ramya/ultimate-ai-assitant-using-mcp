# MCP AI Assistant - Next.js Frontend

This is the Next.js frontend for the MCP-powered AI Assistant.

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file in the `frontend` directory:
   ```env
   BACKEND_URL=http://localhost:8000
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000)

## Architecture

- **Frontend**: Next.js 14 with React components
- **Backend**: Python FastAPI service (see `backend_service.py` in root)
- **API Routes**: Next.js API routes proxy requests to the Python backend

## Project Structure

```
frontend/
├── app/
│   ├── api/
│   │   └── mcp/
│   │       ├── activate/
│   │       │   └── route.ts    # Proxy to Python backend
│   │       └── query/
│   │           └── route.ts     # Proxy to Python backend
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Main page
├── components/
│   ├── ChatInterface.tsx        # Chat UI component
│   └── MCPConfigSidebar.tsx     # Configuration sidebar
└── package.json
```

## Running the Full Stack

1. **Start Python Backend** (in project root):
   ```bash
   uvicorn backend_service:app --reload --port 8000
   ```

2. **Start Next.js Frontend** (in frontend directory):
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

