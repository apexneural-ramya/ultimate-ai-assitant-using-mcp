import asyncio
import os
from dotenv import load_dotenv
from langchain_ollama import ChatOllama
from langchain_openai import ChatOpenAI
from mcp_use import MCPAgent, MCPClient
import mcp_use
import warnings

warnings.filterwarnings("ignore")
mcp_use.set_debug(0)

async def main():
    # Load environment variables from backend .env file
    load_dotenv()

    # Create configuration dictionary (only Firecrawl and Ragie MCP servers)
    config = {
      "mcpServers": {
        "mcp-server-firecrawl": {
            "command": "npx",
            "args": ["-y", "firecrawl-mcp"],
            "env": {
                    "FIRECRAWL_API_KEY": os.getenv("FIRECRAWL_API_KEY"),
                },
          },
          "ragie": {
            "command": "npx",
            "args": [
              "-y",
              "@ragieai/mcp-server",
              "--partition",
                    "default",
            ],
            "env": {
                    "RAGIE_API_KEY": os.getenv("RAGIE_API_KEY"),
                },
            },
      }
    }

    # Create MCPClient from configuration dictionary
    client = MCPClient.from_dict(config)

    # Create LLM
    llm_model = os.getenv("LLM_MODEL", "openai/gpt-4o-mini")
    api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
    llm_base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    max_steps = int(os.getenv("MCP_MAX_STEPS", "100"))
    
    # llm = ChatOllama(model="qwen3:1.7b")
    llm = ChatOpenAI(
        model=llm_model,
        api_key=api_key,
        base_url=llm_base_url,
    )
    # Create agent with the client
    agent = MCPAgent(llm=llm, client=client, max_steps=max_steps)

    
    prompt = "What tools do you have from MCP?"

    # Run the query
    result = await agent.run(prompt)

    print(f"\nResult: {result}")

if __name__ == "__main__":
    asyncio.run(main())