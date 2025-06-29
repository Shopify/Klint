# Klint MCP Server

An Model Control Protocol (MCP) server designed specifically for the Klint creative coding framework. This server provides AI assistants with deep knowledge of Klint's APIs, patterns, and best practices.

## Features

The Klint MCP server provides four specialized tools:

### 🤔 `how-do-i`
Converts creative coding tasks into actionable Klint code patterns and functions with **intelligent pattern matching** and **working code examples**.

**Features:**
- 🧠 Smart pattern recognition (wave motion, particles, grids, etc.)
- 💻 Generates complete, working code examples
- 📚 Suggests relevant Klint documentation
- 🚀 Installation and usage guidance

**Usage:**
```typescript
{
  "task": "create a particle system with sine wave motion",
  "context": "for a music visualization project" // optional
}
```

**Example Response:**
```
# How to: make shapes move on a sine wave

This involves **wave patterns and oscillation**. Here are the key Klint functions:
- Time, translate, circle, Math.sin, Math.cos

## Example Pattern:
[Complete working React component with sine wave animation]

## Related Documentation:
- Time: Time management functions
- translate: Position transformation

## Getting Started:
1. Install Klint: `npm install klint`
2. Add this component to your React app
3. Adjust parameters for your needs
```

### 📚 `explain`
Explains Klint functions with examples and creative possibilities.

**Usage:**
```typescript
{
  "function": "circle",
  "includeExamples": true // optional, defaults to true
}
```

### 🐛 `debug`
Enhanced debugging and optimization help for Klint sketches.

**Usage:**
```typescript
{
  "code": "const draw = (ctx) => { ctx.circle(50, 50, 20); }",
  "issue": "circles are not showing up" // optional
}
```

### 🚀 `ship-it`
Bundle and prepare Klint sketches for production deployment.

**Usage:**
```typescript
{
  "code": "export default function MySketch() { ... }",
  "target": "react-component" // "react-component" | "standalone" | "npm-package"
}
```

## Quick Start

1. **Setup:**
```bash
cd mcp
npm install
npm run build
```

2. **Test the dashboard:**
```bash
npm run dashboard
```
Open http://localhost:3001 to see the dashboard.

3. **Test tools directly:**
```bash
npm test
node demo.js
```

## Installation for Production

1. Clone and build the server:
```bash
cd mcp
npm install
npm run build
```

2. Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "klint": {
      "command": "node",
      "args": ["/path/to/Klint/mcp/dist/index.js"],
      "cwd": "/path/to/Klint"
    }
  }
}
```

3. **Optional: Run the dashboard alongside:**
```bash
npm run dashboard  # In a separate terminal
```

## Development

### Build
```bash
npm run build
```

### Watch mode for development
```bash
npm run dev
```

### Testing
```bash
npm test
```

### Dashboard
The MCP server includes a beautiful web dashboard for monitoring health and testing tools:

```bash
npm run dashboard
```

Then open http://localhost:3001 in your browser.

**Dashboard Features:**
- 🔍 Real-time MCP server health monitoring
- 📊 Usage statistics and call counts
- 🧪 Interactive tool testing interface
- 📈 Live activity log with success/error tracking
- 🎨 Modern, responsive UI with real-time updates

**Dashboard Screenshots:**
The dashboard provides:
- Health status indicator (green = healthy, red = error, orange = unknown)
- Total calls counter and uptime tracking
- Individual tool cards with call counts
- Interactive forms for testing each tool
- Real-time activity feed with WebSocket updates

## Knowledge Base

The server automatically loads knowledge from:

- **Documentation**: All Markdown files from `docusaurus/docs/Functions/` and `docusaurus/docs/Elements/`
- **Examples**: Code samples from `examples/` and `docusaurus/src/components/Experiments/`
- **Function Info**: Type definitions and signatures from `lib/src/KlintFunctions.tsx`

## Architecture

- `src/index.ts`: Main MCP server entry point
- `src/context.ts`: Klint knowledge base and tool implementations
- Knowledge is loaded asynchronously at startup
- All responses are formatted in Markdown for better readability

## MCP Protocol Compliance

This server implements the Model Control Protocol specification:
- Handles `tools/list` requests
- Handles `tools/call` requests with proper error handling
- Uses stdio transport for communication
- Validates all inputs using Zod schemas

## Contributing

To add new tools or improve existing ones:

1. Add the tool definition to the `tools` array in `src/index.ts`
2. Add the corresponding method to the `KlintContext` class in `src/context.ts`
3. Update the README with usage examples
4. Build and test the changes

## License

MIT License - see the main Klint project for details. 