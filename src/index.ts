#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { LinearAuth } from './auth.js';
import { LinearGraphQLClient } from './graphql/client.js';
import { HandlerFactory } from './core/handlers/handler.factory.js';
import { toolSchemas } from './core/types/tool.types.js';

/**
 * Main server class that handles MCP protocol interactions.
 * Delegates tool operations to domain-specific handlers.
 */
class LinearServer {
  private server: Server;
  private auth: LinearAuth;
  private graphqlClient?: LinearGraphQLClient;
  private handlerFactory: HandlerFactory;
  private warmupDone = false;

  constructor() {
    console.error('[linear-mcp] boot: start');
    this.server = new Server(
      {
        name: 'linear-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.auth = new LinearAuth();

    // Initialize handler factory (will receive client after warmup)
    this.handlerFactory = new HandlerFactory(this.auth, this.graphqlClient);

    this.setupRequestHandlers();

    // Error handling
    this.server.onerror = (error: unknown) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
    console.error('[linear-mcp] boot: constructed');
  }

  private setupRequestHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: Object.values(toolSchemas),
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        // Ensure warmup/lazy init before executing the tool if needed
        await this.ensureWarm();

        const { handler, method } = this.handlerFactory.getHandlerForTool(request.params.name);
        // Use type assertion to handle dynamic method access
        return await (handler as any)[method](request.params.arguments);
      } catch (error: unknown) {
        if (error instanceof Error && error.message.startsWith('No handler found')) {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
        }
        throw error;
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    console.error('[linear-mcp] connect: starting');
    await this.server.connect(transport);
    console.error('[linear-mcp] connect: complete');

    // Kick off warmup asynchronously; do not block initialize
    void this.warmup();

    console.error('Linear MCP server running on stdio');
  }

  // Warmup moves potentially slow work out of the constructor/initialize path
  private async warmup() {
    if (this.warmupDone) return;
    console.error('[linear-mcp] warmup: start');

    try {
      // Initialize with API Key if available (support both LINEAR_API_KEY and LINEAR_ACCESS_TOKEN)
      const apiKey = process.env.LINEAR_API_KEY || process.env.LINEAR_ACCESS_TOKEN;

      if (apiKey) {
        // This may perform validation/setup in LinearAuth; keep it here, away from initialize
        this.auth.initialize({
          type: 'api',
          apiKey,
        });
        this.graphqlClient = new LinearGraphQLClient(this.auth.getClient());

        // Update handler factory with the now-available client if it depends on it
        this.handlerFactory = new HandlerFactory(this.auth, this.graphqlClient);
      }

      this.warmupDone = true;
      console.error('[linear-mcp] warmup: done');
    } catch (err) {
      console.error('[linear-mcp] warmup: error', err);
      // Keep server usable for unauthenticated tools if any; do not throw
    }
  }

  // Ensure warmup completed, but do not hang forever
  private async ensureWarm(timeoutMs = 5000) {
    if (this.warmupDone) return;
    // Start warmup if not already running
    void this.warmup();

    // Wait up to timeoutMs for warmup to complete
    const start = Date.now();
    while (!this.warmupDone && Date.now() - start < timeoutMs) {
      await new Promise((r) => setTimeout(r, 50));
    }
    // If still not warm, proceed; tool handlers should handle missing auth/client appropriately
  }
}

const server = new LinearServer();
server.run().catch((e: unknown) => {
  console.error('[linear-mcp] run error', e);
});
