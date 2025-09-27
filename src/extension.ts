// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { PullRequestProvider, PullRequest } from './pullRequestProvider';
import { PrDetailsWebviewProvider } from './prDetailsWebview';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "azure-devops-pr" is now active!');

  // Create and register the pull request tree data provider
  const pullRequestProvider = new PullRequestProvider();
  vscode.window.registerTreeDataProvider('pullRequests', pullRequestProvider);

  // Register refresh command for pull requests
  const refreshCommand = vscode.commands.registerCommand(
    'azureDevOpsPr.refreshPullRequests',
    () => {
      pullRequestProvider.refresh();
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

  context.subscriptions.push(disposable, refreshCommand, openPrDetailsCommand);
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
