import * as vscode from 'vscode';
import { AuthService } from './services/authService';
import { GitService, AzureDevOpsRepository } from './services/gitService';
import { AzureDevOpsApiClient } from './services/azureDevOpsApiClient';
import { PrTransformer } from './services/prTransformer';

export interface PullRequest {
  id: number;
  title: string;
  author: string;
  createdDate: Date;
  status: 'Active' | 'Completed' | 'Abandoned';
  isDraft: boolean;
  targetBranch: string;
  sourceBranch: string;
  reviewers: string[];
  description?: string;
  repository?: AzureDevOpsRepository; // Link PR to its repository
}

export class SignInItem extends vscode.TreeItem {
  constructor() {
    super('Sign in to Azure DevOps', vscode.TreeItemCollapsibleState.None);
    this.tooltip = 'Click to sign in with your Personal Access Token';
    this.iconPath = new vscode.ThemeIcon('sign-in');
    this.contextValue = 'signIn';
    this.command = {
      command: 'azureDevOpsPr.signIn',
      title: 'Sign In',
    };
  }
}

export class PullRequestItem extends vscode.TreeItem {
  constructor(
    public readonly pullRequest: PullRequest,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(pullRequest.title, collapsibleState);
    this.tooltip = `PR #${pullRequest.id}: ${pullRequest.title}`;
    this.description = `#${pullRequest.id} • ${pullRequest.author} • ${this.formatDate(pullRequest.createdDate)}`;
    this.contextValue = 'pullRequest';

    // Make the item clickable
    this.command = {
      command: 'azureDevOpsPr.openPrDetails',
      title: 'Open PR Details',
      arguments: [pullRequest],
    };

    // Set icon based on status
    if (pullRequest.isDraft) {
      this.iconPath = new vscode.ThemeIcon('git-pull-request-draft');
    } else if (pullRequest.status === 'Active') {
      this.iconPath = new vscode.ThemeIcon('git-pull-request');
    } else if (pullRequest.status === 'Completed') {
      this.iconPath = new vscode.ThemeIcon('git-merge');
    } else {
      this.iconPath = new vscode.ThemeIcon('git-pull-request-closed');
    }
  }

  private formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

export class PullRequestCategoryItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly pullRequests: PullRequest[],
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(label, collapsibleState);
    this.tooltip = `${label} (${pullRequests.length})`;
    this.description = `${pullRequests.length}`;
    this.contextValue = 'pullRequestCategory';
    this.iconPath = new vscode.ThemeIcon('folder');
  }
}

export class RepositoryItem extends vscode.TreeItem {
  constructor(
    public readonly repository: AzureDevOpsRepository,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    const label = `${repository.project} / ${repository.repository}`;
    super(label, collapsibleState);
    this.tooltip = `${repository.organization}/${repository.project}/${repository.repository}`;
    this.description = repository.workspaceFolder.name;
    this.contextValue = 'repository';
    this.iconPath = new vscode.ThemeIcon('repo');
  }
}

type TreeElement = RepositoryItem | PullRequestCategoryItem | PullRequestItem | SignInItem;

export interface PrStatusFilter {
  active: boolean;
  draft: boolean;
  completed: boolean;
  abandoned: boolean;
}

export class PullRequestProvider implements vscode.TreeDataProvider<TreeElement> {
  private _onDidChangeTreeData: vscode.EventEmitter<TreeElement | undefined | null | void> =
    new vscode.EventEmitter<TreeElement | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<TreeElement | undefined | null | void> =
    this._onDidChangeTreeData.event;

  private gitService: GitService;
  private statusFilter: PrStatusFilter = {
    active: true,
    draft: true,
    completed: false,
    abandoned: false,
  };

  constructor(private authService: AuthService) {
    this.gitService = new GitService();
  }

  /**
   * Gets the current filter settings
   */
  getFilter(): PrStatusFilter {
    return { ...this.statusFilter };
  }

  /**
   * Updates the filter settings
   */
  setFilter(filter: PrStatusFilter): void {
    this.statusFilter = filter;
    this.refresh();
  }

  /**
   * Gets the current user's email from the stored profile
   */
  private getCurrentUserEmail(): string {
    const userProfile = this.authService.getUserProfileService().getStoredProfile();
    return userProfile?.emailAddress || 'unknown@user.com';
  }

