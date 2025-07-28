#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, "dist", "index.js");

async function testImprovedTool() {
  console.log('🎨 Testing Improved Klint MCP "klint-patterns" Tool\n');

  const testCases = [
    "How do i make a simple set of shapes move on a wave",
    "create animated particles in a spiral",
    "make a grid of colorful shapes",
    "draw interactive circles that respond to mouse",
  ];

  for (const query of testCases) {
    console.log(`━━━ Query: "${query}" ━━━`);

    try {
      const result = await callTool("klint-patterns", { task: query });

      // Extract key sections
      const lines = result.split("\n");
      const conceptLine = lines.find((line) =>
        line.includes("This involves **")
      );
      const exampleStart = lines.findIndex((line) =>
        line.includes("## Example Pattern:")
      );
      const docsStart = lines.findIndex((line) =>
        line.includes("## Related Documentation:")
      );

      if (conceptLine) {
        const concept = conceptLine.match(/\*\*(.*?)\*\*/)?.[1];
        console.log(`✅ Concept: ${concept}`);
      }

      if (exampleStart > -1) {
        console.log("✅ Generated specific working code example");
        // Show a snippet of the generated code
        const codeLines = lines.slice(exampleStart + 3, exampleStart + 8);
        console.log(
          "📝 Code preview:",
          codeLines.join("\n").substring(0, 100) + "..."
        );
      }

      if (docsStart > -1) {
        const relatedDocs = lines.slice(docsStart + 2, docsStart + 5);
        console.log(
          "📚 Related docs:",
          relatedDocs.filter((l) => l.trim()).length,
          "items"
        );
      }
    } catch (error) {
      console.log("❌ Error:", error.message);
    }

    console.log("");
  }
}

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

    server.on("close", (code) => {
      const toolResponse = responses.find((r) => r.id === 2);
      if (toolResponse?.result?.content?.[0]?.text) {
        resolve(toolResponse.result.content[0].text);
      } else {
        reject(new Error("No valid response"));
      }
    });

    server.on("error", reject);

    // Send messages
    const messages = [
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "test-client", version: "1.0.0" },
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
    }, 10000);
  });
}

testImprovedTool().catch(console.error);
