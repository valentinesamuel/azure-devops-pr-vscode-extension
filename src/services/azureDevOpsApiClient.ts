import * as vscode from 'vscode';

export interface AzureDevOpsProfile {
  id: string;
  displayName: string;
  emailAddress: string;
  publicAlias: string;
  coreRevision: number;
  timeStamp: string;
  revision: number;
}

export interface ConnectionData {
  authenticatedUser: {
    id: string;
    descriptor: string;
    subjectDescriptor: string;
    providerDisplayName: string;
    customDisplayName?: string;
    isActive: boolean;
    properties: {
      Account?: {
        $type: string;
        $value: string;
      };
    };
    resourceVersion: number;
    metaTypeId: number;
  };
  authorizedUser: {
    id: string;
    descriptor: string;
    subjectDescriptor: string;
    providerDisplayName: string;
    customDisplayName?: string;
    isActive: boolean;
    properties: {
      Account?: {
        $type: string;
        $value: string;
      };
    };
    resourceVersion: number;
    metaTypeId: number;
  };
  instanceId: string;
  deploymentId: string;
  deploymentType: string;
}

export interface AzureDevOpsApiConfig {
  organization: string;
  pat: string;
}

export interface AzureDevOpsPullRequest {
  pullRequestId: number;
  title: string;
  description: string;
  sourceRefName: string;
  targetRefName: string;
  status: string;
  createdBy: {
    displayName: string;
    uniqueName: string;
    id: string;
  };
  creationDate: string;
  closedDate?: string;
  isDraft: boolean;
  reviewers: Array<{
    displayName: string;
    uniqueName: string;
    id: string;
    vote: number;
  }>;
  repository: {
    id: string;
    name: string;
    project: {
      id: string;
      name: string;
    };
  };
}

export interface CommentIdentity {
  displayName: string;
  id: string;
  uniqueName: string;
  imageUrl?: string;
}

export interface IdentityRefWithVote extends CommentIdentity {
  vote?: number; // 10=approved, 5=approved with suggestions, 0=no vote, -5=waiting, -10=rejected
  isRequired?: boolean;
}

export interface Comment {
  id: number;
  parentCommentId?: number;
  author?: CommentIdentity;
  content?: string;
  publishedDate?: string;
  lastUpdatedDate?: string;
  lastContentUpdatedDate?: string;
  commentType?: string; // 'text', 'system'
  isDeleted?: boolean;
}

export interface CommentThread {
  id: number;
  publishedDate?: string;
  lastUpdatedDate?: string;
  comments?: Comment[];
  status?: string; // 'active', 'fixed', 'wontFix', 'closed', 'byDesign', 'pending'
  threadContext?: {
    filePath?: string;
    rightFileStart?: {
      line: number;
      offset: number;
    };
    rightFileEnd?: {
      line: number;
      offset: number;
    };
  };
  pullRequestThreadContext?: {
    filePath?: string;
    rightFileStart?: {
      line: number;
      offset: number;
    };
    rightFileEnd?: {
      line: number;
      offset: number;
    };
  } | null;
  identities?: {
    [key: string]: IdentityRefWithVote;
  };
  properties?: {
    CodeReviewThreadType?: {
      $value?: string; // 'VoteUpdate', 'ReviewerAdd', 'PullRequestCreated', etc.
    };
    CodeReviewReviewersUpdatedNumAdded?: {
      $value?: string;
    };
    CodeReviewReviewersUpdatedNumDeclined?: {
      $value?: string;
    };
    CodeReviewReviewersUpdatedNumChanged?: {
      $value?: string;
    };
    CodeReviewVoteResult?: {
      $value?: string; // '10' for approved, '5' for approved with suggestions, '0' for no vote, '-5' for waiting, '-10' for rejected
    };
    CodeReviewVotedByIdentity?: {
      $value?: string; // GUID of the identity who voted
    };
    CodeReviewVotedByInitiatorIdentity?: {
      $value?: string; // GUID for team approvals
    };
    [key: string]: any;
  };
  isDeleted?: boolean;
}

export class AzureDevOpsApiClient {
  private baseUrl: string;
  private organization: string;
  private headers: Record<string, string>;

