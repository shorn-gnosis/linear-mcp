# Changelog

All notable changes to the Linear MCP Server project will be documented in this file.

## [1.0.0] - 2025-01-08

### 🎉 Major Release - Claude Desktop Extension

This release represents a complete rewrite and major breakthrough after resolving critical ES module compatibility issues.

### ✨ Added

#### Claude Desktop Extension
- **Complete Claude Desktop extension** with working `.dxt` package
- **18 comprehensive Linear tools** covering all major Linear operations
- **Simple, stable server architecture** using ES modules
- **Automated build process** with token embedding
- **One-click installation** for Claude Desktop

#### Core Tools
- `test_connection` - Test Linear API connection with user info
- `linear_get_user` - Get current user information
- `linear_get_teams` - Get all teams with states and labels

#### Issue Management (9 tools)
- `linear_search_issues` - Advanced search with filtering and pagination
- `linear_create_issue` - Create single issue with full field support
- `linear_create_issues` - Bulk issue creation
- `linear_bulk_update_issues` - Update multiple issues simultaneously
- `linear_delete_issue` - Delete single issue
- `linear_delete_issues` - Bulk issue deletion

#### Project Management (4 tools)
- `linear_list_projects` - List projects with advanced filtering
- `linear_get_project` - Get detailed project information
- `linear_search_projects` - Search projects by name
- `linear_create_project_with_issues` - Create project with associated issues

#### Advanced Features (2 tools)
- `linear_probe_initiatives` - Check Initiative availability
- `linear_list_initiatives` - List initiatives with full details

### 🔧 Technical Improvements

#### Architecture
- **ES Module compatibility** - Fixed "require is not defined" errors
- **Simple JSON-RPC implementation** - Direct stdio communication
- **Minimal dependencies** - Reduced complexity and failure points
- **Comprehensive error handling** - Graceful degradation and clear error messages

#### Build System
- **Automated extension building** with `build:extension` script
- **Token embedding** during build process
- **dxt validation** and packaging
- **Working backup system** to prevent losing stable versions

#### Documentation
- **Complete tool reference** (TOOLS.md) with examples
- **Updated README** with Claude Desktop focus
- **Success documentation** (CLAUDE_EXTENSION_SUCCESS.md)
- **Troubleshooting guides** for common issues

### 🐛 Fixed

#### Critical Issues
- **ES module "require is not defined" error** - Root cause of 3-day debugging session
- **Missing MCP methods** - Added required `resources/list` and `prompts/list`
- **Manifest schema conflicts** - Clean dxt-compliant manifest generation
- **Server startup failures** - Stable initialization process

#### API Issues
- **GraphQL query optimization** - Efficient Linear API usage
- **Authentication handling** - Support for both LINEAR_ACCESS_TOKEN and LINEAR_API_KEY
- **Error response formatting** - Consistent error handling across all tools

### 📚 Documentation

#### New Documentation
- `TOOLS.md` - Complete reference for all 18 tools with examples
- `CLAUDE_EXTENSION_SUCCESS.md` - Technical breakthrough documentation
- `dist/claude-extension/README-WORKING-SOLUTION.md` - Extension-specific guide
- Updated `README.md` - Focus on Claude Desktop extension

#### Build Documentation
- Build script documentation and usage
- Extension packaging process
- Troubleshooting common issues
- Development workflow

### 🔄 Changed

#### Breaking Changes
- **Primary focus shifted to Claude Desktop extension** (standalone MCP still supported)
- **ES module architecture** - All imports use `import` syntax
- **Simplified server implementation** - Removed complex framework dependencies

#### API Changes
- **Consistent tool naming** - All Linear tools prefixed with `linear_`
- **Standardized response format** - Text responses for simple operations, JSON for complex data
- **Enhanced parameter validation** - Better error messages for invalid inputs

### 🚀 Performance

#### Optimizations
- **Direct HTTPS requests** - No SDK overhead for simple operations
- **Bulk operations** - Efficient batch processing for multiple items
- **Minimal server footprint** - Reduced memory usage and startup time
- **Fast extension loading** - Optimized for Claude Desktop integration

### 🔐 Security

#### Improvements
- **Secure token handling** - No tokens in source code or logs
- **Environment variable validation** - Proper token format checking
- **Graceful authentication failures** - Server remains stable without tokens

---

## Development Notes

### The 3-Day Debugging Journey

This release represents the resolution of a critical issue that took 3 days to solve:

**Problem**: Extension repeatedly failed with "Unable to connect to extension server" and "require is not defined in ES module scope" errors.

**Root Cause**: The `server/package.json` contained `"type": "module"` which made all `.js` files ES modules, but the server code was using CommonJS `require()` syntax.

**Solution**: Convert all server code to use ES module `import` statements instead of `require()`.

**Key Learning**: Always check package.json module type when debugging ES module errors.

### Architecture Decision

After multiple failed attempts with complex frameworks and SDK integrations, the breakthrough came from simplifying the architecture:

1. **Direct HTTPS requests** instead of SDK wrappers
2. **Simple JSON-RPC over stdio** instead of complex MCP frameworks  
3. **Minimal dependencies** instead of comprehensive toolkits
4. **ES module imports** instead of mixed module systems

This approach proved more reliable and easier to debug than the previous complex implementations.

---

## Migration Guide

### From Previous Versions

If you were using a previous version of this MCP server:

1. **Update to Claude Desktop extension** (recommended):
   ```bash
   npm run build:extension
   # Install the generated .dxt file in Claude Desktop
   ```

2. **Or continue using standalone MCP**:
   ```bash
   npm run build
   npm start
   ```

### Tool Name Changes

All Linear tools now have consistent `linear_` prefixes:
- `get_teams` → `linear_get_teams`
- `create_issue` → `linear_create_issue`
- `search_issues` → `linear_search_issues`
- etc.

### Authentication

- **Claude Desktop**: Token embedded during build process
- **Standalone**: Use `LINEAR_ACCESS_TOKEN` environment variable

---

## Acknowledgments

Special thanks to the debugging process that led to this breakthrough. Sometimes the simplest solutions are the most effective.