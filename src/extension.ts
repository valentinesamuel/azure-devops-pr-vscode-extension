// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { PullRequestProvider, PullRequest } from './pullRequestProvider';
import { PrDetailsWebviewProvider } from './prDetailsWebview';
import { AuthService } from './services/authService';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "azure-devops-pr" is now active!');

  // Initialize authentication service
  const authService = new AuthService(context);

  // Log user profile if authenticated
  await logUserProfile(authService);

  // Create and register the pull request tree data provider
  const pullRequestProvider = new PullRequestProvider(authService);
  vscode.window.registerTreeDataProvider('pullRequests', pullRequestProvider);

  // Register sign-in command
  const signInCommand = vscode.commands.registerCommand('azureDevOpsPr.signIn', async () => {
    const success = await authService.promptForCredentials();
    if (success) {
      // Refresh the tree view to show pull requests
      pullRequestProvider.refresh();
    }
  });

  // Register sign-out command
  const signOutCommand = vscode.commands.registerCommand('azureDevOpsPr.signOut', async () => {
    await authService.signOut();
    // Refresh the tree view to show sign-in prompt
    pullRequestProvider.refresh();
  });

  // Register refresh command for pull requests
  const refreshCommand = vscode.commands.registerCommand(
    'azureDevOpsPr.refreshPullRequests',
    () => {
      pullRequestProvider.refresh();
    },
  );

  // Register filter command for pull requests
  const filterCommand = vscode.commands.registerCommand(
    'azureDevOpsPr.filterPullRequests',
    async () => {
      const currentFilter = pullRequestProvider.getFilter();

      // Create quick pick items with checkboxes
      const items: vscode.QuickPickItem[] = [
        {
          label: '$(check) Active PRs',
          picked: currentFilter.active,
          description: 'Show active pull requests (non-draft)',
        },
        {
          label: '$(check) Draft PRs',
          picked: currentFilter.draft,
          description: 'Show draft pull requests',
        },
        {
          label: '$(check) Completed PRs',
          picked: currentFilter.completed,
          description: 'Show completed pull requests',
        },
        {
          label: '$(check) Abandoned PRs',
          picked: currentFilter.abandoned,
          description: 'Show abandoned pull requests',
        },
      ];

      const result = await vscode.window.showQuickPick(items, {
        canPickMany: true,
        title: 'Filter Pull Requests',
        placeHolder: 'Select which PR types to show',
      });

      if (result) {
        // Update filter based on selected items
        const newFilter = {
          active: result.some((item) => item.label.includes('Active PRs')),
          draft: result.some((item) => item.label.includes('Draft PRs')),
          completed: result.some((item) => item.label.includes('Completed PRs')),
          abandoned: result.some((item) => item.label.includes('Abandoned PRs')),
        };

        pullRequestProvider.setFilter(newFilter);
      }
    },
  );

  // Register command to open PR details
  const openPrDetailsCommand = vscode.commands.registerCommand(
    'azureDevOpsPr.openPrDetails',
    (pullRequest: PullRequest) => {
      PrDetailsWebviewProvider.createOrShow(context.extensionUri, pullRequest);
    },
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand('azureDevOpsPr.helloWorld', () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage('Hello World from Azure DevOps PR!');

    var panel = vscode.window.createWebviewPanel(
      'azureDevOpsPr',
      'Azure DevOps PR',
      vscode.ViewColumn.One,
      { enableScripts: true },
    );
    panel.webview.html = getWebViewContent();

    panel.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case 'alert':
          vscode.window.showInformationMessage(message.text);
      }
    });
  });

  context.subscriptions.push(
    disposable,
    signInCommand,
    signOutCommand,
    refreshCommand,
    filterCommand,
    openPrDetailsCommand,
  );
}

/**
 * Logs the user profile information if the user is authenticated
 */
async function logUserProfile(authService: AuthService) {
  try {
    const isAuthenticated = await authService.isAuthenticated();

    if (isAuthenticated) {
      const userProfileService = authService.getUserProfileService();
      const profile = userProfileService.getStoredProfile();

      if (profile) {
        console.log('═══════════════════════════════════════════════════');
        console.log('🔐 Azure DevOps User Profile');
        console.log('═══════════════════════════════════════════════════');
        console.table({
          'Display Name': profile.displayName,
          'Email Address': profile.emailAddress,
          'Public Alias': profile.publicAlias,
          'User ID': profile.id,
        });
        console.log('═══════════════════════════════════════════════════');
      } else {
        console.log('⚠️  User is authenticated but profile not found in storage');
      }
    } else {
      console.log('ℹ️  User is not authenticated. Use "Sign In to Azure DevOps" to login.');
    }
  } catch (error) {
    console.error('Error logging user profile:', error);
  }
}

function getWebViewContent() {
  return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<title>Azure Devops PR</title>
			<script>
				const vscode = acquireVsCodeApi(); // acquireVsCodeApi can only be invoked once
				document.addEventListener('DOMContentLoaded', function() {
				
				const p1 = document.getElementById('p1')
					p1.style.color = 'blue'
					vscode.postMessage({ message: 'hello!' });
					console.log('Message posted')
				
					})

			</script>
		</head>
		<body>

			<h1>PR 2323</h1>
			<p id='p1'>This would be a page where you would be the PR by ID</h1>

     <input
      type="button"
      value="Call extension.ts"
      onclick="vscode.postMessage({command:'alert', text:'Hello from the webview'});"
    />
		</body>
		</html>
	`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
