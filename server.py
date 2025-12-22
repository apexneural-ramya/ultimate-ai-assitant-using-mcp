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
    # Load environment variables
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
    # llm = ChatOllama(model="qwen3:1.7b")
    llm = ChatOpenAI(model="gpt-4o")
    # Create agent with the client
    agent = MCPAgent(llm=llm, client=client, max_steps=100)

    
    prompt = "What tools do you have from MCP?"

    # Run the query
    result = await agent.run(prompt)

    print(f"\nResult: {result}")

if __name__ == "__main__":
    asyncio.run(main())