# Implementation Plan

- [x] 1. Create build automation script for clean manifest generation
  - Write a Node.js script that deletes existing manifest, runs dxt init with automated responses, and updates metadata fields only
  - Add error handling for dxt command failures and file system operations
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 2. Enhance launch.js entry point with improved logging and validation
  - Add comprehensive environment variable validation and logging for both LINEAR_ACCESS_TOKEN and LINEAR_API_KEY
  - Implement better error handling with process lifecycle management and timeout for log flushing
  - Add startup diagnostics including Node.js version, process ID, and working directory logging
  - _Requirements: 2.2, 3.1, 5.1, 5.2_

- [ ] 3. Update package.json with new build commands
  - Add npm scripts for clean manifest generation, server file copying, and complete extension packaging
  - Create commands for development workflow including build, package, and install steps
  - _Requirements: 4.1, 4.4_

- [x] 4. Implement server file copying and permission handling
  - Write script to copy built server files from build/ to dist/claude-extension/server/ with proper permissions
  - Ensure executable permissions are set on entry point files
  - Handle file system errors and provide clear error messages
  - _Requirements: 4.4_

- [ ] 5. Add comprehensive error handling to index.js warmup process
  - Enhance warmup error logging with specific error types and troubleshooting hints
  - Improve ensureWarm timeout handling with clear timeout warnings
  - Add authentication failure handling that doesn't crash the server
  - _Requirements: 3.2, 3.3, 3.4, 5.2_

- [ ] 6. Create integration test script for Claude Desktop workflow
  - Write test script that validates complete build, package, and installation process
  - Add tests for environment variable configuration and server startup verification
  - Include tests for both authenticated and unauthenticated scenarios
  - _Requirements: 1.2, 2.1, 3.1_

- [ ] 7. Update README with new build process documentation
  - Document the new clean build workflow with step-by-step instructions
  - Add troubleshooting section for common dxt packaging issues
  - Include environment variable configuration guide for Claude Desktop
  - _Requirements: 5.3_