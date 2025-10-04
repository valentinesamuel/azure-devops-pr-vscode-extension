import * as vscode from 'vscode';
import { PullRequest } from './pullRequestProvider';
import { WebviewLayout } from './webview/components/WebviewLayout';
import {
  AzureDevOpsApiClient,
  CommentThread,
  AzureDevOpsProfile,
} from './services/azureDevOpsApiClient';
import { AuthService } from './services/authService';

export class PrDetailsWebviewProvider {
  private static activePanels: Map<number, vscode.WebviewPanel> = new Map();

  public static async createOrShow(
    extensionUri: vscode.Uri,
    pullRequest: PullRequest,
    authService: AuthService,
  ) {
    // Check if a panel for this PR already exists
    const existingPanel = this.activePanels.get(pullRequest.id);
    if (existingPanel) {
      // Panel exists, just reveal it
      existingPanel.reveal();
      return;
    }

    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    const panel = vscode.window.createWebviewPanel(
      'prDetails',
      `PR #${pullRequest.id}: ${pullRequest.title}`,
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
      },
    );

    // Store the panel in our map
    this.activePanels.set(pullRequest.id, panel);

    // Remove from map when panel is disposed
    panel.onDidDispose(() => {
      this.activePanels.delete(pullRequest.id);
    });

    // Fetch threads from Azure DevOps
    let threads: CommentThread[] = [];
    let userProfile = authService.getUserProfileService().getStoredProfile();
    try {
      if (pullRequest.repository) {
        const pat = await authService.getPersonalAccessToken();
        if (pat) {
          const apiClient = new AzureDevOpsApiClient({
            organization: pullRequest.repository.organization,
            pat,
          });

          threads = await apiClient.getPullRequestThreads(
            pullRequest.repository.project,
            pullRequest.repository.repository,
            pullRequest.id,
          );

          // Add a synthetic "PR created" thread since Azure DevOps doesn't always include it in threads
          // Get the current user profile to see if they are the creator
          const currentProfile = userProfile;
          const isCurrentUser = currentProfile?.emailAddress === pullRequest.author;

          // For the creator name, use the stored profile if it's the current user, otherwise extract from email
          const creatorDisplayName = isCurrentUser
            ? currentProfile?.displayName || pullRequest.author.split('@')[0]
            : pullRequest.author.split('@')[0];

          const prCreatedThread: CommentThread = {
            id: -1, // Negative ID to indicate synthetic
            publishedDate: pullRequest.createdDate.toISOString(),
            comments: [
              {
                id: -1,
                author: {
                  displayName: creatorDisplayName,
                  id: 'creator',
                  uniqueName: pullRequest.author,
                },
                content: `${creatorDisplayName} created the pull request`,
                publishedDate: pullRequest.createdDate.toISOString(),
                commentType: 'system',
              },
            ],
            properties: {
              CodeReviewThreadType: {
                $value: 'PullRequestCreated',
              },
            },
          };

          threads.push(prCreatedThread);
        }
      }
    } catch (error) {
      console.error('Failed to fetch PR threads:', error);
      vscode.window.showWarningMessage(
        `Failed to load comments for PR #${pullRequest.id}. Using dummy data.`,
      );
    }

    panel.webview.html = this.getWebviewContent(
      panel.webview,
      extensionUri,
      pullRequest,
      threads,
      userProfile,
    );

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case 'openInBrowser':
            vscode.env.openExternal(
              vscode.Uri.parse(
                `https://dev.azure.com/your-org/your-project/_git/your-repo/pullrequest/${message.prId}`,
              ),
            );
            break;
          case 'checkoutBranch':
            vscode.window.showInformationMessage(`Checking out branch: ${message.branch}`);
            // In a real implementation, you would use git commands here
            break;
          case 'skipCheck':
            vscode.window.showInformationMessage(`Skipped check: ${message.checkName}`);
            // In a real implementation, you would skip the check in Azure DevOps
            break;
          case 'retryCheck':
            vscode.window.showInformationMessage(`Retrying check: ${message.checkName}`);
            // In a real implementation, you would retry the check in Azure DevOps
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
    pullRequest: PullRequest,
    threads: CommentThread[],
    userProfile?: AzureDevOpsProfile,
  ): string {
    return WebviewLayout.render(pullRequest, threads, userProfile);
  }
}
