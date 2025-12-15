# MCP-powered Ultimate AI Assistant

A Streamlit application that provides a chat interface for interacting with MCP (Model Context Protocol) servers. This app allows you to configure multiple MCP servers and chat with them using natural language.

Tech stack:
Tech stack:
- [mcp-use](https://github.com/mcp-use/mcp-use) to connect LLM to MCP servers
- [Firecrawl MCP](https://github.com/mendableai/firecrawl-mcp-server) for scraping
- [Ragie MCP](https://github.com/ragieai/ragie-mcp-server) for multimodal RAG

## Setup

1. **Install Dependencies**: 
   ```bash
   uv sync 
   ```

2. **Environment Variables**:
   Create a `.env` file with your API keys:
   ```env
OPENROUTER_API_KEY=your-openrouter-api-key
   FIRECRAWL_API_KEY=your-firecrawl-api-key
   RAGIE_API_KEY=your-ragie-api-key
# Optional: override if you self-host the proxy
# OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
# Example model for OpenRouter: openai/gpt-4o-mini
   ```

3. **Setup MCP Servers**

    3. **Setup MCP Servers**

   The default Python `server.py` and Streamlit app are configured to use **Firecrawl** and **Ragie** MCP servers only.

3. **Run the App**:
   ```bash
   streamlit run mcp_streamlit_app.py
   ```

## Usage

1. **Configure MCP Servers**:
   - Use the sidebar to enter your MCP server configuration in JSON format
   - Click "Load Example Config" to see a sample configuration
   - Click "Activate Configuration" to initialize the MCP client

2. **Chat with MCP Tools**:
   - Once configured, use the chat interface to interact with your MCP servers
   - Ask questions about available tools or request specific actions
   - The agent will use the appropriate MCP tools to respond

## Example Configuration

## Example Configuration
set keys in env
{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "${FIRECRAWL_API_KEY}"
      }
    },
    "ragie": {
      "command": "npx",
      "args": ["-y", "@ragieai/mcp-server", "--partition", "default"],
      "env": {
        "RAGIE_API_KEY": "${RAGIE_API_KEY}"
      }
    }
  }
}


