# Requirements Document

## Introduction

The Linear MCP currently has critical issues with workflow state filtering that prevent proper handling of triage issues and other workflow states. The system incorrectly uses state names instead of workflow state types, excludes triage issues by default, and lacks proper team state management capabilities.

This enhancement is needed to provide accurate issue filtering, enable triage workflow management, and ensure the MCP can properly query issues across all workflow states. The business value includes improved project management capabilities, better issue organization, and complete Linear workflow state coverage.

## Requirements

### Requirement 1: Triage Issue Query Capability
**User Story:** As a project manager, I want to query triage issues for a team, so that I can see all issues awaiting triage decisions.

#### Acceptance Criteria
1. WHEN querying triage issues for a team THEN the system SHALL return all issues in triage state
2. WHEN no triage issues exist THEN the system SHALL return an empty result set
3. WHEN team has no triage state configured THEN the system SHALL return appropriate error message
4. WHEN triage issues are queried THEN results SHALL include issue identifier, title, state info, and assignee
5. WHEN multiple teams are specified THEN triage issues SHALL be returned for all specified teams

### Requirement 2: Workflow State Type Filtering
**User Story:** As a developer, I want to filter issues by workflow state types (triage, backlog, unstarted, started, completed, canceled), so that I can query issues based on their workflow status rather than specific state names.

#### Acceptance Criteria
1. WHEN filtering by state type "triage" THEN system SHALL return all issues in triage states
2. WHEN filtering by state type "backlog" THEN system SHALL return all issues in backlog states  
3. WHEN filtering by state type "started" THEN system SHALL return all issues in active/in-progress states
4. WHEN filtering by state type "completed" THEN system SHALL return all issues in done/completed states
5. WHEN filtering by state type "canceled" THEN system SHALL return all issues in canceled states
6. WHEN multiple state types are specified THEN system SHALL return issues matching any of the specified types
7. WHEN invalid state type is specified THEN system SHALL return validation error

### Requirement 3: Team Workflow State Management
**User Story:** As a team administrator, I want to retrieve all workflow states for my team with their types and metadata, so that I can understand available states and their configuration.

#### Acceptance Criteria
1. WHEN requesting team workflow states THEN system SHALL return all states with id, name, type, and color
2. WHEN filtering states by type THEN system SHALL return only states matching the specified type
3. WHEN team has no custom states THEN system SHALL return default Linear workflow states
4. WHEN team ID is invalid THEN system SHALL return appropriate error message
5. WHEN requesting triage state specifically THEN system SHALL return team's configured triage state

### Requirement 4: Enhanced Issue Search with State Types
**User Story:** As a user, I want to search issues using both state names and state types, so that I have flexible filtering options for different use cases.

#### Acceptance Criteria
1. WHEN searching with state names THEN system SHALL filter by exact state name matches
2. WHEN searching with state types THEN system SHALL filter by workflow state type
3. WHEN both state names and types are specified THEN system SHALL apply both filters
4. WHEN conflicting filters are specified THEN system SHALL return validation error
5. WHEN no matching states exist THEN system SHALL return empty result set

### Requirement 5: Backward Compatibility
**User Story:** As an existing MCP user, I want current functionality to continue working, so that my existing integrations are not broken.

#### Acceptance Criteria
1. WHEN using existing search methods THEN system SHALL continue to work as before
2. WHEN legacy state name filtering is used THEN system SHALL maintain current behavior
3. WHEN new state type filtering is used THEN system SHALL provide enhanced functionality
4. WHEN tool schemas are updated THEN existing tool calls SHALL remain valid

## Non-Functional Requirements

### Performance Requirements
- State queries SHALL complete within 2 seconds for teams with up to 1000 issues
- Triage issue queries SHALL support pagination for large result sets
- Team state retrieval SHALL complete within 1 second

### Security Requirements
- All queries SHALL respect Linear's access control and team permissions
- User SHALL only see issues and states for teams they have access to
- API tokens SHALL be validated before processing any requests

### Accessibility Requirements
- Error messages SHALL be clear and actionable
- API responses SHALL include proper error codes for programmatic handling
- Documentation SHALL include usage examples for all new capabilities

### Scalability Requirements
- System SHALL handle teams with up to 50 workflow states
- Filtering SHALL work efficiently with up to 10,000 issues per team
- Multiple concurrent state queries SHALL not impact performance
