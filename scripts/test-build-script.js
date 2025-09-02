#!/usr/bin/env node

import { buildClaudeExtension } from './build-claude-extension.js';

/**
 * Simple test to verify the build script works correctly
 */
async function testBuildScript() {
  console.log('Testing build script...');
  
  try {
    const manifest = await buildClaudeExtension();
    
    // Verify the manifest has expected properties
    if (!manifest.name || !manifest.version || !manifest.description) {
      throw new Error('Generated manifest is missing required properties');
    }
    
    if (manifest.name !== 'linear-mcp-server') {
      throw new Error(`Expected name 'linear-mcp-server', got '${manifest.name}'`);
    }
    
    console.log('✅ Build script test passed!');
    console.log(`Generated manifest: ${manifest.name} v${manifest.version}`);
    
  } catch (error) {
    console.error('❌ Build script test failed:', error.message);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testBuildScript();
}