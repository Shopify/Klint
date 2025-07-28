#!/usr/bin/env node

/**
 * Prepare package for publishing by copying only necessary documentation
 * This avoids creating multiple sources of truth
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const sourceDocsDir = join(rootDir, '..', 'docusaurus', 'docs');
const targetDocsDir = join(rootDir, 'docs');
const sourceExamplesDir = join(rootDir, '..', 'examples');
const targetExamplesDir = join(rootDir, 'examples');

async function copyDocs() {
  console.log('📚 Preparing documentation for publishing...');
  
  try {
    // Create target directories
    await fs.mkdir(targetDocsDir, { recursive: true });
    await fs.mkdir(targetExamplesDir, { recursive: true });
    
    // Copy only essential documentation
    const essentialDirs = ['Functions', 'Elements'];
    
    for (const dir of essentialDirs) {
      const sourceDir = join(sourceDocsDir, dir);
      const targetDir = join(targetDocsDir, dir);
      
      await fs.mkdir(targetDir, { recursive: true });
      
      const files = await fs.readdir(sourceDir);
      for (const file of files) {
        if (file.endsWith('.md')) {
          await fs.copyFile(
            join(sourceDir, file),
            join(targetDir, file)
          );
        }
      }
    }
    
    // Copy examples
    const exampleFiles = await fs.readdir(sourceExamplesDir);
    for (const file of exampleFiles) {
      if (file.endsWith('.js') || file.endsWith('.ts')) {
        await fs.copyFile(
          join(sourceExamplesDir, file),
          join(targetExamplesDir, file)
        );
      }
    }
    
    // Create a minimal README for the docs folder
    const docsReadme = `# Klint MCP Documentation

This directory contains essential Klint documentation for the MCP server.

The documentation is automatically synchronized from the main Klint repository during the build process.

For the complete and most up-to-date documentation, please visit:
- [Klint Documentation](https://github.com/Shopify/Klint/tree/main/docusaurus/docs)
`;
    
    await fs.writeFile(join(targetDocsDir, 'README.md'), docsReadme);
    
    console.log('✅ Documentation prepared successfully');
    
  } catch (error) {
    console.error('❌ Error preparing documentation:', error);
    process.exit(1);
  }
}

copyDocs();