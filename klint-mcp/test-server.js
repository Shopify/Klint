#!/usr/bin/env node

/**
 * Simple test script for the Klint MCP server
 * This simulates tool calls to verify the server works correctly
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, "dist", "index.js");

function testTool(toolName, args) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Testing tool: ${toolName}`);
    console.log("Args:", JSON.stringify(args, null, 2));

    const server = spawn("node", [serverPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let output = "";
    let errorOutput = "";

    server.stdout.on("data", (data) => {
      output += data.toString();
    });

    server.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    server.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Server exited with code ${code}: ${errorOutput}`));
      } else {
        resolve(output);
      }
    });

    server.on("error", (error) => {
      reject(error);
    });

    // Send MCP messages
    const messages = [
      // Initialize
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: {
            name: "test-client",
            version: "1.0.0",
          },
        },
      },
      // List tools
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
        params: {},
      },
      // Call the specific tool
      {
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: toolName,
          arguments: args,
        },
      },
    ];

    // Send each message
    messages.forEach((message) => {
      server.stdin.write(JSON.stringify(message) + "\n");
    });

    server.stdin.end();

    // Set timeout
    setTimeout(() => {
      server.kill();
      reject(new Error("Test timeout"));
    }, 10000);
  });
}

async function runTests() {
  console.log("🚀 Starting Klint MCP Server Tests\n");

  const tests = [
    {
      name: "klint-patterns",
      args: {
        task: "create animated circles",
        context: "for a loading animation",
      },
    },
    {
      name: "explain",
      args: {
        function: "circle",
        includeExamples: true,
      },
    },
    {
      name: "debug",
      args: {
        code: "ctx.circle(50, 50, 20);",
        issue: "circle not visible",
      },
    },
    {
      name: "ship-it",
      args: {
        code: "export default function Test() { return <div>Test</div>; }",
        target: "react-component",
      },
    },
  ];

  for (const test of tests) {
    try {
      const result = await testTool(test.name, test.args);
      console.log(`✅ ${test.name} test passed`);
      console.log("Response preview:", result.substring(0, 200) + "...");
    } catch (error) {
      console.error(`❌ ${test.name} test failed:`, error.message);
    }
  }

  console.log("\n🏁 Tests completed");
}

// Check if server is built
import { existsSync } from "fs";

if (!existsSync(serverPath)) {
  console.error('❌ Server not built. Run "npm run build" first.');
  process.exit(1);
}

runTests().catch((error) => {
  console.error("Test suite failed:", error);
  process.exit(1);
});