  constructor(config: AzureDevOpsApiConfig) {
    this.organization = config.organization;
    this.baseUrl = `https://dev.azure.com/${config.organization}`;

    // Azure DevOps requires Basic authentication with PAT as password
    const authToken = Buffer.from(`:${config.pat}`).toString('base64');
    this.headers = {
      Authorization: `Basic ${authToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  /**
   * Fetches connection data which includes the current authenticated user's information
   */
  async getConnectionData(): Promise<ConnectionData> {
    try {
      const url = `https://dev.azure.com/${this.organization}/_apis/connectiondata`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch connection data`);
      }

      const connectionData = (await response.json()) as ConnectionData;

      return connectionData;
    } catch (error) {
      if (error instanceof Error) {
        vscode.window.showErrorMessage(
          `Error fetching Azure DevOps connection data: ${error.message}`,
        );
      }
      throw error;
    }
  }

  /**
   * Fetches the current user's profile from Azure DevOps
   * Uses ConnectionData API to get current user, then extracts profile information
   */
  async getCurrentUserProfile(): Promise<AzureDevOpsProfile> {
    try {
      // First get connection data to get the authenticated user's info
      const connectionData = await this.getConnectionData();

      // Extract email from properties.Account.$value
      const emailAddress =
        connectionData.authenticatedUser.properties.Account?.$value ||
        connectionData.authenticatedUser.providerDisplayName;

      // Create profile object with extracted data
      const profile: AzureDevOpsProfile = {
        id: connectionData.authenticatedUser.id,
        displayName:
          connectionData.authenticatedUser.customDisplayName ||
          connectionData.authenticatedUser.providerDisplayName,
        emailAddress: emailAddress,
        publicAlias: connectionData.authenticatedUser.providerDisplayName,
        coreRevision: 0,
        timeStamp: new Date().toISOString(),
        revision: 0,
      };

      return profile;
    } catch (error) {
      if (error instanceof Error) {
        vscode.window.showErrorMessage(`Error fetching Azure DevOps profile: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Tests the connection to Azure DevOps by fetching the user profile
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getCurrentUserProfile();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Fetches pull requests for a specific repository
   * @param project - The project name
   * @param repository - The repository name or ID
   * @param creatorId - Optional: Filter by creator ID
   * @param reviewerId - Optional: Filter by reviewer ID
   * @param status - Optional: Filter by status (active, completed, abandoned, all)
   */
  async getPullRequests(
    project: string,
    repository: string,
    options?: {
      creatorId?: string;
      reviewerId?: string;
      status?: 'active' | 'completed' | 'abandoned' | 'all';
    },
  ): Promise<AzureDevOpsPullRequest[]> {
    try {
      let url = `${this.baseUrl}/${project}/_apis/git/repositories/${repository}/pullrequests?api-version=7.1-preview.1`;

      // Add query parameters
      const params = new URLSearchParams();
      if (options?.creatorId) {
        params.append('searchCriteria.creatorId', options.creatorId);
      }
      if (options?.reviewerId) {
        params.append('searchCriteria.reviewerId', options.reviewerId);
      }
      if (options?.status) {
        params.append('searchCriteria.status', options.status);
      }

      const queryString = params.toString();
      if (queryString) {
        url += `&${queryString}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch pull requests: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      const data = (await response.json()) as { value?: AzureDevOpsPullRequest[] };
      return data.value || [];
    } catch (error) {
      if (error instanceof Error) {
        vscode.window.showErrorMessage(`Error fetching pull requests: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Fetches PRs created by the authenticated user
   */
  async getPullRequestsCreatedByMe(
    project: string,
    repository: string,
  ): Promise<AzureDevOpsPullRequest[]> {
    const profile = await this.getCurrentUserProfile();
    return this.getPullRequests(project, repository, {
      creatorId: profile.id,
      status: 'all',
    });
  }

  /**
   * Fetches PRs where the authenticated user is a reviewer
   */
  async getPullRequestsForMyReview(
    project: string,
    repository: string,
  ): Promise<AzureDevOpsPullRequest[]> {
    const profile = await this.getCurrentUserProfile();
    return this.getPullRequests(project, repository, {
      reviewerId: profile.id,
      status: 'active',
    });
  }

  /**
   * Fetches all threads (comments) for a pull request
   */
  async getPullRequestThreads(
    project: string,
    repositoryId: string,
    pullRequestId: number,
  ): Promise<CommentThread[]> {
    try {
      const url = `${this.baseUrl}/${project}/_apis/git/repositories/${repositoryId}/pullRequests/${pullRequestId}/threads?api-version=7.1-preview.1`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch PR threads: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      const data = (await response.json()) as { value?: CommentThread[] };
      return data.value || [];
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching PR threads: ${error.message}`);
      }
      throw error;
    }
  }
}
