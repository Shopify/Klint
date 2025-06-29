#!/usr/bin/env node

/**
 * Demo script showing actual MCP server responses
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, "dist", "index.js");

function callTool(toolName, args) {
  return new Promise((resolve, reject) => {
    const server = spawn("node", [serverPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let responses = [];
    let buffer = "";

    server.stdout.on("data", (data) => {
      buffer += data.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop(); // Keep incomplete line in buffer

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

    server.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Server exited with code ${code}`));
      } else {
        resolve(responses);
      }
    });

    // Send initialization and tool call
    const messages = [
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "demo-client", version: "1.0.0" },
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
      server.stdin.write(JSON.stringify(message) + "\n");
    });

    server.stdin.end();

    setTimeout(() => {
      server.kill();
      reject(new Error("Timeout"));
    }, 15000);
  });
}

async function demo() {
  console.log("🎨 Klint MCP Server Demo\n");

  // Demo how-do-i tool
  console.log("━━━ HOW-DO-I TOOL ━━━");
  try {
    const responses = await callTool("how-do-i", {
      task: "create a spiral of animated dots",
      context: "for a meditative art piece",
    });

    const toolResponse = responses.find((r) => r.id === 2);
    if (toolResponse?.result?.content?.[0]?.text) {
      console.log(toolResponse.result.content[0].text);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }

  console.log("\n━━━ EXPLAIN TOOL ━━━");
  try {
    const responses = await callTool("explain", {
      function: "translate",
      includeExamples: true,
    });

    const toolResponse = responses.find((r) => r.id === 2);
    if (toolResponse?.result?.content?.[0]?.text) {
      console.log(
        toolResponse.result.content[0].text.substring(0, 500) + "..."
      );
    }
  } catch (error) {
    console.error("Error:", error.message);
  }

  console.log("\n━━━ DEBUG TOOL ━━━");
  try {
    const responses = await callTool("debug", {
      code: `
        const draw = (ctx) => {
          for (let i = 0; i < 1000; i++) {
            ctx.circle(Math.random() * ctx.width, Math.random() * ctx.height, 5);
          }
        }
      `,
      issue: "animation is very slow",
    });

    const toolResponse = responses.find((r) => r.id === 2);
    if (toolResponse?.result?.content?.[0]?.text) {
      console.log(
        toolResponse.result.content[0].text.substring(0, 600) + "..."
      );
    }
  } catch (error) {
    console.error("Error:", error.message);
  }

  console.log("\n🎉 Demo completed!");
}

demo().catch(console.error);
