#!/usr/bin/env node

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3456;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'klint-mcp-server' });
});

// MCP info endpoint
app.get('/api/mcp-info', (req, res) => {
  res.json({
    name: 'klint-mcp',
    version: '1.0.0',
    description: 'MCP server for Klint creative coding framework',
    endpoint: 'wss://klint.art/mcp',
    installation: {
      claude: {
        description: 'Add to Claude Desktop config file',
        config: {
          "mcpServers": {
            "klint": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-websocket", "wss://klint.art/mcp"]
            }
          }
        }
      },
      cursor: {
        description: 'Add to Cursor settings',
        settings: {
          "mcp.servers": {
            "klint": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-websocket", "wss://klint.art/mcp"]
            }
          }
        }
      }
    },
    tools: [
      {
        name: 'klint-patterns',
        description: 'Convert a creative coding task into actionable Klint code patterns and functions'
      },
      {
        name: 'explain',
        description: 'Explain Klint functions with examples and creative possibilities'
      },
      {
        name: 'debug',
        description: 'Enhanced debugging and optimization help for Klint sketches'
      },
      {
        name: 'ship-it',
        description: 'Bundle and prepare Klint sketches for production deployment'
      }
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Klint MCP API server running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`MCP info: http://localhost:${PORT}/api/mcp-info`);
});