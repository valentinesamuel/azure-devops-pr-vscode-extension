import * as vscode from 'vscode';
import { AuthService } from './services/authService';
import { GitService, AzureDevOpsRepository } from './services/gitService';
import {
  AzureDevOpsApiClient,
  PipelineRun,
  Pipeline,
  PipelineRunStage,
} from './services/azureDevOpsApiClient';

export interface PipelineRunFilter {
  inProgress: boolean;
  succeeded: boolean;
  failed: boolean;
  canceled: boolean;
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

export class PipelineItem extends vscode.TreeItem {
  constructor(
    public readonly pipeline: Pipeline,
    public readonly repository: AzureDevOpsRepository,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(pipeline.name, collapsibleState);
    this.tooltip = `${pipeline.name} (${pipeline.path})`;
    this.description = '';
    this.contextValue = 'pipeline';
    this.iconPath = new vscode.ThemeIcon('rocket');
  }
}

export class StageItem extends vscode.TreeItem {
  constructor(
    public readonly stage: PipelineRunStage,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(stage.name, collapsibleState);

    this.contextValue = 'stage';

    // Set icon based on result/state with different icons than pipeline runs
    if (stage.state === 'inProgress') {
      this.iconPath = new vscode.ThemeIcon('sync~spin', new vscode.ThemeColor('charts.blue'));
    } else if (stage.result === 'succeeded') {
      this.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
    } else if (stage.result === 'failed') {
      this.iconPath = new vscode.ThemeIcon('x', new vscode.ThemeColor('charts.red'));
    } else if (stage.result === 'skipped' || stage.state === 'skipped') {
      this.iconPath = new vscode.ThemeIcon('dash', new vscode.ThemeColor('charts.gray'));
    } else if (stage.state === 'pending') {
      this.iconPath = new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('charts.gray'));
    } else {
      this.iconPath = new vscode.ThemeIcon('circle-outline');
    }
  }
}

export class PipelineRunItem extends vscode.TreeItem {
  constructor(
    public readonly pipelineRun: PipelineRun,
    public readonly repository: AzureDevOpsRepository,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    // Format: #buildNumber • Merged PR 12345: commit message
    const triggerDisplay = PipelineRunItem.getTriggerDisplay(pipelineRun);
    const label = `#${pipelineRun.buildNumber} • ${triggerDisplay}`;

    super(label, collapsibleState);

    // Description: branch • commit hash • date • duration
    const duration = this.calculateDuration(pipelineRun);
    const dateStr = this.formatDate(pipelineRun.queueTime);
    this.description = `${pipelineRun.sourceBranch} • ${pipelineRun.sourceVersion} • ${dateStr} • ${duration}`;

    // Tooltip with full details
    this.tooltip = `Build #${pipelineRun.buildNumber}\n${triggerDisplay}\nBranch: ${pipelineRun.sourceBranch}\nCommit: ${pipelineRun.sourceVersion}\nStatus: ${pipelineRun.result || pipelineRun.status}\nDuration: ${duration}\nQueued: ${this.formatFullDate(pipelineRun.queueTime)}`;

    this.contextValue = 'pipelineRun';

    // Set icon based on result/status
    if (pipelineRun.status === 'inProgress') {
      this.iconPath = new vscode.ThemeIcon('loading~spin', new vscode.ThemeColor('charts.blue'));
    } else if (pipelineRun.result === 'succeeded') {
      this.iconPath = new vscode.ThemeIcon('pass', new vscode.ThemeColor('charts.green'));
    } else if (pipelineRun.result === 'failed') {
      this.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('charts.red'));
    } else if (pipelineRun.result === 'canceled') {
      this.iconPath = new vscode.ThemeIcon('circle-slash', new vscode.ThemeColor('charts.gray'));
    } else {
      this.iconPath = new vscode.ThemeIcon('circle-outline');
    }
  }

  private static getTriggerDisplay(run: PipelineRun): string {
    if (run.triggerInfo?.prId) {
      return `Merged PR ${run.triggerInfo.prId}${run.triggerInfo.prTitle ? ': ' + run.triggerInfo.prTitle : ''}`;
    }

    switch (run.reason) {
      case 'individualCI':
        return `Individual CI for ${run.requestedFor}`;
      case 'manual':
        return `Manually run by ${run.requestedFor}`;
      case 'pullRequest':
        return `PR validation`;
      case 'schedule':
        return `Scheduled run`;
      case 'batchedCI':
        return `Batched CI`;
      default:
        return run.reason || 'Build';
    }
  }

  private calculateDuration(run: PipelineRun): string {
    if (!run.startTime) {
      return 'Not started';
    }

    const endTime = run.finishTime || new Date();
    const durationMs = endTime.getTime() - run.startTime.getTime();
    const minutes = Math.floor(durationMs / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

    if (minutes === 0) {
      return `${seconds}s`;
    } else {
      return `${minutes}m ${seconds}s`;
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
    } else {
      // Format as "24 Sept" or similar
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sept',
        'Oct',
        'Nov',
        'Dec',
      ];
      const day = date.getDate();
      const month = monthNames[date.getMonth()];
      return `${day} ${month}`;
    }
  }

  private formatFullDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (diffDays === 0) {
      return `Today at ${timeStr}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${timeStr}`;
    } else {
      return date.toLocaleDateString() + ' at ' + timeStr;
    }
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

