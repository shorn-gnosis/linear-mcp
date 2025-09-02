#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_DIR = path.join(__dirname, '..', 'dist', 'claude-extension', 'server');
const LAUNCH_SCRIPT = path.join(SERVER_DIR, 'launch.js');

console.log('Testing DXT server with proper MCP protocol...');
console.log('Server directory:', SERVER_DIR);
console.log('Launch script:', LAUNCH_SCRIPT);

const serverProcess = spawn('node', [LAUNCH_SCRIPT], {
  cwd: SERVER_DIR,
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    LINEAR_ACCESS_TOKEN: process.env.LINEAR_ACCESS_TOKEN || 'test-token'
  }
});

let stdout = '';
let stderr = '';

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  stdout += output;
  console.log('STDOUT:', output.trim());
});

serverProcess.stderr.on('data', (data) => {
  const output = data.toString();
  stderr += output;
  console.log('STDERR:', output.trim());
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code: ${code}`);
  if (code === 0) {
    console.log('✅ Server shut down gracefully');
  } else {
    console.log('❌ Server exited unexpectedly');
    console.log('Full stderr:', stderr);
  }
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server process:', error.message);
});

// Send proper MCP initialize message (matching Claude Desktop's format)
setTimeout(() => {
  console.log('Sending MCP initialize message (Claude Desktop format)...');
  const initMessage = JSON.stringify({
    jsonrpc: "2.0",
    id: 0,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18", // Match Claude Desktop's version
      capabilities: {},
      clientInfo: {
        name: "claude-ai",
        version: "0.1.0"
      }
    }
  }) + '\n';
  
  serverProcess.stdin.write(initMessage);
}, 2000);

// Send a tools list request after initialize
setTimeout(() => {
  console.log('Sending tools/list request...');
  const toolsMessage = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  }) + '\n';
  
  serverProcess.stdin.write(toolsMessage);
}, 4000);

// Keep server running for 10 seconds to test stability
setTimeout(() => {
  console.log('Server has been running for 10 seconds - sending SIGTERM...');
  serverProcess.kill('SIGTERM');
}, 10000);

// Force kill if it doesn't shut down gracefully
setTimeout(() => {
  if (!serverProcess.killed) {
    console.log('Force killing server...');
    serverProcess.kill('SIGKILL');
  }
}, 12000);