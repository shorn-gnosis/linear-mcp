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

export const INITIATIVES_PROBE_QUERY = gql`
  query InitiativesProbe($first: Int, $after: String) {
    initiatives(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        description
        url
        status
        startedAt
        targetDate
        createdAt
        updatedAt
        lead {
          id
          name
          email
        }
        teams {
          nodes {
            id
            name
            key
          }
        }
      }
    }
  }
`;

// List initiatives with pagination (minimal fields)
export const LIST_INITIATIVES_QUERY = gql`
  query ListInitiatives($first: Int, $after: String) {
    initiatives(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        description
        url
        status
        startedAt
        targetDate
        createdAt
        updatedAt
        owner { id name email }
        projects {
          nodes {
            id
            name
            status { type name }
            teams { nodes { id key name } }
          }
        }
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
        priorityLabel
        startDate
        targetDate
        createdAt
        updatedAt
        lead {
          id
          name
          email
        }
        teams {
          nodes {
            id
            name
            key
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
        name
      }
      priority
      priorityLabel
      startDate
      targetDate
      createdAt
      updatedAt
      lead {
        id
        name
        email
      }
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

// List projects with pagination and filters
export const LIST_PROJECTS_QUERY = gql`
  query ListProjects($filter: ProjectFilter, $first: Int, $after: String) {
    projects(filter: $filter, first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
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
        priorityLabel
        startDate
        targetDate
        createdAt
        updatedAt
        lead {
          id
          name
          email
        }
        teams {
          nodes {
            id
            name
            key
          }
        }
      }
    }
  }
`;
