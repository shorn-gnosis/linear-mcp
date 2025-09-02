/**
 * Project operation types
 * These types define the structure for project-related operations in Linear
 */

/**
 * Input for creating a new project
 * @example
 * ```typescript
 * const projectInput: ProjectInput = {
 *   name: "Q1 Planning",
 *   description: "Q1 2025 Planning Project",
 *   teamIds: ["team-id-1", "team-id-2"], // Required: Array of team IDs this project belongs to
 *   state: "started" // Optional: Project state
 * };
 * ```
 */
export interface ProjectInput {
  /** The name of the project */
  name: string;

  /** Optional description of the project */
  description?: string;

  /**
   * Array of team IDs this project belongs to
   * @required
   * Note: Linear API requires teamIds (array) not teamId (single value)
   */
  teamIds: string[];

  /** Optional project state */
  state?: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  url: string;
  description?: string;
  status?: string;
  priority?: number | string;
  priorityLabel?: string;
  startDate?: string | null;
  targetDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  lead?: {
    id: string;
    name: string;
    email?: string | null;
  } | null;
  teams?: {
    nodes: Array<{
      id: string;
      name: string;
      key?: string;
    }>;
  };
}

export interface ProjectResponse {
  projectCreate: {
    success: boolean;
    project: ProjectSummary;
    lastSyncId: number;
  };
  issueBatchCreate?: {
    success: boolean;
    issues: Array<{
      id: string;
      identifier: string;
      title: string;
      url: string;
    }>;
    lastSyncId: number;
  };
}

export interface SearchProjectsResponse {
  projects: {
    pageInfo?: {
      hasNextPage: boolean;
      endCursor?: string;
    };
    nodes: Array<ProjectSummary>;
  };
}
