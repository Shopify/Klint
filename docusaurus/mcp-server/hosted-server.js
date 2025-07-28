#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { WebSocketServerTransport } from '@modelcontextprotocol/sdk/server/websocket.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { KlintContext } from './dist/context.js';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

// Initialize Klint context for accessing documentation and examples
const klintContext = new KlintContext();

// Define the MCP server
const mcpServer = new Server(
  {
    name: 'klint-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tool schemas
const KlintPatternsSchema = z.object({
  task: z.string().describe('The creative coding task or visual effect you want to achieve'),
  context: z.string().optional().describe('Additional context about your project or constraints'),
});

const ExplainSchema = z.object({
  function: z.string().describe('The Klint function name to explain'),
  includeExamples: z.boolean().default(true).describe('Whether to include code examples'),
});

const DebugSchema = z.object({
  code: z.string().describe('The Klint code that needs debugging or optimization'),
  issue: z.string().optional().describe('Description of the problem you\'re experiencing'),
});

const ShipItSchema = z.object({
  code: z.string().describe('The Klint sketch code to prepare for production'),
  target: z.enum(['react-component', 'standalone', 'npm-package']).default('react-component').describe('Target deployment format'),
});

// Define tools
const tools: Tool[] = [
  {
    name: 'klint-patterns',
    description: 'Convert a creative coding task into actionable Klint code patterns and functions',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'The creative coding task or visual effect you want to achieve',
        },
        context: {
          type: 'string',
          description: 'Additional context about your project or constraints',
        },
      },
      required: ['task'],
    },
  },
  {
    name: 'explain',
    description: 'Explain Klint functions with examples and creative possibilities',
    inputSchema: {
      type: 'object',
      properties: {
        function: {
          type: 'string',
          description: 'The Klint function name to explain',
        },
        includeExamples: {
          type: 'boolean',
          description: 'Whether to include code examples',
          default: true,
        },
      },
      required: ['function'],
    },
  },
  {
    name: 'debug',
    description: 'Enhanced debugging and optimization help for Klint sketches',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The Klint code that needs debugging or optimization',
        },
        issue: {
          type: 'string',
          description: 'Description of the problem you\'re experiencing',
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'ship-it',
    description: 'Bundle and prepare Klint sketches for production deployment',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The Klint sketch code to prepare for production',
        },
        target: {
          type: 'string',
          enum: ['react-component', 'standalone', 'npm-package'],
          description: 'Target deployment format',
          default: 'react-component',
        },
      },
      required: ['code'],
    },
  },
];

// Tool handlers
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'klint-patterns': {
        const { task, context } = KlintPatternsSchema.parse(args);
        const result = await klintContext.howDoI(task, context);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'explain': {
        const { function: functionName, includeExamples } = ExplainSchema.parse(args);
        const result = await klintContext.explain(functionName, includeExamples);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'debug': {
        const { code, issue } = DebugSchema.parse(args);
        const result = await klintContext.debug(code, issue);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'ship-it': {
        const { code, target } = ShipItSchema.parse(args);
        const result = await klintContext.shipIt(code, target);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${message}`,
        },
      ],
      isError: true,
    };
  }
});

// Create HTTP server
const httpServer = createServer();
const PORT = process.env.MCP_PORT || 3457;

// Create WebSocket server
const wss = new WebSocketServer({ 
  server: httpServer,
  path: '/mcp'
});

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('New MCP client connected');
  
  const transport = new WebSocketServerTransport(ws);
  mcpServer.connect(transport);
  
  ws.on('close', () => {
    console.log('MCP client disconnected');
  });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Klint MCP Server running at ws://localhost:${PORT}/mcp`);
  console.log('Ready to accept WebSocket connections');
});