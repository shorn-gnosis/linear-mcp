# Design Document

## Overview

This design document outlines the technical solution for implementing proper workflow state filtering in the Linear MCP. The solution addresses the current issues with state name vs. state type filtering, adds triage issue querying capabilities, and provides comprehensive team state management.

The approach integrates with the existing TypeScript/Node.js architecture, extends the current GraphQL client infrastructure, and maintains backward compatibility while adding enhanced filtering capabilities.

## Architecture

### System Architecture
```
Linear MCP Server
├── Core Handlers
│   ├── IssueHandler (enhanced)
│   └── TeamHandler (enhanced)
├── GraphQL Layer
│   ├── New Queries (triage, state filtering)
│   ├── Enhanced Client Methods
│   └── State Type Management
├── Tool Registry
│   ├── New Triage Tools
│   └── Enhanced Search Tools
└── Type System
    ├── Workflow State Types
    └── Enhanced Filter Types
```

### Data Flow
1. User requests triage issues or state-filtered search
2. Tool handler validates input and determines query type
3. GraphQL client executes appropriate query with state type filters
4. Linear API returns filtered results
5. Handler processes and formats response
6. MCP server returns structured data to user

### Technology Stack
- **GraphQL**: Extended queries for state type filtering
- **TypeScript**: Enhanced type definitions for workflow states
- **Linear SDK**: Existing client infrastructure
- **MCP Protocol**: New tool definitions and schemas

## Components and Interfaces

### Enhanced IssueHandler Module
**Purpose**: Handle issue operations with proper workflow state filtering
**Key Features**: 
- Triage issue querying
- State type filtering
- Backward compatible search

**Interface/API**:
```typescript
interface EnhancedIssueHandler {
  // New methods
  handleGetTriageIssues(args: GetTriageIssuesInput): Promise<BaseToolResponse>;
  handleSearchIssuesByStateType(args: SearchByStateTypeInput): Promise<BaseToolResponse>;
  
  // Enhanced existing method
  handleSearchIssues(args: EnhancedSearchIssuesInput): Promise<BaseToolResponse>;
}

interface GetTriageIssuesInput {
  teamIds: string[];
  first?: number;
  after?: string;
}

interface SearchByStateTypeInput {
  stateTypes: WorkflowStateType[];
  teamIds?: string[];
  first?: number;
  after?: string;
  orderBy?: string;
}

type WorkflowStateType = 'triage' | 'backlog' | 'unstarted' | 'started' | 'completed' | 'canceled';
```

### Enhanced TeamHandler Module
**Purpose**: Manage team workflow states and provide state type mapping
**Key Features**: 
- Team state retrieval with types
- State type filtering
- Triage state identification

**Interface/API**:
```typescript
interface EnhancedTeamHandler {
  // New methods
  handleGetTeamStates(args: GetTeamStatesInput): Promise<BaseToolResponse>;
  handleGetStatesByType(args: GetStatesByTypeInput): Promise<BaseToolResponse>;
  
  // Enhanced existing method
  handleGetTeams(args: any): Promise<BaseToolResponse>;
}

interface GetTeamStatesInput {
  teamId: string;
  stateType?: WorkflowStateType;
}

interface GetStatesByTypeInput {
  teamIds: string[];
  stateTypes: WorkflowStateType[];
}
```

### Enhanced GraphQL Client Module
**Purpose**: Execute new queries and provide state type filtering capabilities
**Key Features**: 
- Triage issue queries
- State type filtering
- Team state management

**Interface/API**:
```typescript
interface EnhancedLinearGraphQLClient {
  // New methods
  getTriageIssues(teamIds: string[], first?: number, after?: string): Promise<TriageIssuesResponse>;
  getTeamStates(teamId: string, stateType?: WorkflowStateType): Promise<TeamStatesResponse>;
  searchIssuesByStateType(filter: StateTypeFilter, first?: number, after?: string): Promise<SearchIssuesResponse>;
  
  // Enhanced existing methods
  searchIssues(filter: EnhancedSearchFilter, first?: number, after?: string, orderBy?: string): Promise<SearchIssuesResponse>;
}

interface StateTypeFilter {
  stateTypes: WorkflowStateType[];
  teamIds?: string[];
  assigneeIds?: string[];
  query?: string;
}
```

## Data Models

```typescript
// Enhanced workflow state types
interface WorkflowState {
  id: string;
  name: string;
  type: WorkflowStateType;
  color: string;
  position: number;
}

// Enhanced issue with state type information
interface EnhancedIssue {
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
  labels: Label[];
  createdAt: string;
  updatedAt: string;
}

// Team with enhanced state information
interface EnhancedTeam {
  id: string;
  name: string;
  key: string;
  description?: string;
  triageIssueState?: WorkflowState;
  states: WorkflowState[];
  labels: Label[];
}

// Response types for new operations
interface TriageIssuesResponse {
  team: {
    id: string;
    name: string;
    triageIssueState?: WorkflowState;
    issues: {
      pageInfo: PageInfo;
      nodes: EnhancedIssue[];
    };
  };
}

interface TeamStatesResponse {
  team: {
    id: string;
    name: string;
    states: WorkflowState[];
  };
}
```

