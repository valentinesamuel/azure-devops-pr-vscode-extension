import * as vscode from 'vscode';
import { PipelineRunLayout } from './webview/components/PipelineRunLayout';
import { AzureDevOpsApiClient, PipelineRunStage } from './services/azureDevOpsApiClient';
import { AuthService } from './services/authService';
import { AzureDevOpsRepository } from './services/gitService';
import { StageDetailsWebviewProvider } from './stageDetailsWebview';

export interface PipelineRunDetails {
  id: number;
  buildNumber: string;
  status: string;
  result?: string;
  queueTime: Date;
  startTime?: Date;
  finishTime?: Date;
  requestedFor: string;
  requestedForImageUrl?: string;
  pipelineName: string;
  sourceBranch: string;
  sourceVersion: string;
  url?: string;
  reason?: string;
  repository: AzureDevOpsRepository;
  stages?: PipelineRunStage[];
}

export class PipelineRunDetailsWebviewProvider {
  private static activePanels: Map<number, vscode.WebviewPanel> = new Map();

  public static async createOrShow(
    extensionUri: vscode.Uri,
    pipelineRun: PipelineRunDetails,
    authService: AuthService,
  ): Promise<void> {
    // Check if a panel for this run already exists
    const existingPanel = this.activePanels.get(pipelineRun.id);
    if (existingPanel) {
      existingPanel.reveal();
      return;
    }

    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    const panel = vscode.window.createWebviewPanel(
      'pipelineRunDetails',
      `#${pipelineRun.buildNumber} - ${pipelineRun.pipelineName}`,
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
      },
    );

    // Store the panel
    this.activePanels.set(pipelineRun.id, panel);

    panel.onDidDispose(() => {
      this.activePanels.delete(pipelineRun.id);
    });

    // Fetch stages from Azure DevOps if not already loaded
    let stages: PipelineRunStage[] = [];
    try {
      const pat = await authService.getPersonalAccessToken();
      if (pat && pipelineRun.repository) {
        const apiClient = new AzureDevOpsApiClient({
          organization: pipelineRun.repository.organization,
          pat,
        });

        stages = await apiClient.getBuildTimeline(pipelineRun.repository.project, pipelineRun.id);
      }
    } catch (error) {
      console.error('Failed to fetch pipeline run stages:', error);
      vscode.window.showWarningMessage(
        `Failed to load stages for run #${pipelineRun.buildNumber}. Using dummy data.`,
      );
    }

    panel.webview.html = this.getWebviewContent(panel.webview, extensionUri, pipelineRun, stages);

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'openInBrowser':
            if (pipelineRun.url) {
              vscode.env.openExternal(vscode.Uri.parse(pipelineRun.url));
            }
            break;
          case 'openStageDetails':
            const stage = stages.find((s) => s.id === message.stageId);
            if (stage && pipelineRun.repository) {
              await StageDetailsWebviewProvider.createOrShow(
                extensionUri,
                pipelineRun.pipelineName,
                pipelineRun.buildNumber,
                pipelineRun.id,
                pipelineRun.repository.project,
                pipelineRun.repository,
                stage,
                authService,
              );
            }
            break;
        }
      },
      undefined,
      [],
    );
  }

  private static getWebviewContent(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    pipelineRun: PipelineRunDetails,
    stages: PipelineRunStage[],
  ): string {
    return PipelineRunLayout.render(pipelineRun, stages);
  }
}
