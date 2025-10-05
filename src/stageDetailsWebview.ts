import * as vscode from 'vscode';
import {
  StageDetailsLayout,
  StageDetailsData,
  StageJob,
  StageTask,
} from './webview/components/StageDetailsLayout';
import { PipelineRunStage, AzureDevOpsApiClient } from './services/azureDevOpsApiClient';
import { AuthService } from './services/authService';
import { AzureDevOpsRepository } from './services/gitService';

export class StageDetailsWebviewProvider {
  private static activePanels: Map<string, vscode.WebviewPanel> = new Map();

  public static async createOrShow(
    extensionUri: vscode.Uri,
    pipelineName: string,
    buildNumber: string,
    buildId: number,
    project: string,
    repository: AzureDevOpsRepository,
    stage: PipelineRunStage,
    authService: AuthService,
  ) {
    const panelId = `${buildNumber}-${stage.id}`;
    const existingPanel = this.activePanels.get(panelId);

    if (existingPanel) {
      existingPanel.reveal();
      return;
    }

    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    const panel = vscode.window.createWebviewPanel(
      'stageDetails',
      `${stage.name} - ${pipelineName}`,
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
      },
    );

    this.activePanels.set(panelId, panel);

    panel.onDidDispose(() => {
      this.activePanels.delete(panelId);
    });

    // Show loading state initially
    const loadingData: StageDetailsData = {
      pipelineName,
      buildNumber,
      buildId,
      project,
      stage,
      jobs: [],
      isLoading: true,
    };

    panel.webview.html = StageDetailsLayout.render(loadingData);

    // Fetch real data from Azure DevOps API
    try {
      console.log('=== Stage Details Debug ===');
      console.log('Pipeline:', pipelineName);
      console.log('Build Number:', buildNumber);
      console.log('Build ID:', buildId);
      console.log('Project:', project);
      console.log('Organization:', repository.organization);
      console.log('Stage ID:', stage.id);
      console.log('Stage Name:', stage.name);

      const pat = await authService.getPersonalAccessToken();
      if (!pat) {
        vscode.window.showErrorMessage('Not authenticated. Please sign in to Azure DevOps.');
        return;
      }

      const apiClient = new AzureDevOpsApiClient({
        organization: repository.organization,
        pat,
      });

      // Fetch jobs for this stage
      console.log(
        `Calling getStageJobs with project="${project}", buildId=${buildId}, stageId="${stage.id}"`,
      );
      const jobs = await apiClient.getStageJobs(project, buildId, stage.id);
      console.log(`Fetched ${jobs.length} jobs for stage ${stage.name}:`, jobs);

      // Fetch tasks for each job
      const jobsWithTasks: StageJob[] = await Promise.all(
        jobs.map(async (job) => {
          const tasks = await apiClient.getJobTasks(project, buildId, job.id);
          console.log(`Fetched ${tasks.length} tasks for job ${job.name}:`, tasks);

          // Fetch logs for all tasks
          const tasksWithLogs: StageTask[] = await Promise.all(
            tasks.map(async (task) => {
              if (task.logId) {
                console.log(`Fetching logs for task ${task.name}, logId: ${task.logId}`);
                const logs = await apiClient.getTaskLogs(project, buildId, task.logId);
                console.log(`Fetched ${logs.length} log lines for task ${task.name}`);
                return { ...task, logs };
              }
              return { ...task, logs: [] };
            }),
          );

          return { ...job, tasks: tasksWithLogs };
        }),
      );

      console.log(`Final jobsWithTasks:`, jobsWithTasks);

      // Update webview with real data
      const stageData: StageDetailsData = {
        pipelineName,
        buildNumber,
        buildId,
        project,
        stage,
        jobs: jobsWithTasks,
        isLoading: false,
      };

      panel.webview.html = StageDetailsLayout.render(stageData);
    } catch (error) {
      console.error('Failed to fetch stage details:', error);
      vscode.window.showErrorMessage(
        `Failed to load stage details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      // Show error state
      const errorData: StageDetailsData = {
        pipelineName,
        buildNumber,
        buildId,
        project,
        stage,
        jobs: [],
        isLoading: false,
      };

      panel.webview.html = StageDetailsLayout.render(errorData);
    }

    // Handle messages from webview
    panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'goBack':
            panel.dispose();
            break;
          case 'selectTask':
            // Handle task selection - could fetch logs on demand here
            console.log('Task selected:', message.taskId, 'in job:', message.jobId);
            break;
        }
      },
      undefined,
      [],
    );
  }
}
