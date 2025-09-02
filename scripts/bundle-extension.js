#!/usr/bin/env node

import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTENSION_DIR = path.join(__dirname, '..', 'dist', 'claude-extension');
const SERVER_DIR = path.join(EXTENSION_DIR, 'server');

/**
 * Logs a message with timestamp
 */
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

/**
 * Bundle the extension with all dependencies
 */
async function bundleExtension() {
  try {
    log('Creating self-contained extension bundle...');
    
    // Create package.json in server directory
    const packageJson = {
      "name": "linear-mcp-server",
      "version": "1.0.0",
      "type": "module",
      "dependencies": {
        "@modelcontextprotocol/sdk": "^1.4.0"
      }
    };
    
    await fs.writeFile(
      path.join(SERVER_DIR, 'package.json'), 
      JSON.stringify(packageJson, null, 2)
    );
    
    log('Installing dependencies in server directory...');
    execSync('npm install --production', { 
      cwd: SERVER_DIR,
      stdio: 'inherit' 
    });
    
    log('Extension bundled successfully with all dependencies');
    
  } catch (error) {
    console.error(`Bundle failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the bundle if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  bundleExtension();
}

export { bundleExtension };