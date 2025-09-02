import { WorkflowStateType, WorkflowState } from '../../../features/issues/types/issue.types.js';

/**
 * Team operation types
 */

export interface TeamState extends WorkflowState {
  position: number;
}

export interface Team {
  id: string;
  name: string;
  key: string;
  description?: string;
  states: {
    nodes: TeamState[];
  };
  labels: {
    nodes: Label[];
  };
}

export interface EnhancedTeamWithTriage extends Team {
  triageIssueState?: WorkflowState;
}

export interface TeamResponse {
  teams: {
    nodes: Team[];
  };
}

/**
 * New input types for team state management
 */

export interface GetTeamStatesInput {
  teamId: string;
  stateType?: WorkflowStateType;
}

export interface GetStatesByTypeInput {
  teamIds: string[];
  stateTypes: WorkflowStateType[];
}

/**
 * New response types for team state operations
 */

export interface TeamStatesResponse {
  team: {
    id: string;
    name: string;
    key: string;
    states: {
      nodes: TeamState[];
    };
    triageIssueState?: WorkflowState;
  };
}

export interface StatesByTypeResponse {
  teams: {
    nodes: {
      id: string;
      name: string;
      key: string;
      states: {
        nodes: TeamState[];
      };
    }[];
  };
}

export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface LabelInput {
  name: string;
  color?: string;
  teamId: string;
}

export interface LabelResponse {
  labelCreate: {
    success: boolean;
    label: {
      id: string;
      name: string;
    };
  };
}
