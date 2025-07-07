# Klint MCP Server

The Klint MCP (Model Context Protocol) server brings AI-powered assistance directly to your creative coding workflow. Ask Claude about Klint patterns, debug your sketches, and get production-ready code - all within your conversation.

## What is MCP?

MCP (Model Context Protocol) allows AI assistants like Claude to access specialized tools and knowledge bases. The Klint MCP server gives Claude deep knowledge about Klint's creative coding capabilities.

## Quick Setup

### Prerequisites
- [Claude Desktop](https://claude.ai/desktop) installed
- Node.js and npm

### Installation

1. **Navigate to the MCP directory**:
   ```bash
   cd Klint/mcp
   npm install
   npm run setup
   ```

2. **Restart Claude Desktop**

3. **Test it out** - Ask Claude:
   > "How do I create animated particles with Klint?"

That's it! The setup script automatically configures everything.

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

## Dashboard

The MCP server includes a visual dashboard for monitoring and testing:

```bash
npm run dashboard
```

Open http://localhost:3001 to see:
- Real-time server health
- Tool usage statistics  
- Interactive tool testing
- Live activity feed

## Manual Configuration

If the automated setup doesn't work, you can configure Claude Desktop manually:

1. **Find your Claude Desktop config file**:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
   - **Linux**: `~/.config/claude/claude_desktop_config.json`

2. **Add the Klint MCP server**:
   ```json
   {
     "mcpServers": {
       "klint": {
         "command": "node",
         "args": ["dist/index.js"],
         "cwd": "/path/to/Klint/mcp"
       }
     }
   }
   ```

3. **Restart Claude Desktop**

## Troubleshooting

### "Tools not available"
- Make sure you've restarted Claude Desktop after setup
- Check that the MCP server built successfully: `npm run build`
- Verify your config file was updated correctly

### "Command not found" errors
- Ensure Node.js is installed and in your PATH
- Try building manually: `cd mcp && npm run build`

### Development issues
- Use the dashboard to test tools: `npm run dashboard`
- Check server logs: `npm test`
- Rebuild after changes: `npm run build`

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

## Contributing

The MCP server is part of the main Klint repository. To contribute:

1. **Add new patterns** to `mcp/src/context.ts`
2. **Improve tool responses** based on user feedback
3. **Add more documentation parsing** for better context
4. **Extend the dashboard** with new monitoring features

See the [main contributing guide](../../CONTRIBUTING.md) for more details. 