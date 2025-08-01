/**
 * Build API Documentation for MCP Server
 * 
 * This script generates a static JSON file containing all documentation
 * that the MCP server needs. It should be run:
 * - Before building the Docusaurus site for production
 * - After making changes to documentation content
 * - The generated file is read-only and served statically
 */

const fs = require('fs').promises;
const path = require('path');

async function getAllDocs(docsDir) {
  const docs = {};
  
  async function readDirectory(dir, basePath = '') {
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const itemPath = path.join(dir, item.name);
      const relativePath = path.join(basePath, item.name);
      
      if (item.isDirectory()) {
        await readDirectory(itemPath, relativePath);
      } else if (item.name.endsWith('.md') || item.name.endsWith('.mdx')) {
        const content = await fs.readFile(itemPath, 'utf-8');
        const key = relativePath.replace(/\.(md|mdx)$/, '').replace(/\\/g, '/');
        docs[key] = content;
      }
    }
  }
  
  await readDirectory(docsDir);
  return docs;
}

async function getAllExamples(srcDir) {
  const examples = {};
  const experimentsDir = path.join(srcDir, 'pages', 'experiments');
  
  try {
    const items = await fs.readdir(experimentsDir, { withFileTypes: true });
    
    for (const item of items) {
      if (item.name.endsWith('.js') && !item.name.includes('.module.')) {
        const filePath = path.join(experimentsDir, item.name);
        const content = await fs.readFile(filePath, 'utf-8');
        examples[item.name.replace('.js', '')] = content;
      }
    }
  } catch (error) {
    console.warn('Could not read experiments directory:', error);
  }
  
  return examples;
}

async function buildApiDocs() {
  try {
    const docsDir = path.join(__dirname, '..', 'docs');
    const srcDir = path.join(__dirname, '..', 'src');
    const staticDir = path.join(__dirname, '..', 'static');
    const apiDir = path.join(staticDir, 'api');
    
    // Create directories if they don't exist
    await fs.mkdir(staticDir, { recursive: true });
    await fs.mkdir(apiDir, { recursive: true });
    
    console.log('Building API documentation...');
    
    const [docs, examples] = await Promise.all([
      getAllDocs(docsDir),
      getAllExamples(srcDir)
    ]);
    
    const apiData = {
      docs,
      examples,
      generated: new Date().toISOString(),
      version: require('../package.json').version
    };
    
    // Write the JSON file
    const outputPath = path.join(apiDir, 'docs.json');
    await fs.writeFile(outputPath, JSON.stringify(apiData, null, 2));
    
    console.log(`✅ API documentation built successfully!`);
    console.log(`📁 Output: ${outputPath}`);
    console.log(`📊 Stats: ${Object.keys(docs).length} docs, ${Object.keys(examples).length} examples`);
    
  } catch (error) {
    console.error('❌ Error building API documentation:', error);
    process.exit(1);
  }
}

// Run the build
buildApiDocs();