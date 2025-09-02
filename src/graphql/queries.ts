import { gql } from 'graphql-tag';

export const SEARCH_ISSUES_QUERY = gql`
  query SearchIssues(
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
        },
        project {
          id
          name
        },
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
`;

export const GET_TEAMS_QUERY = gql`
  query GetTeams {
    teams {
      nodes {
        id
        name
        key
        description
        states {
          nodes {
            id
            name
            type
            color
          }
        }
        labels {
          nodes {
            id
            name
            color
          }
        }
      }
    }
  }
`;

export const GET_USER_QUERY = gql`
  query GetUser {
    viewer {
      id
      name
      email
      teams {
        nodes {
          id
          name
          key
        }
      }
    }
  }
`;

export const SEARCH_PROJECTS_QUERY = gql`
  query SearchProjects($filter: ProjectFilter) {
    projects(filter: $filter) {
      nodes {
        id
        name
        description
        url
        status {
          type
          name
        }
        priority
        color
        sortOrder
        health
        progress
        createdAt
        updatedAt
        startedAt
        targetDate
        completedAt
        canceledAt
        archivedAt
        lead {
          id
          name
        }
        teams {
          nodes {
            id
            name
            key
          }
        }
        labels {
          nodes {
            id
            name
            description
            color
          }
        }
      }
    }
  }
`;

export const GET_PROJECT_QUERY = gql`
  query GetProject($id: String!) {
    project(id: $id) {
      id
      name
      description
      url
      status {
        type
      }
      priority
      archivedAt
      targetDate
      teams {
        nodes {
          id
          name
          key
        }
      }
    }
  }
`;

export const LIST_INITIATIVES_QUERY = gql`
  query ListInitiatives($filter: ProjectFilter, $first: Int, $after: String) {
    projects(filter: $filter, first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        description
        status {
          type
        }
        targetDate
        teams { nodes { id key name } }
      }
    }
  }
`;

export const GET_INITIATIVE_QUERY = gql`
  query GetInitiative($id: String!, $first: Int) {
    project(id: $id) {
      id
      name
      description
      status {
        type
      }
      targetDate
      teams { nodes { id key name } }
    }
  }
`;

export const GET_TRIAGE_ISSUES_QUERY = gql`
  query GetTriageIssues($teamIds: [ID!]!, $first: Int, $after: String) {
    teams(filter: { id: { in: $teamIds } }) {
      nodes {
        id
        name
        key
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
`;

export const GET_TEAM_STATES_QUERY = gql`
  query GetTeamStates($teamId: String!) {
    team(id: $teamId) {
      id
      name
      key
      states {
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
`;

export const GET_TEAM_STATES_BY_TYPE_QUERY = gql`
  query GetTeamStatesByType($teamId: String!, $stateType: String!) {
    team(id: $teamId) {
      id
      name
      key
      states(filter: { type: { eq: $stateType } }) {
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
`;

export const SEARCH_ISSUES_BY_STATE_TYPE_QUERY = gql`
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
`;
