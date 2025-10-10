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
  closedBy?: {
    displayName: string;
    uniqueName: string;
    id: string;
  };
  lastMergeCommit?: {
    commitId: string;
    author?: {
      name: string;
      email: string;
      date: string;
    };
  };
  lastMergeSourceCommit?: {
    commitId: string;
  };
  isDraft: boolean;
  reviewers: Array<{
    displayName: string;
    uniqueName: string;
    id: string;
    vote: number;
    isRequired?: boolean;
    imageUrl?: string;
    isContainer?: boolean;
    votedFor?: Array<{
      displayName: string;
      id: string;
      uniqueName: string;
      imageUrl?: string;
    }>;
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
  isContainer?: boolean; // True if this is a team/group
  votedFor?: Array<{
    // Members who voted on behalf of this team/group
    displayName: string;
    id: string;
    uniqueName: string;
    imageUrl?: string;
  }>;
}

export interface PullRequestStatus {
  id: number;
  state: 'pending' | 'succeeded' | 'failed' | 'error' | 'notSet' | 'notApplicable';
  description: string;
  context: {
    name: string;
    genre: string;
  };
  targetUrl?: string;
  creationDate: string;
  updatedDate: string;
}

export interface Pipeline {
  id: number;
  name: string;
  path: string;
  type: string;
  queueStatus: string;
  revision: number;
  project?: {
    id: string;
    name: string;
  };
}

export interface PipelineRunStage {
  id: string;
  name: string;
  state: 'pending' | 'inProgress' | 'completed' | 'skipped';
  result?: 'succeeded' | 'failed' | 'canceled' | 'skipped';
  startTime?: Date;
  finishTime?: Date;
  order: number;
}

export interface PipelineRunJob {
  id: string;
  name: string;
  state: 'pending' | 'inProgress' | 'completed' | 'skipped';
  result?: 'succeeded' | 'failed' | 'canceled' | 'skipped';
  startTime?: Date;
  finishTime?: Date;
  order: number;
  parentId?: string;
}

export interface PipelineRunTask {
  id: string;
  name: string;
  state: 'pending' | 'inProgress' | 'completed' | 'skipped';
  result?: 'succeeded' | 'failed' | 'canceled' | 'skipped';
  startTime?: Date;
  finishTime?: Date;
  order: number;
  parentId?: string;
  logUrl?: string;
  logId?: number;
}

