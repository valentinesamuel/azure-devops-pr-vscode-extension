import * as vscode from 'vscode';
import { PullRequest } from './pullRequestProvider';
import { WebviewLayout } from './webview/components/WebviewLayout';

export class PrDetailsWebviewProvider {
  private static activePanels: Map<number, vscode.WebviewPanel> = new Map();

  public static createOrShow(extensionUri: vscode.Uri, pullRequest: PullRequest) {
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

    panel.webview.html = this.getWebviewContent(panel.webview, extensionUri, pullRequest);

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
  ): string {
    return WebviewLayout.render(pullRequest);
  }
}