## GraphQL Queries

### New Query: Get Triage Issues
```graphql
query GetTriageIssues($teamIds: [String!]!, $first: Int, $after: String) {
  teams(filter: { id: { in: $teamIds } }) {
    nodes {
      id
      name
      triageIssueState {
        id
        name
        type
        color
      }
      issues(
        filter: { state: { type: { eq: "triage" } } }
        first: $first
        after: $after
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          identifier
          title
          description
          url
          state {
            id
            name
            type
            color
          }
          assignee {
            id
            name
            email
          }
          team {
            id
            name
            key
          }
          project {
            id
            name
          }
          priority
          labels {
            nodes {
              id
              name
              color
            }
          }
          createdAt
          updatedAt
        }
      }
    }
  }
}
```

### New Query: Get Team States with Types
```graphql
query GetTeamStates($teamId: String!, $stateType: String) {
  team(id: $teamId) {
    id
    name
    key
    states(filter: $stateType ? { type: { eq: $stateType } } : null) {
      nodes {
        id
        name
        type
        color
        position
      }
    }
    triageIssueState {
      id
      name
      type
      color
    }
  }
}
```

### Enhanced Query: Search Issues by State Type
```graphql
query SearchIssuesByStateType(
  $filter: IssueFilter
  $first: Int
  $after: String
  $orderBy: PaginationOrderBy
) {
  issues(
    filter: $filter
    first: $first
    after: $after
    orderBy: $orderBy
    includeArchived: false
  ) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      identifier
      title
      description
      url
      state {
        id
        name
        type
        color
      }
      assignee {
        id
        name
        email
      }
      team {
        id
        name
        key
      }
      project {
        id
        name
      }
      priority
      labels {
        nodes {
          id
          name
          color
        }
      }
      createdAt
      updatedAt
    }
  }
}
```

## Error Handling

### Error Categories
1. **Validation Errors**: Invalid state types, missing required parameters
2. **Permission Errors**: Access denied to team or issues
3. **GraphQL Errors**: Query execution failures, network issues
4. **Data Errors**: Team not found, invalid state configuration

### Error Handling Strategy
- Validate all input parameters before GraphQL execution
- Return structured error responses with clear messages
- Log errors for debugging while protecting sensitive information
- Provide fallback behavior for missing triage states
- Handle pagination errors gracefully

## Testing Strategy

### Unit Testing
- Test state type validation and filtering logic
- Test GraphQL query construction and parameter handling
- Test error handling for various failure scenarios
- Test backward compatibility with existing functionality

### Integration Testing
- Test complete triage issue retrieval workflow
- Test state type filtering with real Linear data
- Test team state management operations
- Test enhanced search functionality

### End-to-End Testing
- Test triage issue querying through MCP protocol
- Test state type filtering through tool calls
- Test team state management through MCP tools
- Test error scenarios and edge cases

## Performance Considerations

### Optimization Strategies
- Use GraphQL field selection to minimize data transfer
- Implement proper pagination for large result sets
- Cache team state information to reduce API calls
- Use efficient filtering at GraphQL level rather than post-processing

### Performance Requirements
- Triage queries: < 2 seconds for teams with 1000+ issues
- State retrieval: < 1 second for teams with 50+ states
- Enhanced search: Maintain current performance levels

## Security Considerations

### Data Protection
- Respect Linear's team-based access controls
- Validate user permissions before executing queries
- Sanitize all input parameters to prevent injection
- Log access patterns for security monitoring

### Authentication/Authorization
- Use existing Linear access token validation
- Maintain current permission checking mechanisms
- Ensure state type filtering respects team boundaries
- Validate team access before returning state information

## Migration Strategy

### Implementation Phases
1. **Phase 1**: Add new GraphQL queries and types
2. **Phase 2**: Implement enhanced client methods
3. **Phase 3**: Update handlers with new functionality
4. **Phase 4**: Add new MCP tools and schemas
5. **Phase 5**: Test and validate all functionality

### Backward Compatibility
- Maintain existing tool schemas and behavior
- Add new tools without modifying existing ones
- Ensure existing search functionality continues working
- Provide migration guide for users wanting new features

### Rollback Plan
- Keep existing functionality intact during development
- Use feature flags for new capabilities
- Maintain separate code paths for legacy and enhanced features
- Provide quick rollback mechanism if issues arise

## Monitoring and Observability

### Metrics to Track
- Query execution times for new operations
- Error rates for state type filtering
- Usage patterns for triage issue queries
- Performance impact on existing functionality

### Logging Strategy
- Log all new query executions with timing
- Track state type filter usage patterns
- Monitor error rates and types
- Log performance metrics for optimization