export interface PipelineRun {
  id: number;
  buildNumber: string;
  status: 'inProgress' | 'completed' | 'cancelling' | 'postponed' | 'notStarted' | 'none';
  result?: 'succeeded' | 'failed' | 'canceled' | 'partiallySucceeded' | 'none';
  queueTime: Date;
  startTime?: Date;
  finishTime?: Date;
  requestedFor: string;
  requestedForImageUrl?: string;
  pipelineName: string;
  pipelineId: number;
  sourceBranch: string;
  sourceVersion: string;
  repository?: {
    id: string;
    name: string;
  };
  url?: string;
  reason?: string; // 'individualCI', 'manual', 'pullRequest', 'schedule', etc.
  triggerInfo?: {
    prId?: number;
    prTitle?: string;
  };
  stages?: PipelineRunStage[];
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

export interface GitChange {
  changeType: 'add' | 'edit' | 'delete' | 'rename';
  item: {
    path: string;
    gitObjectType?: 'blob' | 'tree' | 'commit';
    url?: string;
  };
  sourceServerItem?: string; // For renames, the original path
}

export interface PullRequestIteration {
  id: number;
  description?: string;
  author?: CommentIdentity;
  createdDate: string;
  updatedDate: string;
  sourceRefCommit?: {
    commitId: string;
  };
  targetRefCommit?: {
    commitId: string;
  };
  commonRefCommit?: {
    commitId: string;
  };
  hasMoreCommits?: boolean;
}

export interface PullRequestFileChange {
  path: string;
  changeType: 'add' | 'edit' | 'delete' | 'rename';
  originalPath?: string; // For renames
  additions?: number;
  deletions?: number;
}

export interface GitCommit {
  commitId: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  committer?: {
    name: string;
    email: string;
    date: string;
  };
  comment: string;
  commentTruncated?: boolean;
  url?: string;
}

export interface PullRequestUpdate {
  iteration: PullRequestIteration;
  commits: GitCommit[];
  pushCount: number;
}

export interface FileDiff {
  path: string;
  changeType: 'add' | 'edit' | 'delete' | 'rename';
  hunks: DiffHunk[];
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface DiffLine {
  type: 'context' | 'add' | 'delete';
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
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
   * Cleans up display names that may contain service account names
   * Falls back to email-based name extraction if needed
   */
  private getCleanDisplayName(identity: any): string {
    if (!identity) {
      return 'Unknown';
    }

    const displayName = identity.displayName || '';
    const uniqueName = identity.uniqueName || '';

    // Check if displayName looks like a GUID (contains only hex chars, hyphens, and numbers)
    const isGuidLike = /^[0-9a-fA-F\-\s]+$/.test(displayName);

    // If displayName is a service account name or GUID-like, use uniqueName instead
    if (
      displayName.includes('Microsoft.VisualStudio.Services') ||
      displayName.includes('TEAM FOUNDATION') ||
      isGuidLike ||
      displayName.trim() === ''
    ) {
      // Check if uniqueName is also a GUID-like string
      if (uniqueName && /^[0-9a-fA-F\-\s]+$/.test(uniqueName)) {
        // Both displayName and uniqueName are GUIDs, check other fields
        const name = identity.name || identity.providerDisplayName || identity.id;
        if (name && !/^[0-9a-fA-F\-\s]+$/.test(name)) {
          return name;
        }
        return 'Unknown User';
      }

      // Extract name from email (before @)
      if (uniqueName && uniqueName.includes('@')) {
        const namePart = uniqueName.split('@')[0];
        // Convert dot-separated or hyphen-separated names to title case
        return namePart
          .split(/[._-]/)
          .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join(' ');
      }

      // If uniqueName exists but doesn't have @, return it as-is (might be a username)
      if (uniqueName && uniqueName.trim() !== '') {
        return uniqueName;
      }

      return 'Unknown User';
    }

    return displayName;
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

  /**
   * Fetches all statuses (checks/policies) for a pull request
   */
  async getPullRequestStatuses(
    project: string,
    repositoryId: string,
    pullRequestId: number,
  ): Promise<PullRequestStatus[]> {
    try {
      const url = `${this.baseUrl}/${project}/_apis/git/repositories/${repositoryId}/pullRequests/${pullRequestId}/statuses?api-version=7.1-preview.1`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch PR statuses: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      const data = (await response.json()) as { value?: PullRequestStatus[] };
      return data.value || [];
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching PR statuses: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Updates a pull request's description
   */
  async updatePullRequestDescription(
    project: string,
    repositoryId: string,
    pullRequestId: number,
    description: string,
  ): Promise<void> {
    try {
      const url = `${this.baseUrl}/${project}/_apis/git/repositories/${repositoryId}/pullRequests/${pullRequestId}?api-version=7.1-preview.1`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({
          description: description,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update PR description: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        vscode.window.showErrorMessage(`Error updating PR description: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Fetches repository information including the repository GUID
   * @param project - The project name
   * @param repositoryName - The repository name
   */
  async getRepositoryId(project: string, repositoryName: string): Promise<string | null> {
    try {
      const url = `${this.baseUrl}/${project}/_apis/git/repositories/${repositoryName}?api-version=7.1`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Failed to fetch repository ID: ${response.status} ${response.statusText}. ${errorText}`,
        );
        return null;
      }

      const repo = (await response.json()) as { id?: string };
      return repo.id || null;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching repository ID: ${error.message}`);
      }
      return null;
    }
  }

  /**
   * Fetches pipelines (build definitions) for a specific project and repository
   * @param project - The project name
   * @param repositoryId - The repository GUID (not name)
   */
  async getPipelines(project: string, repositoryId: string): Promise<Pipeline[]> {
    try {
      const url = `${this.baseUrl}/${project}/_apis/build/definitions?repositoryId=${repositoryId}&repositoryType=TfsGit&api-version=7.1`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch pipelines: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      const data = (await response.json()) as { value?: any[] };
      const definitions = data.value || [];

      return definitions.map((def) => ({
        id: def.id,
        name: def.name,
        path: def.path || '\\',
        type: def.type,
        queueStatus: def.queueStatus,
        revision: def.revision,
        project: def.project
          ? {
              id: def.project.id,
              name: def.project.name,
            }
          : undefined,
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching pipelines: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Fetches pipeline runs (builds) for a specific pipeline
   * @param project - The project name
   * @param pipelineId - The pipeline definition ID
   * @param top - Optional: Number of builds to return (default: 3)
   */
  async getPipelineRunsForPipeline(
    project: string,
    pipelineId: number,
    top: number = 3,
  ): Promise<PipelineRun[]> {
    try {
      const url = `${this.baseUrl}/${project}/_apis/build/builds?definitions=${pipelineId}&api-version=7.1&$top=${top}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch pipeline runs: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      const data = (await response.json()) as { value?: any[] };
      const builds = data.value || [];

      // Transform Azure DevOps build format to our PipelineRun interface
      return builds.map((build) => ({
        id: build.id,
        buildNumber: build.buildNumber,
        status: build.status,
        result: build.result,
        queueTime: new Date(build.queueTime),
        startTime: build.startTime ? new Date(build.startTime) : undefined,
        finishTime: build.finishTime ? new Date(build.finishTime) : undefined,
        requestedFor: this.getCleanDisplayName(build.requestedFor),
        requestedForImageUrl: build.requestedFor?.imageUrl,
        pipelineName: build.definition?.name || 'Unknown Pipeline',
        pipelineId: build.definition?.id || 0,
        sourceBranch: build.sourceBranch?.replace('refs/heads/', '') || 'Unknown',
        sourceVersion: build.sourceVersion?.substring(0, 7) || '',
        repository: build.repository
          ? {
              id: build.repository.id,
              name: build.repository.name,
            }
          : undefined,
        url: build._links?.web?.href,
        reason: build.reason,
        triggerInfo:
          build.triggerInfo && build.triggerInfo['pr.number']
            ? {
                prId: parseInt(build.triggerInfo['pr.number'], 10),
                prTitle: build.triggerInfo['pr.title'],
              }
            : undefined,
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching pipeline runs: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Fetches pipeline runs (builds) for a specific repository
   * @param project - The project name
   * @param repositoryId - The repository GUID (not name)
   * @param top - Optional: Number of builds to return (default: 50)
   */
  async getPipelineRuns(
    project: string,
    repositoryId: string,
    top: number = 50,
  ): Promise<PipelineRun[]> {
    try {
      const url = `${this.baseUrl}/${project}/_apis/build/builds?repositoryId=${repositoryId}&repositoryType=TfsGit&api-version=7.1&$top=${top}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch pipeline runs: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      const data = (await response.json()) as { value?: any[] };
      const builds = data.value || [];

      // Transform Azure DevOps build format to our PipelineRun interface
      return builds.map((build) => ({
        id: build.id,
        buildNumber: build.buildNumber,
        status: build.status,
        result: build.result,
        queueTime: new Date(build.queueTime),
        startTime: build.startTime ? new Date(build.startTime) : undefined,
        finishTime: build.finishTime ? new Date(build.finishTime) : undefined,
        requestedFor: this.getCleanDisplayName(build.requestedFor),
        requestedForImageUrl: build.requestedFor?.imageUrl,
        pipelineName: build.definition?.name || 'Unknown Pipeline',
        pipelineId: build.definition?.id || 0,
        sourceBranch: build.sourceBranch?.replace('refs/heads/', '') || 'Unknown',
        sourceVersion: build.sourceVersion?.substring(0, 7) || '',
        repository: build.repository
          ? {
              id: build.repository.id,
              name: build.repository.name,
            }
          : undefined,
        url: build._links?.web?.href,
        reason: build.reason,
        triggerInfo:
          build.triggerInfo && build.triggerInfo['pr.number']
            ? {
                prId: parseInt(build.triggerInfo['pr.number'], 10),
                prTitle: build.triggerInfo['pr.title'],
              }
            : undefined,
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching pipeline runs: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Fetches the timeline (stages/jobs) for a specific build
   * @param project - The project name
   * @param buildId - The build ID
   */
  async getBuildTimeline(project: string, buildId: number): Promise<PipelineRunStage[]> {
    try {
      const url = `${this.baseUrl}/${project}/_apis/build/builds/${buildId}/timeline?api-version=7.1`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch build timeline: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      const data = (await response.json()) as { records?: any[] };
      const records = data.records || [];

      // Filter for stage-level records only
      const stages = records
        .filter((record) => record.type === 'Stage')
        .map((stage) => ({
          id: stage.id,
          name: stage.name,
          state: stage.state,
          result: stage.result,
          startTime: stage.startTime ? new Date(stage.startTime) : undefined,
          finishTime: stage.finishTime ? new Date(stage.finishTime) : undefined,
          order: stage.order || 0,
        }))
        .sort((a, b) => a.order - b.order);

      return stages;
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error fetching build timeline: ${error.message}`);
      }
      return [];
    }
  }

  /**
   * Fetches jobs for a specific stage (goes through Phases)
   * Azure DevOps hierarchy: Stage → Phase → Job → Task
   * @param project - The project name
   * @param buildId - The build ID
   * @param stageId - The stage ID
   */
  async getStageJobs(project: string, buildId: number, stageId: string): Promise<PipelineRunJob[]> {
    try {
      const url = `${this.baseUrl}/${project}/_apis/build/builds/${buildId}/timeline?api-version=7.1`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch stage jobs: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      const data = (await response.json()) as { records?: any[] };
      const records = data.records || [];

      // First, find all Phases that belong to this Stage
      const phases = records.filter(
        (record) => record.type === 'Phase' && record.parentId === stageId,
      );

      // Then, find all Jobs that belong to these Phases
      const phaseIds = phases.map((p) => p.id);
      const jobs = records
        .filter((record) => record.type === 'Job' && phaseIds.includes(record.parentId))
        .map((job) => ({
          id: job.id,
          name: job.name,
          state: job.state,
          result: job.result,
          startTime: job.startTime ? new Date(job.startTime) : undefined,
          finishTime: job.finishTime ? new Date(job.finishTime) : undefined,
          order: job.order || 0,
          parentId: job.parentId,
        }))
        .sort((a, b) => a.order - b.order);

      console.log(`Found ${jobs.length} jobs across ${phases.length} phases`);
      return jobs;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching stage jobs: ${error.message}`);
      }
      return [];
    }
  }

  /**
   * Fetches tasks for a specific job
   * @param project - The project name
   * @param buildId - The build ID
   * @param jobId - The job ID
   */
  async getJobTasks(project: string, buildId: number, jobId: string): Promise<PipelineRunTask[]> {
    try {
      const url = `${this.baseUrl}/${project}/_apis/build/builds/${buildId}/timeline?api-version=7.1`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch job tasks: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      const data = (await response.json()) as { records?: any[] };
      const records = data.records || [];

      // Filter for tasks that belong to this job
      const tasks = records
        .filter((record) => record.type === 'Task' && record.parentId === jobId)
        .map((task) => ({
          id: task.id,
          name: task.name,
          state: task.state,
          result: task.result,
          startTime: task.startTime ? new Date(task.startTime) : undefined,
          finishTime: task.finishTime ? new Date(task.finishTime) : undefined,
          order: task.order || 0,
          parentId: task.parentId,
          logId: task.log?.id,
          logUrl: task.log?.url,
        }))
        .sort((a, b) => a.order - b.order);

      return tasks;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching job tasks: ${error.message}`);
      }
      return [];
    }
  }

  /**
   * Fetches logs for a specific task
   * @param project - The project name
   * @param buildId - The build ID
   * @param logId - The log ID
   */
  async getTaskLogs(project: string, buildId: number, logId: number): Promise<string[]> {
    try {
      const url = `${this.baseUrl}/${project}/_apis/build/builds/${buildId}/logs/${logId}?api-version=7.1`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch task logs: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      const logData = (await response.json()) as { count?: number; value?: string[] };

      // Azure DevOps returns logs as {count: number, value: string[]}
      if (logData && logData.value && Array.isArray(logData.value)) {
        return logData.value;
      }

      // Fallback: if it's not the expected format, return empty
      console.warn('Unexpected log format, expected {count, value}');
      return [];
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching task logs: ${error.message}`);
      }
      return [];
    }
  }

  /**
   * Fetches all iterations for a pull request
   * @param project - The project name
   * @param repositoryId - The repository ID
   * @param pullRequestId - The pull request ID
   */
  async getPullRequestIterations(
    project: string,
    repositoryId: string,
    pullRequestId: number,
  ): Promise<PullRequestIteration[]> {
    try {
      const url = `${this.baseUrl}/${project}/_apis/git/repositories/${repositoryId}/pullRequests/${pullRequestId}/iterations?api-version=7.1`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch PR iterations: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      const data = (await response.json()) as { value?: PullRequestIteration[] };
      return data.value || [];
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching PR iterations: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Fetches file changes for a pull request iteration
   * @param project - The project name
   * @param repositoryId - The repository ID
   * @param pullRequestId - The pull request ID
   * @param iterationId - Optional: The iteration ID (defaults to latest iteration)
   */
  async getPullRequestFileChanges(
    project: string,
    repositoryId: string,
    pullRequestId: number,
    iterationId?: number,
  ): Promise<PullRequestFileChange[]> {
    try {
      // If no iteration ID provided, get the latest iteration
      let targetIterationId = iterationId;
      if (!targetIterationId) {
        const iterations = await this.getPullRequestIterations(
          project,
          repositoryId,
          pullRequestId,
        );
        if (iterations.length === 0) {
          console.warn('No iterations found for PR');
          return [];
        }
        // Get the latest iteration (highest ID)
        targetIterationId = Math.max(...iterations.map((i) => i.id));
      }

      const url = `${this.baseUrl}/${project}/_apis/git/repositories/${repositoryId}/pullRequests/${pullRequestId}/iterations/${targetIterationId}/changes?api-version=7.1`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch PR file changes: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      const data = (await response.json()) as { changeEntries?: GitChange[] };

      const changes = data.changeEntries || [];

      // Transform to our simplified format
      // Note: Some Azure DevOps responses don't include gitObjectType
      // We filter out entries that are clearly folders (paths without file extensions or ending in /)
      const fileChanges = changes
        .filter((change) => {
          // If gitObjectType is present, use it
          if (change.item.gitObjectType) {
            return change.item.gitObjectType === 'blob';
          }
          // Otherwise, assume it's a file if path doesn't end with /
          // This is a heuristic since the API doesn't always provide gitObjectType
          return change.item.path && !change.item.path.endsWith('/');
        })
        .map((change) => ({
          path: change.item.path,
          changeType: change.changeType,
          originalPath: change.sourceServerItem,
          // Note: Azure DevOps doesn't directly provide line counts in this endpoint
          // You would need to fetch the actual diff to get additions/deletions
        }));

      return fileChanges;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching PR file changes: ${error.message}`);
        console.error('Full error:', error);
      }
      throw error;
    }
  }

  /**
   * Fetches the diff for a specific file in a pull request iteration
   * @param project - The project name
   * @param repositoryId - The repository ID
   * @param pullRequestId - The pull request ID
   * @param iterationId - The iteration ID
   * @param baseIterationId - The base iteration ID (usually iterationId - 1, or omit for comparison with target)
   * @param filePath - The file path to get diff for
   */
  async getFileDiff(
    project: string,
    repositoryId: string,
    pullRequestId: number,
    iterationId: number,
    baseIterationId?: number,
    filePath?: string,
  ): Promise<FileDiff[]> {
    try {
      let url = `${this.baseUrl}/${project}/_apis/git/repositories/${repositoryId}/pullRequests/${pullRequestId}/iterations/${iterationId}/changes?api-version=7.1`;

      // If baseIterationId is provided, compare between iterations
      if (baseIterationId) {
        url += `&$compareTo=${baseIterationId}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `Failed to fetch file diff: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      const data = (await response.json()) as any;

      // Azure DevOps returns changeEntries with diff content
      const changeEntries = data.changeEntries || [];

      // Filter for specific file if requested
      let entries = changeEntries;
      if (filePath) {
        entries = changeEntries.filter((entry: any) => entry.item.path === filePath);
      }

      // Parse the diffs
      const diffs: FileDiff[] = entries
        .filter((entry: any) => entry.item.path && !entry.item.path.endsWith('/'))
        .map((entry: any) => {
          const diff: FileDiff = {
            path: entry.item.path,
            changeType: entry.changeType,
            hunks: [],
          };

          // If there's a diff string, parse it
          if (entry.item.contentMetadata?.encoding) {
            // The diff might be in the changeEntry or we might need to make another request
            // For now, we'll return the structure and fetch content separately if needed
          }

          return diff;
        });

      return diffs;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching file diff: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Gets the content of a file at a specific commit
   * @param project - The project name
   * @param repositoryId - The repository ID
   * @param path - The file path
   * @param versionDescriptor - The version (commit SHA, branch, etc)
   */
  async getFileContent(
    project: string,
    repositoryId: string,
    path: string,
    versionDescriptor: string,
  ): Promise<string> {
    try {
      // Add includeContent=true and $format=text to get raw content
      const url = `${this.baseUrl}/${project}/_apis/git/repositories/${repositoryId}/items?path=${encodeURIComponent(path)}&versionType=commit&version=${versionDescriptor}&includeContent=true&api-version=7.1`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...this.headers,
          Accept: 'text/plain', // Request plain text instead of JSON
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch file content: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      const content = await response.text();
      return content;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching file content: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Fetches all commits for a pull request
   * @param project - The project name
   * @param repositoryId - The repository ID
   * @param pullRequestId - The pull request ID
   */
  async getPullRequestCommits(
    project: string,
    repositoryId: string,
    pullRequestId: number,
  ): Promise<GitCommit[]> {
    try {
      const url = `${this.baseUrl}/${project}/_apis/git/repositories/${repositoryId}/pullRequests/${pullRequestId}/commits?api-version=7.1`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch PR commits: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      const data = (await response.json()) as { value?: GitCommit[] };
      return data.value || [];
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching PR commits: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Fetches commits for a specific PR iteration
   * @param project - The project name
   * @param repositoryId - The repository ID
   * @param pullRequestId - The pull request ID
   * @param iterationId - The iteration ID
   */
  async getIterationCommits(
    project: string,
    repositoryId: string,
    pullRequestId: number,
    iterationId: number,
  ): Promise<GitCommit[]> {
    try {
      const url = `${this.baseUrl}/${project}/_apis/git/repositories/${repositoryId}/pullRequests/${pullRequestId}/iterations/${iterationId}/commits?api-version=7.1`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch iteration commits: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      const data = (await response.json()) as { value?: GitCommit[] };
      return data.value || [];
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching iteration commits: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Fetches all PR updates (iterations with their commits)
   * @param project - The project name
   * @param repositoryId - The repository ID
   * @param pullRequestId - The pull request ID
   */
  async getPullRequestUpdates(
    project: string,
    repositoryId: string,
    pullRequestId: number,
  ): Promise<PullRequestUpdate[]> {
    try {
      // First fetch all iterations
      const iterations = await this.getPullRequestIterations(project, repositoryId, pullRequestId);

      // Then fetch commits for each iteration
      const updates: PullRequestUpdate[] = await Promise.all(
        iterations.map(async (iteration) => {
          const commits = await this.getIterationCommits(
            project,
            repositoryId,
            pullRequestId,
            iteration.id,
          );

          return {
            iteration,
            commits,
            pushCount: commits.length,
          };
        }),
      );

      // Return in reverse order (newest first)
      return updates.reverse();
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching PR updates: ${error.message}`);
      }
      throw error;
    }
  }
}
