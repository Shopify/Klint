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
        const key = relativePath.replace(/\.(md|mdx)$/, '');
        docs[key] = content;
      }
    }
  }
  
  await readDirectory(docsDir);
  return docs;
}

async function getAllExamples() {
  const examples = {};
  const experimentsDir = path.join(__dirname, '..', 'src', 'pages', 'experiments');
  
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

module.exports = async (req, res) => {
  // Enable CORS for the MCP server
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const docsDir = path.join(__dirname, '..', 'docs');
    
    const [docs, examples] = await Promise.all([
      getAllDocs(docsDir),
      getAllExamples()
    ]);
    
    const apiData = {
      docs,
      examples,
      generated: new Date().toISOString()
    };
    
    res.status(200).json(apiData);
  } catch (error) {
    console.error('Error generating API response:', error);
    res.status(500).json({ error: 'Failed to generate documentation API' });
  }
};