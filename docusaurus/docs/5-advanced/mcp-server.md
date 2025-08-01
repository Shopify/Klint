# Klint MCP Server

The Klint MCP (Model Context Protocol) server brings AI-powered assistance directly to your creative coding workflow. Ask Claude about Klint patterns, debug your sketches, and get production-ready code - all within your conversation.

## What is MCP?

MCP (Model Context Protocol) allows AI assistants like Claude to access specialized tools and knowledge bases. The Klint MCP server gives Claude deep knowledge about Klint's creative coding capabilities.

## Quick Setup

### Prerequisites
- [Claude Desktop](https://claude.ai/desktop) or [Cursor](https://cursor.sh/) installed
- Node.js and npm

### Installation

#### For Claude Desktop

1. **Find your Claude Desktop config file**:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
   - **Linux**: `~/.config/claude/claude_desktop_config.json`

2. **Add the Klint MCP server**:
   ```json
   {
     "mcpServers": {
       "klint": {
         "command": "npx",
         "args": ["-y", "@shopify/klint-mcp@latest"]
       }
     }
   }
   ```

3. **Restart Claude Desktop**

#### For Cursor

1. **Open Cursor Settings** (Cmd/Ctrl + ,)
2. **Search for "MCP"** in settings
3. **Add to MCP Servers**:
   ```json
   {
     "klint": {
       "command": "npx",
       "args": ["-y", "@shopify/klint-mcp@latest"]
     }
   }
   ```
4. **Restart Cursor**

### Test It Out

After installation, restart your AI assistant and ask:
> "How do I create animated particles with Klint?"

## Available Tools

### 🎨 `klint-patterns`
Get working code examples for creative coding tasks.

**Example prompts:**
- "How do I make shapes move on a wave?"
- "Create a particle system with rotation"
- "Generate a grid of animated circles"

### 📚 `explain`
Deep explanations of Klint functions with examples.

**Example prompts:**
- "Explain the circle function in Klint"
- "How does the Time element work?"

### 🐛 `debug`
Debug and optimize your Klint code.

**Example prompts:**
- "Debug this code: [paste your code]"
- "Why are my circles not showing up?"

### 🚀 `ship-it`
Prepare your sketch for production deployment.

**Example prompts:**
- "Make this production-ready: [paste your code]"
- "How do I deploy this as a React component?"

## Real Example Conversation

**You:** How do I make a simple set of shapes move on a wave?

**Claude:** I'll help you create shapes moving on a wave pattern using Klint.

*[Claude automatically uses the klint-patterns tool]*

Here's a complete working example:

```tsx
import { useKlint } from 'klint';

export default function WaveShapes() {
  const { Klint, Time } = useKlint();

  return (
    <Klint
      setup={(ctx) => {
        ctx.noFill();
        ctx.strokeWidth(2);
      }}
      draw={(ctx) => {
        ctx.background(20);
        
        // Create multiple shapes moving on a wave
        const numShapes = 8;
        const waveAmplitude = 100;
        const waveSpeed = 0.02;
        
        for (let i = 0; i < numShapes; i++) {
          const x = (i / numShapes) * ctx.width;
          const y = ctx.height/2 + Math.sin(Time.time * waveSpeed + i * 0.5) * waveAmplitude;
          
          ctx.strokeColor(180, 120 + i * 15, 255);
          ctx.circle(x, y, 20 + Math.cos(Time.time * 0.03 + i) * 5);
        }
      }}
    />
  );
}
```

This creates 8 circles that:
- Move vertically following a sine wave
- Are distributed horizontally across the canvas
- Have phase-shifted motion for a flowing effect
- Change size subtly over time

## How It Works

The Klint MCP server is published as an npm package that runs locally on your machine. When you configure your AI assistant:

1. It uses `npx` to download and run the latest version
2. The server loads Klint documentation and examples
3. Provides access to Klint-specific tools and knowledge
4. Generates code examples based on patterns and best practices

The server runs only when your AI assistant needs it - no background processes!

## Troubleshooting

### "Tools not available"
- Make sure you've restarted Claude Desktop or Cursor after adding the configuration
- Verify that Node.js and npm are installed: `node --version`
- Check the configuration JSON syntax is correct

### "Command not found" errors
- Install Node.js and npm from [nodejs.org](https://nodejs.org/)
- Make sure npm is in your PATH
- Try running `npx @shopify/klint-mcp@latest` manually to test

### Development issues
- Make sure to run `npm run build` after making changes
- Check the TypeScript compilation for errors
- Verify docs are loading correctly by checking console output

## Why Use the MCP Server?

**Before MCP:**
- Copy-paste code from docs
- Manual trial and error
- Generic Stack Overflow answers
- Time spent debugging basics

**With MCP:**
- Working code examples tailored to your task
- Klint-specific debugging help
- Production deployment guidance
- Contextual function explanations

The Klint MCP server transforms your creative coding workflow from research-heavy to creation-focused.

## Development

To work on the MCP server locally:

```bash
# Clone the repository
git clone https://github.com/Shopify/Klint
cd Klint/docusaurus/mcp-server

# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch for changes
npm run watch
```

For local development with Claude Desktop:

```json
{
  "mcpServers": {
    "klint": {
      "command": "node",
      "args": ["/path/to/Klint/docusaurus/mcp-server/dist/index.js"]
    }
  }
}
```

## Contributing

The MCP server is part of the main Klint repository. To contribute:

1. **Add new patterns** to `src/context.ts`
2. **Improve tool responses** based on user feedback  
3. **Add more documentation parsing** for better context
4. **Extend functionality** with new tools
5. **Update examples** in the `examples/` directory

The MCP server code is located in `docusaurus/mcp-server/`.

See the [main contributing guide](../../CONTRIBUTING.md) for more details. 