import { BaseHandler } from '../../../core/handlers/base.handler.js';
import { BaseToolResponse } from '../../../core/interfaces/tool-handler.interface.js';
import { LinearAuth } from '../../../auth.js';
import { LinearGraphQLClient } from '../../../graphql/client.js';

/**
 * Handler for probing Initiatives availability in the Linear GraphQL schema.
 * This is a temporary diagnostic tool that safely attempts to read initiatives.
 */
export class InitiativesHandler extends BaseHandler {
  constructor(auth: LinearAuth, graphqlClient?: LinearGraphQLClient) {
    super(auth, graphqlClient);
  }

  /**
   * List initiatives with pagination (minimal fields).
   * Input:
   *  - first?: number (default 50)
   *  - after?: string (cursor)
   */
  async handleListInitiatives(args: any = {}): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();

      const first = typeof args.first === 'number' ? args.first : 50;
      const after = typeof args.after === 'string' ? args.after : undefined;

      const data = await client.listInitiatives(first, after);
      return this.createJsonResponse(data);
    } catch (error) {
      this.handleError(error, 'list initiatives');
    }
  }

  /**
   * Probes whether the Initiatives connection exists in this workspace's GraphQL schema.
   * Returns a JSON payload with either nodes data or a clear error message.
   * Input:
   *  - first?: number (default 20)
   *  - after?: string (cursor)
   */
  async handleProbeInitiatives(args: any = {}): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();

      const first = typeof args.first === 'number' ? args.first : 20;
      const after = typeof args.after === 'string' ? args.after : undefined;

      const result = await client.probeInitiatives(first, after);

      if (result.ok) {
        return this.createJsonResponse({
          ok: true,
          data: result.data
        });
      } else {
        return this.createJsonResponse({
          ok: false,
          error: result.error
        });
      }
    } catch (error) {
      this.handleError(error, 'probe initiatives');
    }
  }
}
