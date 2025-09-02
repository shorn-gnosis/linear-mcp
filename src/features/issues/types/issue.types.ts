import { BaseToolResponse } from '../../../core/interfaces/tool-handler.interface.js';

/**
 * Workflow state types for Linear issues
 */
export type WorkflowStateType = 'triage' | 'backlog' | 'unstarted' | 'started' | 'completed' | 'canceled';

/**
 * Enhanced workflow state interface
 */
export interface WorkflowState {
  id: string;
  name: string;
  type: WorkflowStateType;
  color: string;
  position?: number;
}

/**
 * Enhanced user interface
 */
export interface User {
  id: string;
  name: string;
  email?: string;
}

/**
 * Enhanced team interface
 */
export interface Team {
  id: string;
  name: string;
  key: string;
}

/**
 * Enhanced project interface
 */
export interface Project {
  id: string;
  name: string;
}

/**
 * Enhanced label interface
 */
export interface Label {
  id: string;
  name: string;
  color: string;
}

/**
 * Input types for issue operations
 */

export interface CreateIssueInput {
  title: string;
  description: string;
  teamId: string;
  assigneeId?: string;
  priority?: number;
  projectId?: string;
}

export interface CreateIssuesInput {
  issues: CreateIssueInput[];
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  assigneeId?: string;
  priority?: number;
  projectId?: string;
  stateId?: string;
}

export interface BulkUpdateIssuesInput {
  issueIds: string[];
  update: UpdateIssueInput;
}

export interface SearchIssuesInput {
  query?: string;
  filter?: {
    project?: {
      id?: {
        eq?: string;
      };
    };
  };
  teamIds?: string[];
  assigneeIds?: string[];
  states?: string[];
  priority?: number;
  first?: number;
  after?: string;
  orderBy?: string;
}

export interface DeleteIssueInput {
  id: string;
}

export interface DeleteIssuesInput {
  ids: string[];
}

/**
 * New input types for enhanced workflow state filtering
 */

export interface GetTriageIssuesInput {
  teamIds: string[];
  first?: number;
  after?: string;
}

export interface SearchByStateTypeInput {
  stateTypes: WorkflowStateType[];
  teamIds?: string[];
  assigneeIds?: string[];
  query?: string;
  first?: number;
  after?: string;
  orderBy?: string;
}

export interface EnhancedSearchIssuesInput extends SearchIssuesInput {
  stateTypes?: WorkflowStateType[];
}

/**
 * Response types for issue operations
 */

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface Issue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  url: string;
  state: WorkflowState;
  assignee?: User;
  team: Team;
  project?: Project;
  priority: number;
  labels: {
    nodes: Label[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface EnhancedTeam {
  id: string;
  name: string;
  key: string;
  triageIssueState?: WorkflowState;
  issues: {
    pageInfo: PageInfo;
    nodes: Issue[];
  };
}

export interface CreateIssueResponse {
  issueCreate: {
    success: boolean;
    issue?: Issue;
  };
}

export interface CreateIssuesResponse {
  issueCreate: {
    success: boolean;
    issues: Issue[];
  };
}

export interface IssueBatchResponse {
  issueBatchCreate: {
    success: boolean;
    issues: Issue[];
    lastSyncId: number;
  };
}

export interface UpdateIssuesResponse {
  issueUpdate: {
    success: boolean;
    issues: Issue[];
  };
}

export interface SearchIssuesResponse {
  issues: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    nodes: Issue[];
  };
}

export interface DeleteIssueResponse {
  issueDelete: {
    success: boolean;
  };
}

/**
 * New response types for enhanced workflow state filtering
 */

export interface TriageIssuesResponse {
  teams: {
    nodes: EnhancedTeam[];
  };
}

export interface StateTypeFilter {
  stateTypes: WorkflowStateType[];
  teamIds?: string[];
  assigneeIds?: string[];
  query?: string;
}

export interface EnhancedSearchFilter extends StateTypeFilter {
  project?: {
    id?: {
      eq?: string;
    };
  };
  priority?: number;
}

/**
 * Handler method types
 */

export interface IssueHandlerMethods {
  handleCreateIssue(args: CreateIssueInput): Promise<BaseToolResponse>;
  handleCreateIssues(args: CreateIssuesInput): Promise<BaseToolResponse>;
  handleBulkUpdateIssues(args: BulkUpdateIssuesInput): Promise<BaseToolResponse>;
  handleSearchIssues(args: EnhancedSearchIssuesInput): Promise<BaseToolResponse>;
  handleDeleteIssue(args: DeleteIssueInput): Promise<BaseToolResponse>;
  handleDeleteIssues(args: DeleteIssuesInput): Promise<BaseToolResponse>;
  // New methods for enhanced workflow state filtering
  handleGetTriageIssues(args: GetTriageIssuesInput): Promise<BaseToolResponse>;
  handleSearchIssuesByStateType(args: SearchByStateTypeInput): Promise<BaseToolResponse>;
}
