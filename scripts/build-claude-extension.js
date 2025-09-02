#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const EXTENSION_DIR = path.join(__dirname, '..', 'dist', 'claude-extension');
const MANIFEST_PATH = path.join(EXTENSION_DIR, 'manifest.json');
const SERVER_DIR = path.join(EXTENSION_DIR, 'server');

// Metadata for the extension
const EXTENSION_METADATA = {
  name: 'linear-mcp-server',
  description: 'Linear MCP server for Claude Desktop',
  version: '1.0.0',
  author: {
    name: 'Linear MCP Team'
  }
};

/**
 * Prompts user for Linear access token
 */
async function promptForToken() {
  // First check if there's a .env file
  try {
    const envContent = await fs.readFile('.env', 'utf8');
    const tokenMatch = envContent.match(/LINEAR_(?:ACCESS_TOKEN|API_KEY)=(.+)/);
    if (tokenMatch && tokenMatch[1] && tokenMatch[1].trim() !== '') {
      const token = tokenMatch[1].trim();
      log(`Found token in .env file: ${token.substring(0, 8)}...`);
      return token;
    }
  } catch (error) {
    // .env file doesn't exist, continue to prompt
  }

  // Check environment variables
  const envToken = process.env.LINEAR_ACCESS_TOKEN || process.env.LINEAR_API_KEY;
  if (envToken) {
    log(`Found token in environment: ${envToken.substring(0, 8)}...`);
    return envToken;
  }

  // Prompt user for token
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('\n🔑 Linear Access Token Required');
    console.log('Get your token from: https://linear.app/settings/api');
    console.log('Note: Use your LINEAR_ACCESS_TOKEN (not API key)');
    console.log('');
    rl.question('Enter your Linear access token: ', (token) => {
      rl.close();
      if (!token || token.trim() === '') {
        logError('No token provided. Extension will not work without a Linear access token.');
        process.exit(1);
      }
      resolve(token.trim());
    });
  });
}

/**
 * Logs a message with timestamp
 */
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

/**
 * Logs an error message with timestamp
 */
function logError(message) {
  console.error(`[${new Date().toISOString()}] ERROR: ${message}`);
}

/**
 * Ensures a directory exists
 */
