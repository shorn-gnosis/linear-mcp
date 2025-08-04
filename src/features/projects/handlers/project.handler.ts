import { BaseHandler } from '../../../core/handlers/base.handler.js';
import { BaseToolResponse } from '../../../core/interfaces/tool-handler.interface.js';
import { LinearAuth } from '../../../auth.js';
import { LinearGraphQLClient } from '../../../graphql/client.js';

/**
 * Handler for project-related operations.
 * Manages creating, searching, and retrieving project information.
 */
export class ProjectHandler extends BaseHandler {
  constructor(auth: LinearAuth, graphqlClient?: LinearGraphQLClient) {
    super(auth, graphqlClient);
  }

  /**
   * Creates a new project with associated issues.
   */
  /**
   * Creates a new project with associated issues
   * @example
   * ```typescript
   * const result = await handler.handleCreateProjectWithIssues({
   *   project: {
   *     name: "Q1 Planning",
   *     description: "Q1 2025 Planning Project",
   *     teamIds: ["team-id-1"], // Required: Array of team IDs
   *   },
   *   issues: [{
   *     title: "Project Setup",
   *     description: "Initial project setup tasks",
   *     teamId: "team-id-1"
   *   }]
   * });
   * ```
   */
  async handleCreateProjectWithIssues(args: any): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ['project', 'issues']);

      // Validate project input
      if (!args.project.teamIds || !Array.isArray(args.project.teamIds) || args.project.teamIds.length === 0) {
        throw new Error(
          'Project requires teamIds as an array with at least one team ID.\n' +
          'Example:\n' +
          '{\n' +
          '  project: {\n' +
          '    name: "Project Name",\n' +
          '    teamIds: ["team-id-1"]\n' +
          '  },\n' +
          '  issues: [{ title: "Issue Title", teamId: "team-id-1" }]\n' +
          '}'
        );
      }

      if (!Array.isArray(args.issues)) {
        throw new Error(
          'Issues parameter must be an array of issue objects.\n' +
          'Example: issues: [{ title: "Issue Title", teamId: "team-id-1" }]'
        );
      }

      // Validate each issue has required teamId
      args.issues.forEach((issue: any, index: number) => {
        if (!issue.teamId) {
          throw new Error(
            `Issue at index ${index} is missing required teamId.\n` +
            'Each issue must have a teamId that matches one of the project teamIds.'
          );
        }
      });

      const result = await client.createProjectWithIssues(
        args.project,
        args.issues
      );

      if (!result.projectCreate.success || (result.issueBatchCreate && !result.issueBatchCreate.success)) {
        throw new Error('Failed to create project or issues');
      }

      const { project } = result.projectCreate;
      const issuesCreated = result.issueBatchCreate?.issues.length ?? 0;

      const response = [
        `Successfully created project with issues`,
        `Project: ${project.name}`,
        `Project URL: ${project.url}`
      ];

      if (issuesCreated > 0) {
        response.push(`Issues created: ${issuesCreated}`);
        // Add details for each issue
        result.issueBatchCreate?.issues.forEach(issue => {
          response.push(`- ${issue.identifier}: ${issue.title} (${issue.url})`);
        });
      }

      return this.createResponse(response.join('\n'));
    } catch (error) {
      this.handleError(error, 'create project with issues');
    }
  }

  /**
   * Gets information about a specific project.
   */
  async handleGetProject(args: any): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ['id']);

      const result = await client.getProject(args.id);

      // Return the project object directly so callers can access enriched fields like priority/status/teams
      return this.createJsonResponse(result);
    } catch (error) {
      this.handleError(error, 'get project info');
    }
  }

  /**
   * Searches for projects by name.
   */
  async handleSearchProjects(args: any): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ['name']);

      const {
        ignoreDefaultTeamScope = false,
        onlyCRCAndGRO = true
      } = args;

      const result = await client.searchProjects({
        name: { eq: args.name }
      });

      // Default CRC/GRO scope on search results (client-side)
      if (!ignoreDefaultTeamScope) {
        const DEFAULT_CRC = '5870febf-b340-44b0-89eb-1f7127618e9f';
        const DEFAULT_GRO = '355a6c2f-a0db-4ae8-8218-c2c6f303f989';
        const allowedTeamIds = onlyCRCAndGRO ? [DEFAULT_CRC, DEFAULT_GRO] : [DEFAULT_CRC];

        const filteredNodes = (result.projects?.nodes ?? []).filter((p: any) => {
          const teamNodes = p?.teams?.nodes ?? [];
          return teamNodes.some((t: any) => allowedTeamIds.includes(t.id));
        });

        const filtered = {
          projects: {
            nodes: filteredNodes
          }
        };
        return this.createJsonResponse(filtered);
      }

      return this.createJsonResponse(result);
    } catch (error) {
      this.handleError(error, 'search projects');
    }
  }

  /**
   * Lists projects with pagination and optional filters.
   * Supports convenience onlyCRCAndGRO flag which injects CRC/GRO team IDs if teamIds not provided.
   */
  async handleListProjects(args: any = {}): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();

      const {
        first = 50,
        after,
        teamIds,
        states,
        includeArchived = false,
        query,
        onlyCRCAndGRO = true, // default to CRC/GRO scoping
        ignoreDefaultTeamScope = false
      } = args;

      // Default CRC/GRO team IDs (client-side filter since ProjectFilter doesn't support team filter)
      const DEFAULT_CRC = '5870febf-b340-44b0-89eb-1f7127618e9f';
      const DEFAULT_GRO = '355a6c2f-a0db-4ae8-8218-c2c6f303f989';

      // Determine effective team scope preference (used for client-side filtering)
      const preferTeamScope = !ignoreDefaultTeamScope && (!Array.isArray(teamIds) || teamIds.length === 0);

      // Build Linear ProjectFilter (do NOT include team constraints here — not supported by ProjectFilter)
      const filter: Record<string, unknown> = {};

      if (Array.isArray(states) && states.length > 0) {
        // ProjectFilter: status: { type: { in: [...] } }
        filter.status = { type: { in: states } };
      }
      // Do NOT include archived in GraphQL filter (not supported by ProjectFilter). We'll handle client-side.
      if (query && typeof query === 'string' && query.trim().length > 0) {
        // ProjectFilter query: { contains: "text" }
        filter.query = { contains: query };
      }

      // If no filters were set, pass undefined to avoid sending empty object
      const finalFilter = Object.keys(filter).length ? filter : undefined;

      const result = await client.listProjects(finalFilter, first, after);

      // Client-side team filtering to default to CRC (and optionally GRO) scope
      if (preferTeamScope) {
        const allowedTeamIds = onlyCRCAndGRO ? [DEFAULT_CRC, DEFAULT_GRO] : [DEFAULT_CRC];
        const filteredNodes = (result.projects?.nodes ?? []).filter((p: any) => {
          const teamNodes = p?.teams?.nodes ?? [];
          return teamNodes.some((t: any) => allowedTeamIds.includes(t.id));
        });
        const filtered = {
          projects: {
            pageInfo: result.projects.pageInfo,
            nodes: filteredNodes,
          },
        };
        return this.createJsonResponse(filtered);
      }

      return this.createJsonResponse(result);
    } catch (error) {
      this.handleError(error, 'list projects');
    }
  }
}
