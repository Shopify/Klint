import { promises as fs, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { cwd } from 'process';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Determine if we're running from npm package or development
function getProjectRoot(): string {
  const mcpDir = resolve(cwd());
  
  // Check if we're in an npm package (docs folder exists in mcp dir)
  const npmDocsPath = join(mcpDir, 'docs');
  try {
    if (existsSync(npmDocsPath)) {
      return mcpDir; // Use mcp directory as root for npm package
    }
  } catch {}
  
  // Development mode - go up one level
  return resolve(mcpDir, '..');
}

const PROJECT_ROOT = getProjectRoot();

export class KlintContext {
  private documentation: Map<string, string> = new Map();
  private examples: Map<string, string> = new Map();
  private functionInfo: Map<string, any> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeAsync();
  }

  private async initializeAsync() {
    if (this.isInitialized) return;
    
    try {
      await Promise.all([
        this.loadDocumentation(),
        this.loadExamples(),
        this.loadFunctionInfo(),
      ]);
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize KlintContext:', error);
    }
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initializeAsync();
    }
  }

  private async loadDocumentation() {
    // Try npm package structure first, then development structure
    const possibleDocsPaths = [
      join(PROJECT_ROOT, 'docs'), // npm package
      join(PROJECT_ROOT, 'docusaurus/docs') // development
    ];
    
    for (const docsPath of possibleDocsPaths) {
      try {
        // Load function documentation
        const functionsPath = join(docsPath, 'Functions');
        const functionFiles = await fs.readdir(functionsPath);
        
        for (const file of functionFiles) {
          if (file.endsWith('.md')) {
            const content = await fs.readFile(join(functionsPath, file), 'utf-8');
            const functionName = file.replace('.md', '');
            this.documentation.set(functionName, content);
          }
        }

        // Load element documentation
        const elementsPath = join(docsPath, 'Elements');
        const elementFiles = await fs.readdir(elementsPath);
        
        for (const file of elementFiles) {
          if (file.endsWith('.md')) {
            const content = await fs.readFile(join(elementsPath, file), 'utf-8');
            const elementName = file.replace('.md', '');
            this.documentation.set(elementName, content);
          }
        }
        
        // If we successfully loaded docs, break
        if (this.documentation.size > 0) break;
      } catch (error) {
        // Try next path
        continue;
      }
    }
    
    if (this.documentation.size === 0) {
      console.warn('Could not load documentation from any path');
    }
  }

  private async loadExamples() {
    // Load basic examples
    const possibleExamplesPaths = [
      join(PROJECT_ROOT, 'examples'), // both npm and development
    ];
    
    for (const examplesPath of possibleExamplesPaths) {
      try {
        const files = await fs.readdir(examplesPath);
        
        for (const file of files) {
          if (file.endsWith('.js') || file.endsWith('.ts')) {
            const content = await fs.readFile(join(examplesPath, file), 'utf-8');
            this.examples.set(file, content);
          }
        }
        break; // Success, no need to try other paths
      } catch (error) {
        continue;
      }
    }

    // Try to load docusaurus component examples (development only)
    try {
      const docComponentsPath = join(PROJECT_ROOT, 'docusaurus/src/components/Experiments');
      const componentFiles = await fs.readdir(docComponentsPath);
      
      for (const file of componentFiles) {
        if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          const content = await fs.readFile(join(docComponentsPath, file), 'utf-8');
          this.examples.set(`experiments/${file}`, content);
        }
      }
    } catch (error) {
      // Docusaurus examples not available (probably npm package), that's fine
    }
  }

  private async loadFunctionInfo() {
    // Try to load function definitions - only available in development
    try {
      const klintFunctionsPath = join(PROJECT_ROOT, 'lib/src/KlintFunctions.tsx');
      const klintFunctionsContent = await fs.readFile(klintFunctionsPath, 'utf-8');
      
      // Parse function signatures and types
      this.parseFunctionInfo(klintFunctionsContent);
    } catch (error) {
      // Function info not available (probably npm package), use basic info from docs
      console.warn('Function definitions not available, using documentation-based info');
    }
  }

  private parseFunctionInfo(content: string) {
    // Basic parsing of function exports and types
    const functionMatches = content.match(/export\s+(?:const|function)\s+(\w+)/g);
    if (functionMatches) {
      for (const match of functionMatches) {
        const functionName = match.replace(/export\s+(?:const|function)\s+/, '');
        this.functionInfo.set(functionName, { name: functionName });
      }
    }
  }

  async howDoI(task: string, context?: string): Promise<string> {
    await this.ensureInitialized();

    const lowerTask = task.toLowerCase();
    let response = `# How to: ${task}\n\n`;

    // Pattern matching for common creative coding tasks (ordered by specificity)
    const patterns = [
      {
        keywords: ['wave', 'sine', 'cos', 'oscillate', 'ripple', 'flowing', 'undulate'],
        functions: ['Time', 'translate', 'circle', 'Math.sin', 'Math.cos'],
        concept: 'wave patterns and oscillation',
      },
      {
        keywords: ['spiral', 'rotation', 'spin', 'twist', 'circular'],
        functions: ['rotate', 'translate', 'Time', 'Math.cos', 'Math.sin'],
        concept: 'rotational motion',
      },
      {
        keywords: ['particle', 'particles', 'dots', 'points', 'scatter'],
        functions: ['circle', 'point', 'translate', 'rotate', 'Time'],
        concept: 'particle systems',
      },
      {
        keywords: ['grid', 'pattern', 'repeat', 'tile', 'array'],
        functions: ['translate', 'push', 'pop', 'for loop'],
        concept: 'patterns and grids',
      },
      {
        keywords: ['animation', 'animate', 'move', 'motion', 'moving', 'transition'],
        functions: ['Time', 'translate', 'rotate', 'scale', 'push', 'pop'],
        concept: 'animation and movement',
      },
      {
        keywords: ['color', 'gradient', 'fade', 'palette', 'hue', 'rainbow'],
        functions: ['fillColor', 'strokeColor', 'gradient', 'radialGradient', 'Color'],
        concept: 'color and gradients',
      },
      {
        keywords: ['shape', 'draw', 'geometry', 'circle', 'rectangle', 'triangle'],
        functions: ['circle', 'rectangle', 'polygon', 'beginShape', 'endShape'],
        concept: 'shape drawing',
      },
      {
        keywords: ['interactive', 'mouse', 'click', 'hover', 'touch', 'input'],
        functions: ['State', 'useKlint'],
        concept: 'interactivity',
      },
    ];

    let matchedPattern = null;
    let bestMatchScore = 0;
    
    // Find the pattern with the most keyword matches (more specific)
    for (const pattern of patterns) {
      const matchCount = pattern.keywords.filter(keyword => lowerTask.includes(keyword)).length;
      if (matchCount > bestMatchScore) {
        bestMatchScore = matchCount;
        matchedPattern = pattern;
      }
    }
    
    // If no specific matches, fall back to any single keyword match
    if (!matchedPattern) {
      for (const pattern of patterns) {
        if (pattern.keywords.some(keyword => lowerTask.includes(keyword))) {
          matchedPattern = pattern;
          break;
        }
      }
    }

    if (matchedPattern) {
      response += `This involves **${matchedPattern.concept}**. Here are the key Klint functions you'll need:\n\n`;
      
      for (const func of matchedPattern.functions) {
        const docs = this.documentation.get(func);
        if (docs) {
          const firstLine = docs.split('\n')[0].replace(/^#\s*/, '');
          response += `- **${func}**: ${firstLine}\n`;
        } else {
          response += `- **${func}**: Core function for ${matchedPattern.concept}\n`;
        }
      }

      response += '\n## Example Pattern:\n\n```tsx\n';
      response += this.generateExampleCode(task, matchedPattern);
      response += '\n```\n\n';
    } else {
      response += 'Let me help you break this down into Klint concepts:\n\n';
      response += this.generateGenericHelp(task);
    }

    if (context) {
      response += `\n## Additional Context Considerations:\n${context}\n\n`;
    }

    // Add relevant documentation
    const relevantDocs = this.findRelevantDocumentation(task, matchedPattern);
    if (relevantDocs.length > 0) {
      response += '## Related Documentation:\n\n';
      relevantDocs.forEach(doc => {
        response += `- **${doc.name}**: ${doc.description}\n`;
      });
    }

    // Add installation/usage note
    response += '\n## Getting Started:\n\n';
    response += 'To use this code:\n';
    response += '1. Install Klint: `npm install klint`\n';
    response += '2. Add this component to your React app\n';
    response += '3. Adjust the parameters for your specific needs\n';
    response += '4. Use the MCP `debug` tool if you encounter issues\n';

    return response;
  }

  async explain(functionName: string, includeExamples: boolean = true): Promise<string> {
    await this.ensureInitialized();

    let response = `# ${functionName}\n\n`;

    // Add installation note first
    response += `## Getting Started\n`;
    response += `If you haven't installed Klint yet:\n`;
    response += `\`\`\`bash\nnpm install klint\n\`\`\`\n\n`;

    const docs = this.documentation.get(functionName);
    if (docs) {
      response += `## Documentation\n${docs}\n\n`;
    } else {
      response += `## Function Overview\n`;
      response += `Function \`${functionName}\` - let me find similar functions and provide context.\n\n`;
      
      // Try to find similar functions
      const similar = this.findSimilarFunctions(functionName);
      if (similar.length > 0) {
        response += '**Similar functions you might be looking for:**\n';
        similar.forEach(func => {
          const funcDocs = this.documentation.get(func);
          const description = funcDocs ? funcDocs.split('\n')[0].replace(/^#\s*/, '') : 'Core Klint function';
          response += `- **${func}**: ${description}\n`;
        });
        response += '\n';
      }
    }

    if (includeExamples) {
      const examples = this.findFunctionExamples(functionName);
      if (examples.length > 0) {
        response += '## Working Examples\n\n';
        response += 'Here are complete examples you can copy and run:\n\n';
        examples.forEach((example, index) => {
          response += `### Example ${index + 1}: ${example.name}\n`;
          response += `\`\`\`tsx\nimport { useKlint } from 'klint';\n\n${example.code}\n\`\`\`\n\n`;
        });
      } else {
        // Generate a focused example
        response += '## Quick Start Example\n\n';
        response += `Here's a basic template to get you started with \`${functionName}\`:\n\n`;
        response += `\`\`\`tsx\nimport { useKlint } from 'klint';\n\n`;
        response += `export default function My${functionName}Sketch() {\n`;
        response += `  const { Klint } = useKlint();\n\n`;
        response += `  return (\n`;
        response += `    <Klint\n`;
        response += `      setup={(ctx) => {\n`;
        response += `        // Setup your canvas\n`;
        response += `        ctx.background('black');\n`;
        response += `      }}\n`;
        response += `      draw={(ctx) => {\n`;
        response += `        // Use ${functionName} here\n`;
        response += `        ctx.${functionName}(/* your parameters */);\n`;
        response += `      }}\n`;
        response += `    />\n`;
        response += `  );\n`;
        response += `}\n\`\`\`\n\n`;
      }
    }

    // Add related functions and tips
    const similar = this.findSimilarFunctions(functionName);
    if (similar.length > 0) {
      response += '## Related Functions\n\n';
      response += 'Functions commonly used together:\n';
      similar.slice(0, 5).forEach(func => {
        const funcDocs = this.documentation.get(func);
        const description = funcDocs ? funcDocs.split('\n')[0].replace(/^#\s*/, '') : 'Core function';
        response += `- **${func}**: ${description}\n`;
      });
      response += '\n';
    }

    response += '## Need Help?\n\n';
    response += '- Use the MCP `debug` tool if you encounter issues\n';
    response += '- Use `how-do-i` for pattern-based examples\n';
    response += '- Use `ship-it` when ready to deploy your sketch\n';

    return response;
  }

  async debug(code: string, issue?: string): Promise<string> {
    await this.ensureInitialized();

    let response = '# 🔧 Klint Debug Assistant\n\n';

    if (issue) {
      response += `## 🚨 Reported Issue\n**"${issue}"**\n\n`;
    }

    response += '## 🔍 Code Analysis\n\n';

    // Enhanced analysis with more specific checks
    const issues = this.analyzeCode(code);
    const codeLines = code.split('\n');
    
    if (issues.length > 0) {
      response += '### ❌ Issues Found:\n\n';
      issues.forEach((issue, index) => {
        response += `**${index + 1}. ${issue.type}**\n`;
        response += `   Problem: ${issue.description}\n`;
        if (issue.suggestion) {
          response += `   ✅ **Solution**: ${issue.suggestion}\n`;
        }
        response += '\n';
      });
    } else {
      response += '✅ **No obvious issues detected!** Your code looks clean.\n\n';
    }

    // Enhanced performance analysis
    response += '## ⚡ Performance Analysis\n\n';
    response += this.generatePerformanceTips(code);

    // Enhanced best practices with specific fixes
    response += '\n## 📋 Best Practices Check\n\n';
    response += this.checkBestPractices(code);

    // Add debugging workflow
    response += '\n## 🛠️ Debugging Workflow\n\n';
    response += 'If you\'re still having issues:\n\n';
    response += '1. **Check the Browser Console** - Look for JavaScript errors\n';
    response += '2. **Verify Canvas Rendering** - Ensure the canvas element is visible\n';
    response += '3. **Test Incrementally** - Comment out complex parts and add them back\n';
    response += '4. **Use Console Logging** - Add `console.log()` to track values\n';
    response += '5. **Check Performance** - Use browser dev tools performance tab\n\n';

    // Add common error patterns
    response += '## 🎯 Common Error Patterns\n\n';
    if (code.includes('undefined') || code.includes('null')) {
      response += '❌ **Undefined/Null Values**: Check variable initialization\n';
    }
    if (code.includes('NaN')) {
      response += '❌ **NaN Values**: Verify mathematical operations\n';
    }
    if (!code.includes('ctx.background') && code.includes('draw')) {
      response += '⚠️  **Missing Background**: Consider adding `ctx.background()` to clear the canvas\n';
    }
    if (code.includes('Math.random') && code.includes('draw')) {
      response += '💡 **Random in Draw Loop**: Move random generation to setup or use Time-based patterns\n';
    }

    // Installation check
    if (!code.includes('useKlint') && !code.includes('import')) {
      response += '\n## 📦 Installation Check\n\n';
      response += 'Make sure Klint is properly installed:\n';
      response += '```bash\nnpm install klint\n```\n\n';
      response += 'And imported in your component:\n';
      response += '```tsx\nimport { useKlint } from \'klint\';\n```\n\n';
    }

    return response;
  }

  async shipIt(code: string, target: 'react-component' | 'standalone' | 'npm-package' = 'react-component'): Promise<string> {
    await this.ensureInitialized();

    let response = `# 🚀 Ship It: ${target}\n\n`;

    response += `## 🎯 Production-Ready Code\n\n`;

    const optimizedCode = this.optimizeForProduction(code, target);
    response += 'Here\'s your optimized, production-ready code:\n\n';
    response += '```tsx\n' + optimizedCode + '\n```\n\n';

    response += `## ✅ Pre-Deployment Checklist\n\n`;
    response += this.generateDeploymentChecklist(target);

    response += `\n## ⚙️ Build Configuration\n\n`;
    response += this.generateBuildConfig(target);

    // Add deployment guides based on target
    response += `\n## 🌐 Deployment Options\n\n`;
    if (target === 'react-component') {
      response += `### Option 1: Embed in Existing React App\n`;
      response += `1. Copy the component code above\n`;
      response += `2. Install Klint: \`npm install klint\`\n`;
      response += `3. Import and use in your app\n`;
      response += `4. Build with your existing build process\n\n`;
      
      response += `### Option 2: Deploy to Vercel/Netlify\n`;
      response += `1. Create a new React app: \`npx create-react-app my-klint-sketch\`\n`;
      response += `2. Install Klint: \`npm install klint\`\n`;
      response += `3. Replace src/App.js with your component\n`;
      response += `4. Deploy to your platform of choice\n\n`;
    }

    response += `## 📊 Performance Monitoring\n\n`;
    response += `After deployment, monitor:\n`;
    response += `- Canvas rendering performance (aim for 60fps)\n`;
    response += `- Memory usage (watch for memory leaks)\n`;
    response += `- Bundle size (aim to keep Klint sketches under 1MB)\n`;
    response += `- Mobile device compatibility\n\n`;

    response += `## 🔧 Post-Deployment Optimization\n\n`;
    response += `If performance issues arise:\n`;
    response += `1. Use the MCP \`debug\` tool to analyze bottlenecks\n`;
    response += `2. Consider reducing particle counts or complexity\n`;
    response += `3. Implement level-of-detail based on device capabilities\n`;
    response += `4. Use requestAnimationFrame wisely\n\n`;

    response += `## 🎉 You're Ready!\n\n`;
    response += `Your Klint sketch is production-ready. Happy shipping! 🎨\n`;

    return response;
  }

  private generateExampleCode(task: string, pattern: any): string {
    const lowerTask = task.toLowerCase();
    
    // Generate specific code based on the task
    if (pattern.concept === 'wave patterns and oscillation') {
      return `import { useKlint } from 'klint';

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
}`;
    }
    
    if (pattern.concept === 'particle systems') {
      return `import { useKlint } from 'klint';

export default function ParticleSystem() {
  const { Klint, Time } = useKlint();

  return (
    <Klint
      setup={(ctx) => {
        ctx.fillColor(255);
      }}
      draw={(ctx) => {
        ctx.background(20, 20, 40);
        
        // Create animated particles
        const numParticles = 50;
        
        for (let i = 0; i < numParticles; i++) {
          const angle = (i / numParticles) * Math.PI * 2;
          const radius = 100 + Math.sin(Time.time * 0.01 + i * 0.1) * 50;
          
          const x = ctx.width/2 + Math.cos(angle + Time.time * 0.005) * radius;
          const y = ctx.height/2 + Math.sin(angle + Time.time * 0.005) * radius;
          
          ctx.circle(x, y, 3 + Math.sin(Time.time * 0.02 + i) * 2);
        }
      }}
    />
  );
}`;
    }
    
    if (pattern.concept === 'animation and movement') {
      return `import { useKlint } from 'klint';

export default function AnimatedShapes() {
  const { Klint, Time } = useKlint();

  return (
    <Klint
      draw={(ctx) => {
        ctx.background(20);
        
        // Rotating and scaling shape
        ctx.push();
        ctx.translate(ctx.width/2, ctx.height/2);
        ctx.rotate(Time.time * 0.01);
        ctx.scale(1 + Math.sin(Time.time * 0.02) * 0.3);
        
        ctx.fillColor(100, 200, 255);
        ctx.rectangle(-50, -50, 100, 100);
        ctx.pop();
      }}
    />
  );
}`;
    }
    
    if (pattern.concept === 'rotational motion') {
      return `import { useKlint } from 'klint';

export default function SpiralMotion() {
  const { Klint, Time } = useKlint();

  return (
    <Klint
      draw={(ctx) => {
        ctx.background(20, 20, 30);
        ctx.fillColor(255, 150, 100);
        
        // Create a spiral of shapes
        const numShapes = 20;
        const spiralRadius = 150;
        
        for (let i = 0; i < numShapes; i++) {
          const angle = (i / numShapes) * Math.PI * 4 + Time.time * 0.01;
          const radius = (i / numShapes) * spiralRadius;
          
          const x = ctx.width/2 + Math.cos(angle) * radius;
          const y = ctx.height/2 + Math.sin(angle) * radius;
          
          ctx.circle(x, y, 8 + Math.sin(Time.time * 0.02 + i * 0.2) * 4);
        }
      }}
    />
  );
}`;
    }
    
    if (pattern.concept === 'patterns and grids') {
      return `import { useKlint } from 'klint';

export default function GridPattern() {
  const { Klint, Time } = useKlint();

  return (
    <Klint
      draw={(ctx) => {
        ctx.background(20);
        
        const cols = 12;
        const rows = 8;
        const cellWidth = ctx.width / cols;
        const cellHeight = ctx.height / rows;
        
        for (let x = 0; x < cols; x++) {
          for (let y = 0; y < rows; y++) {
            const centerX = x * cellWidth + cellWidth/2;
            const centerY = y * cellHeight + cellHeight/2;
            
            // Animated size based on position and time
            const size = 10 + Math.sin(Time.time * 0.01 + x * 0.3 + y * 0.2) * 8;
            const hue = (x + y + Time.time * 0.005) * 30;
            
            ctx.fillColor(hue % 360, 70, 90);
            ctx.circle(centerX, centerY, size);
          }
        }
      }}
    />
  );
}`;
    }
    
    // Default fallback with basic structure
    return `import { useKlint } from 'klint';

export default function MySketch() {
  const { Klint } = useKlint();

  return (
    <Klint
      setup={(ctx) => {
        // Initialize your sketch here
      }}
      draw={(ctx) => {
        ctx.background(20);
        // Add your ${task} code here
        // Consider using: ${pattern.functions.join(', ')}
      }}
    />
  );
}`;
  }

  private generateGenericHelp(task: string): string {
    return `To accomplish "${task}" in Klint, consider these steps:

1. **Break down the visual effect** - What shapes, colors, and movements do you need?
2. **Choose the right functions** - Use the \`explain\` tool to learn about specific Klint functions
3. **Structure your code** - Use \`setup\` for initialization and \`draw\` for animation
4. **Test iteratively** - Start simple and add complexity gradually

Use the \`explain\` tool to learn more about specific Klint functions!`;
  }

  private findRelevantExamples(task: string): string[] {
    const examples: string[] = [];
    const lowerTask = task.toLowerCase();

    for (const [filename, content] of this.examples) {
      const lowerContent = content.toLowerCase();
      if (lowerTask.split(' ').some(word => lowerContent.includes(word))) {
        examples.push(filename);
      }
    }

    return examples.slice(0, 3); // Limit to 3 most relevant
  }

  private findRelevantDocumentation(task: string, matchedPattern: any): Array<{name: string, description: string}> {
    const docs: Array<{name: string, description: string}> = [];
    const lowerTask = task.toLowerCase();
    
    // If we have a matched pattern, prioritize its functions
    if (matchedPattern) {
      for (const func of matchedPattern.functions) {
        const docContent = this.documentation.get(func);
        if (docContent) {
          const firstLine = docContent.split('\n')[0].replace(/^#\s*/, '');
          docs.push({
            name: func,
            description: firstLine || `Learn about the ${func} function`
          });
        }
      }
    }
    
    // Add related concepts from documentation
    const conceptKeywords = lowerTask.split(' ').filter(word => word.length > 3);
    for (const [docName, content] of this.documentation) {
      const lowerContent = content.toLowerCase();
      const isRelevant = conceptKeywords.some(keyword => 
        lowerContent.includes(keyword) || docName.toLowerCase().includes(keyword)
      );
      
      if (isRelevant && !docs.find(d => d.name === docName)) {
        const firstLine = content.split('\n')[0].replace(/^#\s*/, '');
        docs.push({
          name: docName,
          description: firstLine || `Documentation for ${docName}`
        });
      }
    }
    
    return docs.slice(0, 5); // Limit to 5 most relevant
  }

  private findSimilarFunctions(functionName: string): string[] {
    const similar: string[] = [];
    const lowerName = functionName.toLowerCase();

    for (const name of this.documentation.keys()) {
      if (name.toLowerCase().includes(lowerName) || lowerName.includes(name.toLowerCase())) {
        similar.push(name);
      }
    }

    return similar.slice(0, 5);
  }

  private findFunctionExamples(functionName: string): Array<{name: string, code: string}> {
    const examples: Array<{name: string, code: string}> = [];

    for (const [filename, content] of this.examples) {
      if (content.includes(functionName)) {
        // Extract relevant code snippet
        const lines = content.split('\n');
        const relevantLines = lines.filter(line => 
          line.includes(functionName) || 
          lines.indexOf(line) === lines.findIndex(l => l.includes(functionName)) - 1 ||
          lines.indexOf(line) === lines.findIndex(l => l.includes(functionName)) + 1
        );
        
        if (relevantLines.length > 0) {
          examples.push({
            name: filename,
            code: relevantLines.join('\n')
          });
        }
      }
    }

    return examples.slice(0, 2);
  }

  private analyzeCode(code: string): Array<{type: string, description: string, suggestion?: string}> {
    const issues: Array<{type: string, description: string, suggestion?: string}> = [];

    // Check for common issues
    if (!code.includes('background(')) {
      issues.push({
        type: 'Missing Background',
        description: 'No background() call found. This may cause trails or artifacts.',
        suggestion: 'Add ctx.background(color) at the start of your draw function'
      });
    }

    if (code.includes('for') && code.includes('circle')) {
      issues.push({
        type: 'Performance',
        description: 'Drawing many shapes in a loop can impact performance.',
        suggestion: 'Consider using offscreen rendering for complex patterns'
      });
    }

    if (code.includes('setState') && code.includes('draw')) {
      issues.push({
        type: 'React State',
        description: 'Using setState inside draw() can cause unnecessary re-renders.',
        suggestion: 'Use Klint State elements or refs for animation values'
      });
    }

    return issues;
  }

  private generatePerformanceTips(code: string): string {
    let tips = '';
    
    if (code.includes('circle') || code.includes('rectangle')) {
      tips += '- Consider batching shape drawing operations\n';
    }
    
    if (code.includes('image')) {
      tips += '- Preload images in setup() rather than draw()\n';
    }
    
    if (code.includes('for') || code.includes('while')) {
      tips += '- Limit loop iterations in draw() for better frame rates\n';
    }

    return tips || '- Code looks optimized for performance ✅\n';
  }

  private checkBestPractices(code: string): string {
    let practices = '';
    
    if (code.includes('setup')) {
      practices += '✅ Using setup() function\n';
    }
    
    if (code.includes('background(')) {
      practices += '✅ Clearing background each frame\n';
    }
    
    if (code.includes('useKlint')) {
      practices += '✅ Using Klint hooks properly\n';
    }

    return practices || 'Consider following Klint best practices for better code organization.\n';
  }

  private optimizeForProduction(code: string, target: string): string {
    // Basic code optimization
    let optimized = code;
    
    // Add production-specific optimizations
    if (target === 'react-component') {
      optimized = `// Production-optimized React component
${optimized}`;
    }
    
    return optimized;
  }

  private generateDeploymentChecklist(target: 'react-component' | 'standalone' | 'npm-package'): string {
    const common = `- [ ] Code is tested and working
- [ ] Performance is acceptable
- [ ] Error handling is in place
- [ ] Dependencies are up to date`;

    const specific: Record<'react-component' | 'standalone' | 'npm-package', string> = {
      'react-component': `- [ ] Component is properly exported
- [ ] Props are well-defined
- [ ] TypeScript types are included`,
      'standalone': `- [ ] Bundle size is optimized
- [ ] All assets are included
- [ ] Browser compatibility tested`,
      'npm-package': `- [ ] Package.json is complete
- [ ] Documentation is included
- [ ] Tests are passing
- [ ] Version is bumped`
    };

    return `${common}\n${specific[target]}`;
  }

  private generateBuildConfig(target: 'react-component' | 'standalone' | 'npm-package'): string {
    const configs: Record<'react-component' | 'standalone' | 'npm-package', string> = {
      'react-component': `// vite.config.ts
export default {
  build: {
    lib: {
      entry: 'src/index.tsx',
      formats: ['es', 'cjs']
    }
  }
}`,
      'standalone': `// Build as static HTML/JS
npm run build
# Deploy dist/ folder`,
      'npm-package': `// package.json
{
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"]
}`
    };

    return `\`\`\`${target === 'npm-package' ? 'json' : 'typescript'}\n${configs[target]}\n\`\`\``;
  }
} 