async function ensureDirectory(dirPath) {
  try {
    await fs.access(dirPath);
    log(`Directory exists: ${dirPath}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      log(`Creating directory: ${dirPath}`);
      await fs.mkdir(dirPath, { recursive: true });
    } else {
      throw error;
    }
  }
}

/**
 * Deletes the existing manifest file if it exists
 */
async function deleteExistingManifest() {
  try {
    await fs.access(MANIFEST_PATH);
    log('Deleting existing manifest.json');
    await fs.unlink(MANIFEST_PATH);
    log('Existing manifest.json deleted successfully');
  } catch (error) {
    if (error.code === 'ENOENT') {
      log('No existing manifest.json found');
    } else {
      throw new Error(`Failed to delete existing manifest: ${error.message}`);
    }
  }
}

/**
 * Creates a clean manifest.json based on dxt schema
 */
async function createCleanManifest(linearToken) {
  log('Creating clean manifest.json with Linear token');
  
  const cleanManifest = {
    "dxt_version": "0.1",
    "name": "claude-extension",
    "version": "1.0.0",
    "description": "A DXT extension",
    "author": {
      "name": "Unknown Author"
    },
    "server": {
      "type": "node",
      "entry_point": "server/simple-server.js",
      "mcp_config": {
        "command": "node",
        "args": ["${__dirname}/server/simple-server.js"],
        "env": {
          "LINEAR_ACCESS_TOKEN": linearToken
        }
      }
    },
    "license": "MIT"
  };
  
  try {
    await fs.writeFile(MANIFEST_PATH, JSON.stringify(cleanManifest, null, 2));
    log('Clean manifest.json created successfully with Linear token');
    return cleanManifest;
  } catch (error) {
    throw new Error(`Failed to create clean manifest: ${error.message}`);
  }
}

/**
 * Updates the manifest with our specific metadata
 */
async function updateManifestMetadata() {
  try {
    log('Reading generated manifest.json');
    const manifestContent = await fs.readFile(MANIFEST_PATH, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    log('Updating manifest metadata');
    
    // Update only the metadata fields, preserving dxt structure
    manifest.name = EXTENSION_METADATA.name;
    manifest.description = EXTENSION_METADATA.description;
    manifest.version = EXTENSION_METADATA.version;
    manifest.author = EXTENSION_METADATA.author;
    
    // CRITICAL: Ensure the server entry point uses simple-server.js (ES module compatible)
    if (manifest.server) {
      manifest.server.entry_point = 'server/simple-server.js';
      // Also update mcp_config to match
      if (manifest.server.mcp_config && manifest.server.mcp_config.args) {
        manifest.server.mcp_config.args = ["${__dirname}/server/simple-server.js"];
      }
    }
    
    log('Writing updated manifest.json');
    await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    log('Manifest metadata updated successfully');
    
    return manifest;
  } catch (error) {
    throw new Error(`Failed to update manifest metadata: ${error.message}`);
  }
}

/**
 * Validates that the manifest has the expected structure
 */
async function validateManifest() {
  try {
    const manifestContent = await fs.readFile(MANIFEST_PATH, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    // Check required fields
    const requiredFields = ['dxt_version', 'name', 'version', 'description', 'server'];
    for (const field of requiredFields) {
      if (!manifest[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Check server structure
    if (!manifest.server.entry_point) {
      throw new Error('Missing server.entry_point field');
    }
    
    // Validate mcp_config structure
    if (!manifest.server.mcp_config) {
      throw new Error('Missing required server.mcp_config field');
    }
    
    // Warn about potentially problematic fields (excluding mcp_config which is required)
    const problematicFields = ['entry', 'useBuiltInNode', 'command', 'args', 'env', 'timeout'];
    const foundProblematic = problematicFields.filter(field => 
      manifest.server[field] !== undefined
    );
    
    if (foundProblematic.length > 0) {
      logError(`Warning: Found potentially problematic server fields: ${foundProblematic.join(', ')}`);
      logError('These fields may cause dxt validation errors');
    }
    
    log('Internal manifest validation completed');
    return manifest;
  } catch (error) {
    throw new Error(`Manifest validation failed: ${error.message}`);
  }
}

/**
 * Validates the manifest using dxt validate command
 */
async function validateWithDxt() {
  return new Promise((resolve, reject) => {
    log('Running dxt validate to verify manifest schema');
    
    const dxtProcess = spawn('npx', ['-y', '@anthropic-ai/dxt', 'validate', 'manifest.json'], {
      cwd: EXTENSION_DIR,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    dxtProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      log(`dxt validate: ${output.trim()}`);
    });

    dxtProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      if (output.trim()) {
        logError(`dxt validate error: ${output.trim()}`);
      }
    });

    dxtProcess.on('close', (code) => {
      if (code === 0) {
        log('dxt validation passed successfully');
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`dxt validation failed with exit code ${code}. stderr: ${stderr}`));
      }
    });

    dxtProcess.on('error', (error) => {
      reject(new Error(`Failed to run dxt validate: ${error.message}`));
    });

    // Set a timeout for the process
    setTimeout(() => {
      dxtProcess.kill('SIGTERM');
      reject(new Error('dxt validate process timed out after 15 seconds'));
    }, 15000);
  });
}

/**
 * Main build function
 */
async function buildClaudeExtension() {
  try {
    log('Starting Claude extension build process');
    
    // Step 0: Get Linear token
    const linearToken = await promptForToken();
    
    // Ensure the extension directory exists
    await ensureDirectory(EXTENSION_DIR);
    await ensureDirectory(SERVER_DIR);
    
    // Step 1: Delete existing manifest
    await deleteExistingManifest();
    
    // Step 2: Create clean manifest with token
    await createCleanManifest(linearToken);
    
    // Step 3: Update manifest metadata
    const manifest = await updateManifestMetadata();
    
    // Step 4: Validate the manifest
    await validateManifest();
    
    // Step 5: Validate with dxt
    await validateWithDxt();
    
    log('Claude extension build completed successfully');
    log(`Generated manifest for: ${manifest.name} v${manifest.version}`);
    log(`Manifest location: ${MANIFEST_PATH}`);
    log(`✅ Linear token included in extension`);
    
    return manifest;
  } catch (error) {
    logError(`Build failed: ${error.message}`);
    
    // Provide helpful troubleshooting information
    if (error.message.includes('dxt')) {
      logError('Troubleshooting tips:');
      logError('1. Ensure @anthropic-ai/dxt is available (run: npm install -g @anthropic-ai/dxt)');
      logError('2. Check that the manifest.json follows the dxt schema');
      logError('3. Verify the server entry point file exists');
    }
    
    if (error.message.includes('ENOENT')) {
      logError('File system error - check that all required directories and files exist');
    }
    
    if (error.message.includes('permission')) {
      logError('Permission error - check file/directory permissions');
    }
    
    // Exit with error code
    if (typeof process !== 'undefined' && process.exit) {
      process.exit(1);
    } else {
      throw error;
    }
  }
}

// Run the build if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildClaudeExtension();
}

export { buildClaudeExtension };