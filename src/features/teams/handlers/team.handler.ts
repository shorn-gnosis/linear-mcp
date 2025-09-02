import { BaseHandler } from '../../../core/handlers/base.handler.js';
import { BaseToolResponse } from '../../../core/interfaces/tool-handler.interface.js';
import { LinearAuth } from '../../../auth.js';
import { LinearGraphQLClient } from '../../../graphql/client.js';
import {
  GetTeamStatesInput,
  GetStatesByTypeInput,
  TeamStatesResponse,
  StatesByTypeResponse,
  TeamResponse
} from '../types/team.types.js';
import { WorkflowStateType } from '../../issues/types/issue.types.js';

/**
 * Handler for team-related operations.
 * Manages retrieving team information, states, and labels.
 */
export class TeamHandler extends BaseHandler {
  constructor(auth: LinearAuth, graphqlClient?: LinearGraphQLClient) {
    super(auth, graphqlClient);
  }

  /**
   * Gets information about all teams, including their states and labels.
   */
  async handleGetTeams(args: any): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();

      const result = await client.getTeams() as TeamResponse;

      return this.createJsonResponse(result);
    } catch (error) {
      this.handleError(error, 'get teams');
    }
  }

  /**
   * Gets workflow states for a specific team, optionally filtered by state type.
   */
  async handleGetTeamStates(args: GetTeamStatesInput): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ['teamId']);

      // Validate state type if provided
      if (args.stateType) {
        const validStateTypes: WorkflowStateType[] = [
          'triage', 'backlog', 'unstarted', 'started', 'completed', 'canceled'
        ];
        
        if (!validStateTypes.includes(args.stateType)) {
          throw new Error(
            `Invalid state type: ${args.stateType}. ` +
            `Valid types are: ${validStateTypes.join(', ')}`
          );
        }
      }

      const result = await client.getTeamStates(args.teamId, args.stateType) as TeamStatesResponse;

      if (!result.team) {
        throw new Error(`Team with ID ${args.teamId} not found`);
      }

      const states = result.team.states?.nodes || [];
      const filteredStates = args.stateType 
        ? states.filter(state => state.type === args.stateType)
        : states;

      return this.createResponse(
        `Team: ${result.team.name} (${result.team.key})\n` +
        `Team ID: ${result.team.id}\n` +
        `${args.stateType ? `Filtered by state type: ${args.stateType}\n` : ''}` +
        `${result.team.triageIssueState ? `Triage State: ${result.team.triageIssueState.name}\n` : ''}` +
        `\nWorkflow States (${filteredStates.length}):\n` +
        filteredStates.map(state => 
          `- ${state.name} (${state.type})\n` +
          `  ID: ${state.id}\n` +
          `  Color: ${state.color}\n` +
          `  Position: ${state.position || 'N/A'}`
        ).join('\n') || 'No states found'
      );
    } catch (error) {
      this.handleError(error, 'get team states');
    }
  }

  /**
   * Gets workflow states for multiple teams, filtered by state types.
   */
  async handleGetStatesByType(args: GetStatesByTypeInput): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ['teamIds', 'stateTypes']);

      if (!Array.isArray(args.teamIds)) {
        throw new Error('TeamIds parameter must be an array');
      }

      if (!Array.isArray(args.stateTypes)) {
        throw new Error('StateTypes parameter must be an array');
      }

      // Validate state types
      const validStateTypes: WorkflowStateType[] = [
        'triage', 'backlog', 'unstarted', 'started', 'completed', 'canceled'
      ];
      
      const invalidTypes = args.stateTypes.filter(type => !validStateTypes.includes(type));
      if (invalidTypes.length > 0) {
        throw new Error(
          `Invalid state types: ${invalidTypes.join(', ')}. ` +
          `Valid types are: ${validStateTypes.join(', ')}`
        );
      }

      // For now, we'll need to call getTeamStates for each team since we don't have a batch endpoint
      const teamStatesPromises = args.teamIds.map(teamId => 
        client.getTeamStates(teamId) as Promise<TeamStatesResponse>
      );

      const results = await Promise.all(teamStatesPromises);
      const teams = results.map(result => result.team).filter(team => team);

      return this.createResponse(
        `Found states for ${teams.length} teams, filtered by types: ${args.stateTypes.join(', ')}\n\n` +
        teams.map(team => {
          const states = team.states?.nodes || [];
          const filteredStates = states.filter(state => args.stateTypes.includes(state.type));
          
          return `Team: ${team.name} (${team.key})\n` +
            `States matching types (${filteredStates.length}):\n` +
            filteredStates.map(state => 
              `  - ${state.name} (${state.type})\n` +
              `    ID: ${state.id}\n` +
              `    Color: ${state.color}\n` +
              `    Position: ${state.position || 'N/A'}`
            ).join('\n') || '  No matching states found';
        }).join('\n\n') || 'No teams found'
      );
    } catch (error) {
      this.handleError(error, 'get states by type');
    }
  }
}