type TreeElement = RepositoryItem | PipelineItem | PipelineRunItem | StageItem | SignInItem;

export class PipelineRunProvider implements vscode.TreeDataProvider<TreeElement> {
  private _onDidChangeTreeData: vscode.EventEmitter<TreeElement | undefined | null | void> =
    new vscode.EventEmitter<TreeElement | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<TreeElement | undefined | null | void> =
    this._onDidChangeTreeData.event;

  private gitService: GitService;
  private statusFilter: PipelineRunFilter = {
    inProgress: true,
    succeeded: true,
    failed: true,
    canceled: false,
  };

  constructor(private authService: AuthService) {
    this.gitService = new GitService();
  }

  /**
   * Gets the current filter settings
   */
  getFilter(): PipelineRunFilter {
    return { ...this.statusFilter };
  }

  /**
   * Updates the filter settings
   */
  setFilter(filter: PipelineRunFilter): void {
    this.statusFilter = filter;
    this.refresh();
  }

  /**
   * Filters pipeline runs based on current filter settings
   */
  private filterPipelineRuns(runs: PipelineRun[]): PipelineRun[] {
    return runs.filter((run) => {
      if (run.status === 'inProgress') {
        return this.statusFilter.inProgress;
      }
      if (run.result === 'succeeded') {
        return this.statusFilter.succeeded;
      }
      if (run.result === 'failed') {
        return this.statusFilter.failed;
      }
      if (run.result === 'canceled') {
        return this.statusFilter.canceled;
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
      // Return pipelines for this repository
      const pipelines = await this.getPipelines(element.repository);

      return pipelines.map(
        (pipeline) =>
          new PipelineItem(pipeline, element.repository, vscode.TreeItemCollapsibleState.Collapsed),
      );
    } else if (element instanceof PipelineItem) {
      // Return pipeline runs for this pipeline
      const runsRaw = await this.getPipelineRunsForPipeline(
        element.repository,
        element.pipeline.id,
      );

      // Apply filters
      const runs = this.filterPipelineRuns(runsRaw);

      return runs.map(
        (run) =>
          new PipelineRunItem(run, element.repository, vscode.TreeItemCollapsibleState.Collapsed),
      );
    } else if (element instanceof PipelineRunItem) {
      // Return stages for this pipeline run
      const stages = await this.getStagesForRun(
        element.repository,
        element.pipelineRun.id,
        element.pipelineRun,
      );

      return stages.map((stage) => new StageItem(stage, vscode.TreeItemCollapsibleState.None));
    }

    return [];
  }

  private async getPipelines(repository: AzureDevOpsRepository): Promise<Pipeline[]> {
    try {
      const pat = await this.authService.getPersonalAccessToken();
      if (!pat) {
        return [];
      }

      const apiClient = new AzureDevOpsApiClient({
        organization: repository.organization,
        pat,
      });

      // Get repository ID if not already cached
      let repositoryId = repository.repositoryId;
      if (!repositoryId) {
        const fetchedId = await apiClient.getRepositoryId(
          repository.project,
          repository.repository,
        );
        if (!fetchedId) {
          console.error('Failed to fetch repository ID');
          return [];
        }
        // Cache the repository ID
        repositoryId = fetchedId;
        repository.repositoryId = fetchedId;
      }

      const pipelines = await apiClient.getPipelines(repository.project, repositoryId);

      return pipelines;
    } catch (error) {
      console.error('Error fetching pipelines:', error);
      return [];
    }
  }

  private async getPipelineRunsForPipeline(
    repository: AzureDevOpsRepository,
    pipelineId: number,
  ): Promise<PipelineRun[]> {
    try {
      const pat = await this.authService.getPersonalAccessToken();
      if (!pat) {
        return [];
      }

      const apiClient = new AzureDevOpsApiClient({
        organization: repository.organization,
        pat,
      });

      const runs = await apiClient.getPipelineRunsForPipeline(repository.project, pipelineId, 3);

      return runs;
    } catch (error) {
      console.error('Error fetching pipeline runs:', error);
      return [];
    }
  }

  private async getStagesForRun(
    repository: AzureDevOpsRepository,
    buildId: number,
    pipelineRun: PipelineRun,
  ): Promise<PipelineRunStage[]> {
    try {
      // Check if stages are already cached in the run object
      if (pipelineRun.stages && pipelineRun.stages.length > 0) {
        return pipelineRun.stages;
      }

      const pat = await this.authService.getPersonalAccessToken();
      if (!pat) {
        return [];
      }

      const apiClient = new AzureDevOpsApiClient({
        organization: repository.organization,
        pat,
      });

      const stages = await apiClient.getBuildTimeline(repository.project, buildId);

      // Cache the stages in the pipeline run object
      pipelineRun.stages = stages;

      return stages;
    } catch (error) {
      console.error('Error fetching pipeline run stages:', error);
      return [];
    }
  }
}
