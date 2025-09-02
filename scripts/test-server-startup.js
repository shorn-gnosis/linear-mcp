#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_DIR = path.join(__dirname, '..', 'dist', 'claude-extension', 'server');
const LAUNCH_SCRIPT = path.join(SERVER_DIR, 'launch.js');

console.log('Testing server startup...');
console.log('Server directory:', SERVER_DIR);
console.log('Launch script:', LAUNCH_SCRIPT);

const serverProcess = spawn('node', [LAUNCH_SCRIPT], {
  cwd: SERVER_DIR,
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    LINEAR_ACCESS_TOKEN: 'test-token' // Provide a test token
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
    console.log('✅ Server started successfully');
  } else {
    console.log('❌ Server failed to start');
    console.log('Full stderr:', stderr);
  }
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server process:', error.message);
});

// Send a test MCP message after a short delay
setTimeout(() => {
  console.log('Sending test MCP initialize message...');
  const initMessage = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "test-client",
        version: "1.0.0"
      }
    }
  }) + '\n';
  
  serverProcess.stdin.write(initMessage);
}, 2000);

// Kill the process after 10 seconds
setTimeout(() => {
  console.log('Terminating test server...');
  serverProcess.kill('SIGTERM');
}, 10000);