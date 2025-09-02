#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BUILD_DIR = path.join(__dirname, '..', 'build');
const EXTENSION_SERVER_DIR = path.join(__dirname, '..', 'dist', 'claude-extension', 'server');

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
 * Recursively copy directory contents
 */
async function copyDirectory(src, dest) {
  try {
    await fs.mkdir(dest, { recursive: true });
    
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
        log(`Copied: ${path.relative(BUILD_DIR, srcPath)} -> ${path.relative(EXTENSION_SERVER_DIR, destPath)}`);
      }
    }
  } catch (error) {
    throw new Error(`Failed to copy directory ${src} to ${dest}: ${error.message}`);
  }
}

/**
 * Set executable permissions on entry point files
 */
async function setExecutablePermissions() {
  const entryPoints = [
    path.join(EXTENSION_SERVER_DIR, 'index.js'),
    path.join(EXTENSION_SERVER_DIR, 'launch.js')
  ];
  
  for (const file of entryPoints) {
    try {
      await fs.access(file);
      await fs.chmod(file, 0o755);
      log(`Set executable permissions: ${path.relative(EXTENSION_SERVER_DIR, file)}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        logError(`Failed to set permissions on ${file}: ${error.message}`);
      }
    }
  }
}

/**
 * Create an improved launch.js file
 */
async function createLaunchScript() {
  const launchScript = `#!/usr/bin/env node
// Launch shim to surface runtime errors and ensure process stays alive long enough for logs.

const log = (...args) => {
  try { console.error('[linear-mcp:launch]', ...args); } catch (_) {}
};

process.on('uncaughtException', (err) => {
  log('uncaughtException:', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason) => {
  log('unhandledRejection:', reason && reason.stack ? reason.stack : reason);
});

(async () => {
  try {
    log('boot start');
    log('node', process.version, 'pid', process.pid);
    log('cwd', process.cwd());

    // Check for both LINEAR_ACCESS_TOKEN and LINEAR_API_KEY
    const accessToken = process.env.LINEAR_ACCESS_TOKEN;
    const apiKey = process.env.LINEAR_API_KEY;
    const hasToken = Boolean(accessToken || apiKey);
    
    log('env.LINEAR_ACCESS_TOKEN set:', Boolean(accessToken));
    log('env.LINEAR_API_KEY set:', Boolean(apiKey));
    
    if (!hasToken) {
      log('WARNING: Neither LINEAR_ACCESS_TOKEN nor LINEAR_API_KEY is set.');
      log('WARNING: Server may fail when calling Linear APIs.');
      log('WARNING: Set LINEAR_ACCESS_TOKEN in Claude Desktop extension settings.');
    } else {
      log('Authentication token found - server should work correctly');
    }

    // Import the actual stdio server entry.
    log('importing ./index.js');
    await import('./index.js');

    log('index.js imported successfully, awaiting MCP initialize...');
  } catch (err) {
    log('fatal during launch:', err && err.stack ? err.stack : err);
    // Keep process alive briefly so logs flush
    setTimeout(() => process.exit(1), 2000);
  }
})();
`;

  const launchPath = path.join(EXTENSION_SERVER_DIR, 'launch.js');
  await fs.writeFile(launchPath, launchScript);
  await fs.chmod(launchPath, 0o755);
  log('Created improved launch.js');
}

/**
 * Main copy function
 */
async function copyServerFiles() {
  try {
    log('Starting server file copy process');
    
    // Ensure extension server directory exists
    await fs.mkdir(EXTENSION_SERVER_DIR, { recursive: true });
    
    // Copy all built files from build/ to extension server directory
    log(`Copying files from ${BUILD_DIR} to ${EXTENSION_SERVER_DIR}`);
    await copyDirectory(BUILD_DIR, EXTENSION_SERVER_DIR);
    
    // Create improved launch.js
    await createLaunchScript();
    
    // Set executable permissions
    await setExecutablePermissions();
    
    log('Server file copy completed successfully');
    log(`Extension server directory: ${EXTENSION_SERVER_DIR}`);
    
  } catch (error) {
    logError(`Copy failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the copy if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  copyServerFiles();
}

export { copyServerFiles };