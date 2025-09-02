#!/usr/bin/env node

import { execSync } from 'child_process';
import { buildClaudeExtension } from './build-claude-extension.js';
import { copyServerFiles } from './copy-server-files.js';
import { bundleExtension } from './bundle-extension.js';

/**
 * Logs a message with timestamp
 */
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

/**
 * Complete build process for Claude Desktop extension
 */
async function buildCompleteExtension() {
  try {
    log('Starting complete extension build process');
    
    // Step 1: Build the TypeScript project
    log('Building TypeScript project...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Step 2: Copy server files to extension directory
    log('Copying server files...');
    await copyServerFiles();
    
    // Step 3: Bundle dependencies
    log('Bundling dependencies...');
    await bundleExtension();
    
    // Step 4: Generate clean manifest and validate
    log('Generating clean manifest...');
    await buildClaudeExtension();
    
    // Step 5: Package the extension
    log('Packaging extension with dxt...');
    execSync('npx -y @anthropic-ai/dxt pack', { 
      cwd: 'dist/claude-extension',
      stdio: 'inherit' 
    });
    
    log('✅ Complete extension build successful!');
    log('📦 Extension package: dist/claude-extension/claude-extension.dxt');
    log('');
    log('🚀 Installation instructions:');
    log('1. Open Claude Desktop');
    log('2. Go to Settings > Extensions');
    log('3. Click "Install Extension"');
    log('4. Select the .dxt file: dist/claude-extension/claude-extension.dxt');
    log('5. Configure LINEAR_ACCESS_TOKEN in extension settings');
    log('');
    log('💡 Get your Linear API token from: https://linear.app/settings/api');
    
  } catch (error) {
    console.error(`❌ Build failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the complete build if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildCompleteExtension();
}

export { buildCompleteExtension };