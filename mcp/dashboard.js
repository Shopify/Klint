#!/usr/bin/env node

/**
 * Klint MCP Dashboard - Web interface for monitoring and testing MCP tools
 */

import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, "dist", "index.js");

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Add security headers
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdn.socket.io; " +
    "style-src 'self' 'unsafe-inline'; " +
    "connect-src 'self' ws://localhost:* wss://localhost:*; " +
    "img-src 'self' data:; " +
    "font-src 'self';"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(express.static("dashboard-ui"));

// Store for statistics and logs
let stats = {
  totalCalls: 0,
  toolCalls: {
    "how-do-i": 0,
    explain: 0,
    debug: 0,
    "ship-it": 0,
  },
  recentCalls: [],
  serverHealth: "unknown",
  uptime: Date.now(),
};

// Test MCP server connection
async function testMCPConnection() {
  return new Promise((resolve) => {
    if (!existsSync(serverPath)) {
      stats.serverHealth = "not-built";
      resolve(false);
      return;
    }

    const testServer = spawn("node", [serverPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let responded = false;
    const timeout = setTimeout(() => {
      if (!responded) {
        testServer.kill();
        stats.serverHealth = "timeout";
        resolve(false);
      }
    }, 5000);

    testServer.stdout.once("data", () => {
      responded = true;
      clearTimeout(timeout);
      testServer.kill();
      stats.serverHealth = "healthy";
      resolve(true);
    });

    testServer.stderr.once("data", () => {
      responded = true;
      clearTimeout(timeout);
      testServer.kill();
      stats.serverHealth = "error";
      resolve(false);
    });

    // Send initialization message
    testServer.stdin.write(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "dashboard-health-check", version: "1.0.0" },
        },
      }) + "\n"
    );

    testServer.stdin.end();
  });
}

// Call MCP tool
async function callMCPTool(toolName, args) {
  return new Promise((resolve, reject) => {
    const mcpServer = spawn("node", [serverPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let responses = [];
    let buffer = "";
    let hasError = false;

    mcpServer.stdout.on("data", (data) => {
      buffer += data.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (line.trim()) {
          try {
            const response = JSON.parse(line);
            responses.push(response);
          } catch (e) {
            // Ignore non-JSON lines
          }
        }
      }
    });

    mcpServer.stderr.on("data", (data) => {
      hasError = true;
      reject(new Error(data.toString()));
    });

    mcpServer.on("close", (code) => {
      if (!hasError) {
        const toolResponse = responses.find((r) => r.id === 2);
        if (toolResponse?.result?.content?.[0]?.text) {
          resolve(toolResponse.result.content[0].text);
        } else if (toolResponse?.error) {
          reject(new Error(toolResponse.error.message));
        } else {
          reject(new Error("No valid response from MCP server"));
        }
      }
    });

    // Send messages
    const messages = [
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "dashboard-client", version: "1.0.0" },
        },
      },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: toolName, arguments: args },
      },
    ];

    messages.forEach((message) => {
      mcpServer.stdin.write(JSON.stringify(message) + "\n");
    });

    mcpServer.stdin.end();

    setTimeout(() => {
      mcpServer.kill();
      reject(new Error("Tool call timeout"));
    }, 15000);
  });
}

// Routes
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "dashboard-ui", "index.html"));
});

app.get("/api/stats", (req, res) => {
  res.json({
    ...stats,
    uptime: Date.now() - stats.uptime,
  });
});

app.get("/api/health", async (req, res) => {
  const isHealthy = await testMCPConnection();
  res.json({
    healthy: isHealthy,
    status: stats.serverHealth,
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/tools/:toolName", async (req, res) => {
  const { toolName } = req.params;
  const args = req.body;

  try {
    const startTime = Date.now();
    const result = await callMCPTool(toolName, args);
    const duration = Date.now() - startTime;

    // Update stats
    stats.totalCalls++;
    stats.toolCalls[toolName] = (stats.toolCalls[toolName] || 0) + 1;
    stats.recentCalls.unshift({
      tool: toolName,
      args,
      duration,
      timestamp: new Date().toISOString(),
      success: true,
    });

    // Keep only last 50 calls
    stats.recentCalls = stats.recentCalls.slice(0, 50);

    // Broadcast to connected clients
    io.emit("toolCall", {
      tool: toolName,
      success: true,
      duration,
      result: result.substring(0, 200) + "...",
    });

    io.emit("statsUpdate", stats);

    res.json({
      success: true,
      result,
      duration,
    });
  } catch (error) {
    stats.totalCalls++;
    stats.recentCalls.unshift({
      tool: toolName,
      args,
      error: error.message,
      timestamp: new Date().toISOString(),
      success: false,
    });

    stats.recentCalls = stats.recentCalls.slice(0, 50);

    io.emit("toolCall", {
      tool: toolName,
      success: false,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Socket.IO for real-time updates
io.on("connection", (socket) => {
  console.log("Dashboard client connected");

  // Send current stats
  socket.emit("statsUpdate", stats);

  // Send health status
  testMCPConnection().then((healthy) => {
    socket.emit("healthUpdate", {
      healthy,
      status: stats.serverHealth,
    });
  });

  socket.on("disconnect", () => {
    console.log("Dashboard client disconnected");
  });
});

// Periodic health checks
setInterval(async () => {
  const wasHealthy = stats.serverHealth === "healthy";
  const isHealthy = await testMCPConnection();

  if (wasHealthy !== isHealthy) {
    io.emit("healthUpdate", {
      healthy: isHealthy,
      status: stats.serverHealth,
    });
  }
}, 30000); // Check every 30 seconds

// Start server
server.listen(PORT, () => {
  console.log(`🎨 Klint MCP Dashboard running at http://localhost:${PORT}`);
  console.log(`📊 Monitor your MCP server health and test tools interactively`);

  // Initial health check
  testMCPConnection().then((healthy) => {
    console.log(`🔍 MCP Server Status: ${stats.serverHealth}`);
  });
});
