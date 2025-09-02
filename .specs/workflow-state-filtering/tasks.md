# Implementation Plan

- [ ] 1. Create Enhanced Type Definitions
  - Add WorkflowStateType enum with values: 'triage', 'backlog', 'unstarted', 'started', 'completed', 'canceled'
  - Create enhanced interfaces for GetTriageIssuesInput, SearchByStateTypeInput, GetTeamStatesInput
  - Update existing issue and team type definitions to include state type information
  - Add response types for new operations: TriageIssuesResponse, TeamStatesResponse
  - _Requirements: 2.1, 2.2, 3.1_

- [ ] 2. Add New GraphQL Queries
  - Create GET_TRIAGE_ISSUES_QUERY with team filtering and state type filtering
  - Create GET_TEAM_STATES_QUERY with optional state type filtering
  - Create SEARCH_ISSUES_BY_STATE_TYPE_QUERY with enhanced filtering capabilities
  - Update existing SEARCH_ISSUES_QUERY to support state type filtering alongside state name filtering
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ] 3. Enhance GraphQL Client Methods
  - Add getTriageIssues() method with team and pagination support
  - Add getTeamStates() method with optional state type filtering
  - Add searchIssuesByStateType() method with comprehensive filtering
  - Update existing searchIssues() method to handle both state names and state types
  - Implement proper error handling for new methods
  - _Requirements: 1.1, 1.2, 2.1, 3.1, 4.1_

- [ ] 4. Update Issue Handler with New Methods
  - Add handleGetTriageIssues() method with team validation and response formatting
  - Add handleSearchIssuesByStateType() method with state type validation
  - Update handleSearchIssues() to support enhanced filtering while maintaining backward compatibility
  - Implement input validation for new WorkflowStateType values
  - Add proper error handling and user-friendly error messages
  - _Requirements: 1.1, 1.3, 2.7, 4.4, 5.1_

- [ ] 5. Enhance Team Handler with State Management
  - Add handleGetTeamStates() method with state type filtering
  - Add handleGetStatesByType() method for multi-team state queries
  - Update handleGetTeams() to include enhanced state information
  - Implement validation for team access and state type parameters
  - Add error handling for invalid team IDs and state types
  - _Requirements: 3.1, 3.2, 3.4, 3.5_

- [ ] 6. Create New MCP Tool Schemas
  - Define linear_get_triage_issues tool schema with teamIds, pagination parameters
  - Define linear_search_issues_by_state_type tool schema with state type filtering
  - Define linear_get_team_states tool schema with team and state type filtering
  - Define linear_get_states_by_type tool schema for multi-team queries
  - Update existing linear_search_issues schema to include state type options
  - _Requirements: 1.4, 2.6, 3.1, 4.2, 4.3_

- [ ] 7. Update Handler Factory Registration
  - Register new handleGetTriageIssues method in issue handler routing
  - Register new handleSearchIssuesByStateType method in issue handler routing
  - Register new handleGetTeamStates method in team handler routing
  - Register new handleGetStatesByType method in team handler routing
  - Update existing method registrations to support enhanced functionality
  - _Requirements: All tool requirements_

- [ ] 8. Implement Input Validation
  - Create validateWorkflowStateType() function for state type validation
  - Add validation for teamIds arrays in triage and state queries
  - Implement comprehensive input sanitization for all new methods
  - Add parameter validation with clear error messages
  - Ensure validation respects Linear's API constraints
  - _Requirements: 2.7, 3.4, 4.4_

- [ ] 9. Add Comprehensive Error Handling
  - Implement specific error handling for triage state not configured scenarios
  - Add error handling for invalid team access permissions
  - Create user-friendly error messages for state type validation failures
  - Implement fallback behavior for missing or invalid state configurations
  - Add logging for debugging while protecting sensitive information
  - _Requirements: 1.3, 3.4, 4.4_

- [ ] 10. Update Type Exports and Dependencies
  - Export new interfaces and types from appropriate modules
  - Update index files to include new type definitions
  - Ensure proper TypeScript compilation for all new types
  - Update import statements throughout codebase as needed
  - Verify no circular dependency issues with new type definitions
  - _Requirements: All implementation requirements_

- [ ] 11. Write Unit Tests for New Functionality
  - Test WorkflowStateType validation and enum handling
  - Test new GraphQL query construction and parameter handling
  - Test issue handler methods with various input scenarios
  - Test team handler state management functionality
  - Test error handling for invalid inputs and edge cases
  - _Requirements: All functional requirements_

- [ ] 12. Write Integration Tests
  - Test complete triage issue retrieval workflow end-to-end
  - Test state type filtering with multiple teams and states
  - Test team state management operations with real data structures
  - Test enhanced search functionality with both legacy and new parameters
  - Test error scenarios and permission handling
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ] 13. Test Backward Compatibility
  - Verify existing linear_search_issues tool continues working unchanged
  - Test existing linear_get_teams tool maintains current behavior
  - Ensure existing client integrations are not broken
  - Validate that legacy state name filtering still functions
  - Test tool schema backward compatibility
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 14. Update Documentation and Examples
  - Add usage examples for new triage issue querying tools
  - Document state type filtering capabilities and parameters
  - Create examples showing enhanced search functionality
  - Add troubleshooting guide for common state filtering issues
  - Update tool schema documentation with new parameters
  - _Requirements: All user-facing requirements_

- [ ] 15. Performance Testing and Optimization
  - Test triage query performance with large teams (1000+ issues)
  - Verify state retrieval performance meets < 1 second requirement
  - Test pagination performance for large result sets
  - Optimize GraphQL queries for minimal data transfer
  - Validate that new functionality doesn't impact existing performance
  - _Requirements: Performance and scalability requirements_

- [ ] 16. Security Testing and Validation
  - Test that state type filtering respects team access permissions
  - Verify input sanitization prevents injection attacks
  - Test error handling doesn't leak sensitive information
  - Validate that users only see states and issues for accessible teams
  - Test access control with various permission scenarios
  - _Requirements: Security and access control requirements_

- [ ] 17. End-to-End MCP Protocol Testing
  - Test all new tools through complete MCP protocol workflow
  - Verify tool registration and discovery works correctly
  - Test parameter validation and error responses through MCP
  - Validate JSON response formatting for all new tools
  - Test concurrent usage of new and existing tools
  - _Requirements: All tool and protocol requirements_

- [ ] 18. Final Integration and Deployment Testing
  - Test complete feature set in staging environment
  - Verify all tools work correctly with real Linear workspace data
  - Test with multiple teams, states, and issue configurations
  - Validate performance under realistic usage conditions
  - Execute final backward compatibility verification
  - _Requirements: All requirements validation_