  /**
   * Filters PRs based on current filter settings
   */
  private filterPullRequests(prs: PullRequest[]): PullRequest[] {
    return prs.filter((pr) => {
      // Filter by status
      if (pr.status === 'Active' && pr.isDraft) {
        return this.statusFilter.draft;
      }
      if (pr.status === 'Active' && !pr.isDraft) {
        return this.statusFilter.active;
      }
      if (pr.status === 'Completed') {
        return this.statusFilter.completed;
      }
      if (pr.status === 'Abandoned') {
        return this.statusFilter.abandoned;
      }
      return true;
    });
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TreeElement): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: TreeElement): Promise<TreeElement[]> {
    // Check if user is authenticated
    const isAuthenticated = await this.authService.isAuthenticated();

    if (!isAuthenticated && !element) {
      // Show sign in prompt
      return [new SignInItem()];
    }

    if (!element) {
      // Root level: Show repositories
      const repositories = await this.gitService.detectAzureDevOpsRepositories();

      if (repositories.length === 0) {
        // No Azure DevOps repositories found
        return [];
      }

      // Return repository items
      return repositories.map(
        (repo) => new RepositoryItem(repo, vscode.TreeItemCollapsibleState.Expanded),
      );
    } else if (element instanceof RepositoryItem) {
      // Return categories for this repository
      const createdByMeRaw = await this.getPullRequestsCreatedByMe(element.repository);
      const waitingForMyReviewRaw = await this.getPullRequestsWaitingForMyReview(
        element.repository,
      );

      // Apply filters
      const createdByMe = this.filterPullRequests(createdByMeRaw);
      const waitingForMyReview = this.filterPullRequests(waitingForMyReviewRaw);

      return [
        new PullRequestCategoryItem(
          'Created by me',
          createdByMe,
          vscode.TreeItemCollapsibleState.Expanded,
        ),
        new PullRequestCategoryItem(
          'Waiting for my review',
          waitingForMyReview,
          vscode.TreeItemCollapsibleState.Expanded,
        ),
      ];
    } else if (element instanceof PullRequestCategoryItem) {
      // Return pull requests for this category
      return element.pullRequests.map(
        (pr) => new PullRequestItem(pr, vscode.TreeItemCollapsibleState.None),
      );
    }

    return [];
  }

  private getDummyPullRequests(): PullRequest[] {
    const currentUserEmail = this.getCurrentUserEmail();
    return [
      {
        id: 1234,
        title: 'Add user authentication to login page',
        author: currentUserEmail,
        createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: 'Active',
        isDraft: false,
        targetBranch: 'main',
        sourceBranch: 'feature/auth-login',
        reviewers: ['jane.smith@company.com', 'bob.wilson@company.com'],
        description: 'Implements OAuth2 authentication flow for the login page',
      },
      {
        id: 1235,
        title: 'Fix navigation menu responsive design',
        author: 'jane.smith@company.com',
        createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        status: 'Active',
        isDraft: false,
        targetBranch: 'main',
        sourceBranch: 'bugfix/nav-responsive',
        reviewers: ['john.doe@company.com', 'alice.johnson@company.com'],
        description: 'Fixes mobile navigation menu layout issues',
      },
      {
        id: 1236,
        title: 'Update API documentation',
        author: currentUserEmail,
        createdDate: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        status: 'Active',
        isDraft: true,
        targetBranch: 'main',
        sourceBranch: 'docs/api-update',
        reviewers: ['tech.lead@company.com'],
        description: 'Updates API documentation with new endpoints',
      },
      {
        id: 1237,
        title: 'Implement dark mode theme',
        author: 'alice.johnson@company.com',
        createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        status: 'Active',
        isDraft: false,
        targetBranch: 'main',
        sourceBranch: 'feature/dark-mode',
        reviewers: [currentUserEmail, 'jane.smith@company.com'],
        description: 'Adds dark mode support with theme switching',
      },
      {
        id: 1238,
        title: 'Refactor database connection logic',
        author: 'bob.wilson@company.com',
        createdDate: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        status: 'Active',
        isDraft: false,
        targetBranch: 'main',
        sourceBranch: 'refactor/db-connection',
        reviewers: [currentUserEmail],
        description: 'Improves database connection pooling and error handling',
      },
      {
        id: 1239,
        title: 'Add unit tests for user service',
        author: currentUserEmail,
        createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        status: 'Completed',
        isDraft: false,
        targetBranch: 'main',
        sourceBranch: 'test/user-service',
        reviewers: ['jane.smith@company.com'],
        description: 'Adds comprehensive unit tests for user service methods',
      },
      {
        id: 1240,
        title: 'Improve driver code generation',
        author: currentUserEmail,
        createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        status: 'Abandoned',
        isDraft: false,
        targetBranch: 'main',
        sourceBranch: 'test/user-service',
        reviewers: ['jane.smith@company.com'],
        description: 'Added while loop',
      },
    ];
  }

  private async getPullRequestsCreatedByMe(
    repository: AzureDevOpsRepository,
  ): Promise<PullRequest[]> {
    try {
      const pat = await this.authService.getPersonalAccessToken();
      if (!pat) {
        return [];
      }

      const apiClient = new AzureDevOpsApiClient({
        organization: repository.organization,
        pat,
      });

      const azurePrs = await apiClient.getPullRequestsCreatedByMe(
        repository.project,
        repository.repository,
      );

      return PrTransformer.transformList(azurePrs, repository);
    } catch (error) {
      console.error('Error fetching PRs created by me:', error);
      // Fall back to dummy data on error
      const currentUserEmail = this.getCurrentUserEmail();
      return this.getDummyPullRequests()
        .filter((pr) => pr.author === currentUserEmail)
        .map((pr) => ({ ...pr, repository }));
    }
  }

  private async getPullRequestsWaitingForMyReview(
    repository: AzureDevOpsRepository,
  ): Promise<PullRequest[]> {
    try {
      const pat = await this.authService.getPersonalAccessToken();
      if (!pat) {
        return [];
      }

      const apiClient = new AzureDevOpsApiClient({
        organization: repository.organization,
        pat,
      });

      const azurePrs = await apiClient.getPullRequestsForMyReview(
        repository.project,
        repository.repository,
      );

      return PrTransformer.transformList(azurePrs, repository);
    } catch (error) {
      console.error('Error fetching PRs for my review:', error);
      // Fall back to dummy data on error
      const currentUserEmail = this.getCurrentUserEmail();
      return this.getDummyPullRequests()
        .filter(
          (pr) =>
            pr.author !== currentUserEmail &&
            pr.reviewers.includes(currentUserEmail) &&
            pr.status === 'Active',
        )
        .map((pr) => ({ ...pr, repository }));
    }
  }
}
