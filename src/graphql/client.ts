import { LinearClient } from '@linear/sdk';
import { DocumentNode } from 'graphql';
import { 
  CreateIssueInput, 
  CreateIssuesInput,
  CreateIssueResponse,
  CreateIssuesResponse,
  UpdateIssueInput,
  UpdateIssuesResponse,
  SearchIssuesInput,
  SearchIssuesResponse,
  DeleteIssueResponse,
  Issue,
  IssueBatchResponse
} from '../features/issues/types/issue.types.js';
import {
  ProjectInput,
  ProjectResponse,
  SearchProjectsResponse
} from '../features/projects/types/project.types.js';
import {
  TeamResponse,
  LabelInput,
  LabelResponse
} from '../features/teams/types/team.types.js';
import {
  UserResponse
} from '../features/users/types/user.types.js';

export class LinearGraphQLClient {
  private linearClient: LinearClient;

  constructor(linearClient: LinearClient) {
    this.linearClient = linearClient;
  }

  async execute<T, V extends Record<string, unknown> = Record<string, unknown>>(
    document: DocumentNode,
    variables?: V
  ): Promise<T> {
    const graphQLClient = this.linearClient.client;
    try {
      const response = await graphQLClient.rawRequest(
        document.loc?.source.body || '',
        variables
      );
      return response.data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`GraphQL operation failed: ${error.message}`);
      }
      throw error;
    }
  }

  // Create single issue
  async createIssue(input: CreateIssueInput): Promise<CreateIssueResponse> {
    const { CREATE_ISSUE_MUTATION } = await import('./mutations.js');
    return this.execute<CreateIssueResponse>(CREATE_ISSUE_MUTATION, { input });
  }

  // Create multiple issues
  async createIssues(issues: CreateIssueInput[]): Promise<IssueBatchResponse> {
    const { CREATE_BATCH_ISSUES } = await import('./mutations.js');
    return this.execute<IssueBatchResponse>(CREATE_BATCH_ISSUES, {
      input: { issues }
    });
  }

  // Create a project
  async createProject(input: ProjectInput): Promise<ProjectResponse> {
    const { CREATE_PROJECT } = await import('./mutations.js');
    return this.execute<ProjectResponse>(CREATE_PROJECT, { input });
  }

  // Create batch of issues
  async createBatchIssues(issues: CreateIssueInput[]): Promise<IssueBatchResponse> {
    const { CREATE_BATCH_ISSUES } = await import('./mutations.js');
    return this.execute<IssueBatchResponse>(CREATE_BATCH_ISSUES, {
      input: { issues }
    });
  }

  // Helper method to create a project with associated issues
  async createProjectWithIssues(projectInput: ProjectInput, issues: CreateIssueInput[]): Promise<ProjectResponse> {
    // Create project first
    const projectResult = await this.createProject(projectInput);
    
    if (!projectResult.projectCreate.success) {
      throw new Error('Failed to create project');
    }

    // Then create issues with project ID
    const issuesWithProject = issues.map(issue => ({
      ...issue,
      projectId: projectResult.projectCreate.project.id
    }));

    const issuesResult = await this.createBatchIssues(issuesWithProject);

    if (!issuesResult.issueBatchCreate.success) {
      throw new Error('Failed to create issues');
    }

    return {
      projectCreate: projectResult.projectCreate,
      issueBatchCreate: issuesResult.issueBatchCreate
    };
  }

  // Update a single issue
  async updateIssue(id: string, input: UpdateIssueInput): Promise<UpdateIssuesResponse> {
    const { UPDATE_ISSUE_MUTATION } = await import('./mutations.js');
    return this.execute<UpdateIssuesResponse>(UPDATE_ISSUE_MUTATION, {
      id,
      input,
    });
  }

  // Bulk update issues
  async updateIssues(ids: string[], input: UpdateIssueInput): Promise<UpdateIssuesResponse> {
    const { UPDATE_ISSUES_MUTATION } = await import('./mutations.js');
    return this.execute<UpdateIssuesResponse>(UPDATE_ISSUES_MUTATION, { ids, input });
  }

  // Create multiple labels
  async createIssueLabels(labels: LabelInput[]): Promise<LabelResponse> {
    const { CREATE_ISSUE_LABELS } = await import('./mutations.js');
    return this.execute<LabelResponse>(CREATE_ISSUE_LABELS, { labels });
  }

  // Search issues with pagination
  async searchIssues(
    filter: SearchIssuesInput['filter'], 
    first: number = 50, 
    after?: string, 
    orderBy: string = "updatedAt"
  ): Promise<SearchIssuesResponse> {
    const { SEARCH_ISSUES_QUERY } = await import('./queries.js');
    return this.execute<SearchIssuesResponse>(SEARCH_ISSUES_QUERY, {
      filter,
      first,
      after,
      orderBy,
    });
  }

  // Get teams with their states and labels
  async getTeams(): Promise<TeamResponse> {
    const { GET_TEAMS_QUERY } = await import('./queries.js');
    return this.execute<TeamResponse>(GET_TEAMS_QUERY);
  }

  // Get current user info
  async getCurrentUser(): Promise<UserResponse> {
    const { GET_USER_QUERY } = await import('./queries.js');
    return this.execute<UserResponse>(GET_USER_QUERY);
  }

  // Get project info
  async getProject(id: string): Promise<ProjectResponse> {
    const { GET_PROJECT_QUERY } = await import('./queries.js');
    return this.execute<ProjectResponse>(GET_PROJECT_QUERY, { id });
  }

  // Search projects
  async searchProjects(filter: { name?: { eq: string } }): Promise<SearchProjectsResponse> {
    const { SEARCH_PROJECTS_QUERY } = await import('./queries.js');
    return this.execute<SearchProjectsResponse>(SEARCH_PROJECTS_QUERY, { filter });
  }

  // List projects with pagination and filters
  async listProjects(
    filter: Record<string, unknown> | undefined,
    first: number = 50,
    after?: string
  ): Promise<SearchProjectsResponse & {
    projects: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    }
  }> {
    const { LIST_PROJECTS_QUERY } = await import('./queries.js');
    return this.execute(LIST_PROJECTS_QUERY as any, { filter, first, after });
  }

  // Probe initiatives connection (non-fatal): returns { ok, data?, error? }
  async probeInitiatives(first: number = 20, after?: string): Promise<{ ok: boolean; data?: any; error?: string }> {
    try {
      const { INITIATIVES_PROBE_QUERY } = await import('./queries.js');
      const data = await this.execute<any>(INITIATIVES_PROBE_QUERY, { first, after });
      return { ok: true, data };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { ok: false, error: msg };
    }
  }

  // Delete a single issue
  async deleteIssue(id: string): Promise<DeleteIssueResponse> {
    const { DELETE_ISSUE_MUTATION } = await import('./mutations.js');
    return this.execute<DeleteIssueResponse>(DELETE_ISSUE_MUTATION, {
      id,
    })
  }

  // Delete multiple issues
  async deleteIssues(ids: string[]): Promise<DeleteIssueResponse> {
    const { DELETE_ISSUES_MUTATION } = await import('./mutations.js');
    return this.execute<DeleteIssueResponse>(DELETE_ISSUES_MUTATION, { ids });
  }

  // List initiatives with pagination (minimal fields)
  async listInitiatives(
    first: number = 50,
    after?: string
  ): Promise<{
    initiatives: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: any[];
    };
  }> {
    const { LIST_INITIATIVES_QUERY } = await import('./queries.js');
    return this.execute<any>(LIST_INITIATIVES_QUERY, { first, after });
  }
}
