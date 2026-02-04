# 🛠️ Contributing to Klint

Thanks for your interest in contributing to Klint! This guide will help you get started with the development setup.

## 🚀 Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shopify/klint.git
   cd klint
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the library**
   ```bash
   npm run build
   ```

## 📁 Repository Structure

```
klint/
├── packages/
│   └── klint/              # Core Klint library + plugins
│       └── src/
│           ├── plugins/    # Optional plugins (FontParser, Delaunay, etc.)
│           └── elements/   # Core elements (Color, Vector, Easing, etc.)
├── klint-editor/           # Interactive editor (working version)
├── docusaurus/             # Documentation site
└── examples/               # Example sketches
```

**Import paths:**
- Core: `import { Klint, useKlint } from '@shopify/klint'`
- Plugins: `import { FontParser } from '@shopify/klint/plugins'`

## 🔧 Development Workflow

### Working on the Core Library

The main Klint library is in `packages/klint/`:

```bash
cd packages/klint
npm run dev    # Watch mode for development
npm run build  # Production build
npm test       # Run tests
```

### Working on the Editor

The interactive editor scaffolding system uses two components:

1. **Working Editor** (`klint-editor/`): Your development environment
2. **Template Sync** (`klint-editor/update-template.sh`): Syncs changes to the scaffolding script

To work on the editor:

```bash
cd klint-editor
npm install
npm run dev              # Start development server

# After making changes, sync to the scaffolding template:
./update-template.sh
```

### Testing the Scaffolding

Test the editor scaffolding system:

```bash
packages/klint/bin/create-editor test-project
cd test-project
npm install
npm run dev
```

### Working on Documentation

The documentation is built with Docusaurus:

```bash
cd docusaurus
npm install
npm run dev     # Development server
npm run build   # Production build
```

## 🧪 Testing

- **Unit tests**: `npm test` in relevant package directories
- **Integration tests**: Test the scaffolding system end-to-end
- **Manual testing**: Use the sandbox and examples

## 📝 Code Style

- Use TypeScript where possible
- Follow existing code patterns and naming conventions
- Add JSDoc comments for public APIs
- Keep functions focused and well-named

## 🐛 Reporting Issues

- Use the [GitHub Issues](https://github.com/Shopify/klint/issues) page
- Include reproduction steps and code examples
- Specify which package the issue affects

## 💡 Feature Requests

- Check existing issues first
- Describe the use case and expected behavior
- Consider if it fits Klint's creative coding focus

## 📋 Pull Request Process

1. **Fork the repository** and create a feature branch
2. **Make your changes** following the code style
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Submit a pull request** with a clear description

### PR Guidelines

- Keep PRs focused on a single change
- Include tests for new functionality
- Update documentation for user-facing changes
- Reference related issues

## 🏗️ Architecture Notes

### Core Library Design

- **Context Extension**: Klint extends the native Canvas 2D context
- **React Integration**: Uses hooks and follows React patterns
- **Plugin System**: Extensible through `K.extend()` and plugins
- **Performance Focus**: Minimal overhead, direct canvas access

### Editor System

- **Working Version**: `klint-editor/` is the source of truth
- **Template Generation**: `update-template.sh` embeds files into `packages/klint/bin/create-editor`
- **User Experience**: One command (`npx @shopify/klint klint-create-editor`) creates everything

## 🎯 Areas for Contribution

### High Priority
- Additional drawing functions (3D transforms, advanced text rendering)
- Performance optimizations
- Better TypeScript definitions
- More creative coding examples

### Medium Priority  
- Plugin ecosystem expansion
- Additional export formats
- Better error handling and debugging tools
- Mobile/touch interaction improvements

### Low Priority
- Advanced shader support
- WebGL backend option
- Audio integration
- VR/AR exploration

## ❓ Questions?

Feel free to:
- Open a [GitHub Discussion](https://github.com/Shopify/klint/discussions)
- Create an issue for clarification
- Reach out to maintainers

## 🎨 Philosophy

Klint prioritizes:
- **Creative expression** over rigid frameworks
- **Performance** over safety guardrails  
- **React integration** over standalone usage
- **Flexibility** over opinionated patterns

Keep this in mind when contributing!

Thanks for helping make Klint better! 🎉 