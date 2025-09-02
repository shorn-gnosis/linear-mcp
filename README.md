# Linear MCP Server

A comprehensive MCP (Model Context Protocol) server for interacting with Linear's API. This server provides a complete toolkit for managing Linear issues, projects, teams, and initiatives through Claude Desktop.

## 🎉 Claude Desktop Extension (Recommended)

The easiest way to use this Linear MCP server is through the Claude Desktop extension.

### Quick Setup

1. **Get your Linear Access Token**:
   - Go to [Linear Settings → API](https://linear.app/settings/api)
   - Create a new "Personal API key"
   - Copy the token (starts with `lin_oauth_...`)

2. **Build the Extension**:
   ```bash
   git clone https://github.com/your-repo/linear-mcp
   cd linear-mcp
   npm install
   npm run build
   node scripts/build-claude-extension.js
   ```

3. **Install in Claude Desktop**:
   - Open Claude Desktop
   - Go to Settings → Extensions
   - Install the generated `dist/claude-extension/claude-extension.dxt` file
   - The extension will prompt for your Linear token during build

### Available Tools (18 Total)

#### 🔧 Core Tools
- **test_connection** - Test Linear API connection and show user info
- **linear_get_user** - Get current user information  
- **linear_get_teams** - Get all teams with states and labels

#### 📝 Issue Management
- **linear_search_issues** - Advanced issue search with filtering
- **linear_create_issue** - Create single issue with priorities, estimates, projects
- **linear_create_issues** - Create multiple issues at once
- **linear_bulk_update_issues** - Update multiple issues (states, assignees, priorities)
- **linear_delete_issue** - Delete single issue
- **linear_delete_issues** - Delete multiple issues

#### 📊 Project Management
- **linear_list_projects** - List projects with filtering (priorities, status, teams)
- **linear_get_project** - Get detailed project information
- **linear_search_projects** - Search projects by name
- **linear_create_project_with_issues** - Create project with associated issues

#### 🚀 Advanced Features
- **linear_probe_initiatives** - Check if Initiatives are available in workspace
- **linear_list_initiatives** - List initiatives with full details

#### 🔐 Authentication (Placeholders)
- **linear_auth** - OAuth initialization (not supported in extension)
- **linear_auth_callback** - OAuth callback (not supported in extension)

## 🖥️ Standalone MCP Server (Alternative)

You can also run this as a standalone MCP server for other MCP clients.

### Setup

1. **Clone and Install**:
   ```bash
   git clone https://github.com/your-repo/linear-mcp
   cd linear-mcp
   npm install
   ```

2. **Configure Authentication**:
   ```bash
   cp .env.example .env
   # Add your Linear API key to .env
   LINEAR_ACCESS_TOKEN=your_linear_token
   ```

3. **Build and Run**:
   ```bash
   npm run build
   npm start
   ```

### MCP Client Integration

Add to your MCP client configuration:
```json
{
  "mcpServers": {
    "linear": {
      "command": "node",
      "args": ["/path/to/linear-mcp/build/index.js"],
      "env": {
        "LINEAR_ACCESS_TOKEN": "your_linear_token"
      }
    }
  }
}
```

## ✨ Key Features

### 🔍 Advanced Search & Filtering
- Search issues by text, identifier, team, assignee, state, priority
- Filter projects by status, teams, dates
- Pagination support for large datasets

### 🎯 Comprehensive Issue Management
- Create issues with priorities, estimates, labels, projects
- Bulk operations for creating, updating, and deleting issues
- Support for issue relationships and project associations

### 📊 Project & Team Operations
- Create projects with associated issues and multiple teams
- Get detailed project information including progress and metrics
- Access team workflows, states, and labels

### 🚀 Enterprise Features
- Initiative support for workspaces that have it enabled
- Bulk operations optimized for large-scale management
- Comprehensive error handling and validation

### 🔐 Secure Authentication
- Personal Access Token support (recommended)
- Token validation and secure storage
- Graceful handling of authentication failures

## 🛠️ Tool Examples

### Create an Issue
```javascript
// Using linear_create_issue
{
  "title": "Fix login bug",
  "description": "Users can't log in with Google OAuth",
  "teamId": "team-123",
  "priority": 2,
  "estimate": 5,
  "projectId": "project-456"
}
```

### Search Issues
```javascript
// Using linear_search_issues
{
  "query": "login bug",
  "teamIds": ["team-123"],
  "states": ["In Progress", "Todo"],
  "priority": 2,
  "first": 20
}
```

### Create Project with Issues
```javascript
// Using linear_create_project_with_issues
{
  "project": {
    "name": "Q1 2025 Planning",
    "description": "Strategic initiatives for Q1",
    "teamIds": ["team-123", "team-456"]
  },
  "issues": [
    {
      "title": "Define Q1 goals",
      "description": "Set quarterly objectives",
      "teamId": "team-123"
    }
  ]
}
```

## 🔧 Development

### Building from Source

```bash
# Install dependencies
npm install

# Build TypeScript source
npm run build

# Build Claude Desktop extension
node scripts/build-claude-extension.js

# Package extension for distribution
cd dist/claude-extension && npx -y @anthropic-ai/dxt pack
```

### Testing

```bash
# Run unit tests
npm test

# Run integration tests (requires LINEAR_ACCESS_TOKEN)
npm run test:integration

# Test server startup
node scripts/test-server-startup.js
```

### Project Structure

```
linear-mcp/
├── src/                          # TypeScript source code
│   ├── features/                 # Feature-specific handlers
│   │   ├── issues/              # Issue management
│   │   ├── projects/            # Project management  
│   │   ├── teams/               # Team operations
│   │   └── users/               # User operations
│   ├── core/                    # Core MCP infrastructure
│   ├── graphql/                 # GraphQL client and queries
│   └── index.ts                 # Main server entry point
├── dist/claude-extension/        # Claude Desktop extension
│   ├── server/simple-server.js  # Working extension server
│   ├── manifest.json            # Extension manifest
│   └── claude-extension.dxt     # Packaged extension
├── scripts/                     # Build and utility scripts
└── build/                       # Compiled JavaScript output
```

## 🐛 Troubleshooting

### Claude Desktop Extension Issues

1. **"Unable to connect to extension server"**
   - Ensure you're using the latest packaged `.dxt` file
   - Check that your Linear token is valid
   - Try reinstalling the extension

2. **"require is not defined" errors**
   - This is fixed in the current version
   - Make sure you're using `simple-server.js` as the entry point

3. **Missing Linear tools**
   - Verify the extension installed correctly
   - Check that all 18 tools are visible in Claude Desktop permissions

### API Issues

1. **Authentication failures**
   - Verify your Linear token is correct and hasn't expired
   - Ensure the token has appropriate permissions
   - Check Linear API status

2. **GraphQL errors**
   - Some features (like Initiatives) may not be available in all workspaces
   - Use `linear_probe_initiatives` to check availability

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📚 Resources

- [Linear API Documentation](https://developers.linear.app/)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Claude Desktop Extensions](https://claude.ai/extensions)
