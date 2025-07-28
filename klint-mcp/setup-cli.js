#!/usr/bin/env node

import { promises as fs, readFileSync } from "fs";
import { join, resolve } from "path";
import { homedir } from "os";
import { existsSync } from "fs";

const CLAUDE_CONFIG_PATHS = {
  macos: join(
    homedir(),
    "Library/Application Support/Claude/claude_desktop_config.json"
  ),
  linux: join(homedir(), ".config/claude/claude_desktop_config.json"),
  windows: join(homedir(), "AppData/Roaming/Claude/claude_desktop_config.json"),
};

function detectPlatform() {
  const platform = process.platform;
  if (platform === "darwin") return "macos";
  if (platform === "linux") return "linux";
  if (platform === "win32") return "windows";
  return "unknown";
}

function getCurrentDir() {
  return process.cwd();
}

function validateMcpDirectory() {
  const currentDir = getCurrentDir();
  const packageJsonPath = join(currentDir, "package.json");

  if (!existsSync(packageJsonPath)) {
    console.error("❌ Error: package.json not found.");
    console.error("💡 Please run this command from the mcp directory.");
    process.exit(1);
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    if (packageJson.name !== "@shopify/klint-mcp") {
      console.error("❌ Error: Not in the Klint MCP directory.");
      console.error("💡 Please run this command from the mcp directory.");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error reading package.json:", error.message);
    process.exit(1);
  }

  return currentDir;
}

async function ensureBuilt(mcpDir) {
  const distPath = join(mcpDir, "dist");
  const indexPath = join(distPath, "index.js");

  if (!existsSync(indexPath)) {
    console.log("🔨 Building MCP server...");
    const { spawn } = await import("child_process");

    await new Promise((resolve, reject) => {
      const build = spawn("npm", ["run", "build"], {
        stdio: "inherit",
        cwd: mcpDir,
      });

      build.on("close", (code) => {
        if (code === 0) {
          console.log("✅ Build completed successfully");
          resolve();
        } else {
          reject(new Error(`Build failed with code ${code}`));
        }
      });
    });
  }
}

async function updateClaudeConfig(mcpDir) {
  const platform = detectPlatform();

  if (platform === "unknown") {
    console.error("❌ Unsupported platform. Please configure manually.");
    return;
  }

  const configPath = CLAUDE_CONFIG_PATHS[platform];
  const configDir = join(configPath, "..");

  // Ensure config directory exists
  try {
    await fs.mkdir(configDir, { recursive: true });
  } catch (error) {
    console.error("❌ Error creating config directory:", error.message);
    return;
  }

  // Read existing config or create new one
  let config = { mcpServers: {} };

  if (existsSync(configPath)) {
    try {
      const existingConfig = await fs.readFile(configPath, "utf-8");
      config = JSON.parse(existingConfig);

      if (!config.mcpServers) {
        config.mcpServers = {};
      }
    } catch (error) {
      console.warn(
        "⚠️  Warning: Could not parse existing config, creating new one"
      );
    }
  }

  // Add Klint MCP server configuration
  config.mcpServers.klint = {
    command: "node",
    args: ["dist/index.js"],
    cwd: mcpDir,
  };

  // Write updated config
  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    console.log("✅ Claude Desktop configuration updated");
    console.log(`📍 Config file: ${configPath}`);
  } catch (error) {
    console.error("❌ Error writing config:", error.message);
  }
}

async function runSetup() {
  console.log("🎨 Klint MCP Server Setup\n");

  // Validate we're in the right directory
  const mcpDir = validateMcpDirectory();
  console.log(`📁 MCP Directory: ${mcpDir}`);

  // Ensure the server is built
  await ensureBuilt(mcpDir);

  // Update Claude Desktop configuration
  await updateClaudeConfig(mcpDir);

  console.log("\n🎉 Setup completed successfully!");
  console.log("\n📋 Next steps:");
  console.log("1. Restart Claude Desktop if it's running");
  console.log("2. The Klint MCP tools should now be available");
  console.log(
    '3. Try asking: "How do I create animated particles with Klint?"'
  );
  console.log("\n🔧 Optional: Run the dashboard for monitoring:");
  console.log("   npm run dashboard");
  console.log("   Then open http://localhost:3001");
}

runSetup().catch((error) => {
  console.error("❌ Setup failed:", error.message);
  process.exit(1);
});
