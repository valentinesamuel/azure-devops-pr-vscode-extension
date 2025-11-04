// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "azure-devops-pr" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand('azure-devops-pr.helloWorld', () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage('Hello World from Azure DevOps PR!');

    var panel = vscode.window.createWebviewPanel(
      'azure-devops-pr',
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

  context.subscriptions.push(disposable);

  // Register the Create Pull Request command
  const createPRDisposable = vscode.commands.registerCommand(
    'azure-devops-pr.createPullRequest',
    () => {
      const panel = vscode.window.createWebviewPanel(
        'azureDevOpsCreatePR',
        'Create Pull Request',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        },
      );

      panel.webview.html = getCreatePRWebViewContent();

      // Handle messages from the webview
      panel.webview.onDidReceiveMessage((message) => {
        switch (message.command) {
          case 'createPR':
            vscode.window.showInformationMessage(
              `Creating PR: "${message.data.title}" from ${message.data.sourceBranch} to ${message.data.targetBranch}`,
            );
            break;
          case 'cancel':
            panel.dispose();
            break;
        }
      });
    },
  );

  context.subscriptions.push(createPRDisposable);
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

function getCreatePRWebViewContent() {
  // Dummy data for branches, reviewers, and work items
  const dummyData = {
    branches: ['main', 'develop', 'feature/new-feature', 'bugfix/fix-123', 'release/v1.0.0'],
    currentBranch: 'feature/new-feature',
    reviewers: [
      { id: 1, name: 'John Doe', email: 'john.doe@company.com', avatar: 'JD' },
      { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com', avatar: 'JS' },
      { id: 3, name: 'Mike Johnson', email: 'mike.j@company.com', avatar: 'MJ' },
      { id: 4, name: 'Sarah Williams', email: 'sarah.w@company.com', avatar: 'SW' },
      { id: 5, name: 'Alex Chen', email: 'alex.c@company.com', avatar: 'AC' },
    ],
    workItems: [
      { id: 1234, title: 'Implement user authentication', type: 'User Story' },
      { id: 1235, title: 'Fix login page styling', type: 'Bug' },
      { id: 1236, title: 'Add password reset feature', type: 'Feature' },
      { id: 1237, title: 'Update API documentation', type: 'Task' },
    ],
    tags: ['frontend', 'backend', 'ui', 'api', 'bugfix', 'feature', 'hotfix'],
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Create Pull Request</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      padding: 20px;
      line-height: 1.6;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }

    .header h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--vscode-foreground);
    }

    .header p {
      color: var(--vscode-descriptionForeground);
      font-size: 14px;
    }

    .form-section {
      margin-bottom: 24px;
      padding: 20px;
      background-color: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
    }

    .form-section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--vscode-foreground);
      display: flex;
      align-items: center;
    }

    .form-section-title::before {
      content: '';
      width: 4px;
      height: 18px;
      background-color: var(--vscode-textLink-foreground);
      margin-right: 8px;
      border-radius: 2px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      font-size: 14px;
      color: var(--vscode-foreground);
    }

    .required::after {
      content: '*';
      color: #e81123;
      margin-left: 4px;
    }

    input[type="text"],
    textarea,
    select {
      width: 100%;
      padding: 8px 12px;
      background-color: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 2px;
      font-size: 14px;
      font-family: inherit;
    }

    input[type="text"]:focus,
    textarea:focus,
    select:focus {
      outline: none;
      border-color: var(--vscode-focusBorder);
    }

    textarea {
      resize: vertical;
      min-height: 120px;
    }

    .branch-selector {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background-color: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      margin-bottom: 20px;
    }

    .branch-item {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .branch-label {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 4px;
    }

    .branch-icon {
      margin-right: 8px;
      color: var(--vscode-textLink-foreground);
    }

    .arrow {
      font-size: 24px;
      color: var(--vscode-descriptionForeground);
    }

    .reviewer-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .reviewer-item {
      display: flex;
      align-items: center;
      padding: 6px 12px;
      background-color: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border-radius: 16px;
      font-size: 13px;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s;
    }

    .reviewer-item:hover {
      border-color: var(--vscode-focusBorder);
    }

    .reviewer-item.selected {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: var(--vscode-textLink-foreground);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 600;
      margin-right: 8px;
    }

    .work-item-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }

    .work-item {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      background-color: var(--vscode-list-hoverBackground);
      border-radius: 4px;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s;
    }

    .work-item:hover {
      border-color: var(--vscode-focusBorder);
    }

    .work-item.selected {
      background-color: var(--vscode-list-activeSelectionBackground);
      border-color: var(--vscode-focusBorder);
    }

    .work-item-checkbox {
      margin-right: 12px;
      cursor: pointer;
    }

    .work-item-info {
      flex: 1;
    }

    .work-item-id {
      font-weight: 600;
      color: var(--vscode-textLink-foreground);
      margin-right: 8px;
    }

    .work-item-type {
      display: inline-block;
      padding: 2px 8px;
      background-color: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border-radius: 3px;
      font-size: 11px;
      margin-left: 8px;
    }

    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .tag-item {
      padding: 4px 12px;
      background-color: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border-radius: 12px;
      font-size: 12px;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s;
    }

    .tag-item:hover {
      border-color: var(--vscode-focusBorder);
    }

    .tag-item.selected {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .button-group {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--vscode-panel-border);
    }

    button {
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 500;
      border: none;
      border-radius: 2px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .btn-primary:hover {
      background-color: var(--vscode-button-hoverBackground);
    }

    .btn-secondary {
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    .btn-secondary:hover {
      background-color: var(--vscode-button-secondaryHoverBackground);
    }

    .info-box {
      padding: 12px;
      background-color: var(--vscode-textBlockQuote-background);
      border-left: 4px solid var(--vscode-textLink-foreground);
      border-radius: 4px;
      font-size: 13px;
      margin-bottom: 20px;
    }

    .checkbox-group {
      margin-top: 16px;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }

    .checkbox-item input[type="checkbox"] {
      margin-right: 8px;
      cursor: pointer;
    }

    .checkbox-item label {
      margin-bottom: 0;
      font-weight: normal;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Create Pull Request</h1>
      <p>Propose changes to be merged from one branch into another</p>
    </div>

    <div class="info-box">
      📝 This is a preview with dummy data. Integration with Azure DevOps will be added in the next phase.
    </div>

    <!-- Branch Selection -->
    <div class="form-section">
      <div class="form-section-title">Branch Selection</div>
      <div class="branch-selector">
        <div class="branch-item">
          <span class="branch-label">Source Branch</span>
          <select id="sourceBranch">
            ${dummyData.branches
              .map(
                (branch) =>
                  `<option value="${branch}" ${branch === dummyData.currentBranch ? 'selected' : ''}>${branch}</option>`,
              )
              .join('')}
          </select>
        </div>
        <div class="arrow">→</div>
        <div class="branch-item">
          <span class="branch-label">Target Branch</span>
          <select id="targetBranch">
            ${dummyData.branches
              .map(
                (branch) =>
                  `<option value="${branch}" ${branch === 'main' ? 'selected' : ''}>${branch}</option>`,
              )
              .join('')}
          </select>
        </div>
      </div>
    </div>

    <!-- PR Details -->
    <div class="form-section">
      <div class="form-section-title">Pull Request Details</div>

      <div class="form-group">
        <label class="required" for="prTitle">Title</label>
        <input
          type="text"
          id="prTitle"
          placeholder="Enter a descriptive title for your pull request"
          value="Add new authentication feature"
        />
      </div>

      <div class="form-group">
        <label for="prDescription">Description</label>
        <textarea
          id="prDescription"
          placeholder="Describe the changes in this pull request..."
        >## Summary
This PR implements the new authentication feature requested in #1234.

## Changes
- Added JWT token authentication
- Implemented login/logout endpoints
- Added password hashing with bcrypt
- Updated API documentation

## Testing
- Unit tests added for auth service
- Integration tests for login flow
- Manual testing completed on dev environment

## Related Work Items
- Closes #1234</textarea>
      </div>
    </div>

    <!-- Reviewers -->
    <div class="form-section">
      <div class="form-section-title">Reviewers</div>
      <p style="font-size: 13px; color: var(--vscode-descriptionForeground); margin-bottom: 12px;">
        Select team members to review this pull request
      </p>
      <div class="reviewer-list">
        ${dummyData.reviewers
          .map(
            (reviewer) => `
          <div class="reviewer-item" data-id="${reviewer.id}" onclick="toggleReviewer(this)">
            <div class="avatar">${reviewer.avatar}</div>
            <span>${reviewer.name}</span>
          </div>
        `,
          )
          .join('')}
      </div>
    </div>

    <!-- Work Items -->
    <div class="form-section">
      <div class="form-section-title">Link Work Items</div>
      <p style="font-size: 13px; color: var(--vscode-descriptionForeground); margin-bottom: 12px;">
        Associate this pull request with work items
      </p>
      <div class="work-item-list">
        ${dummyData.workItems
          .map(
            (item) => `
          <div class="work-item" onclick="toggleWorkItem(this)">
            <input type="checkbox" class="work-item-checkbox" />
            <div class="work-item-info">
              <span class="work-item-id">#${item.id}</span>
              <span>${item.title}</span>
              <span class="work-item-type">${item.type}</span>
            </div>
          </div>
        `,
          )
          .join('')}
      </div>
    </div>

    <!-- Tags -->
    <div class="form-section">
      <div class="form-section-title">Tags</div>
      <p style="font-size: 13px; color: var(--vscode-descriptionForeground); margin-bottom: 12px;">
        Add tags to categorize this pull request
      </p>
      <div class="tag-list">
        ${dummyData.tags
          .map(
            (tag) => `
          <div class="tag-item" onclick="toggleTag(this)">${tag}</div>
        `,
          )
          .join('')}
      </div>
    </div>

    <!-- Options -->
    <div class="form-section">
      <div class="form-section-title">Options</div>
      <div class="checkbox-group">
        <div class="checkbox-item">
          <input type="checkbox" id="autoComplete" checked />
          <label for="autoComplete">Complete automatically after all policies are met</label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="deleteSource" />
          <label for="deleteSource">Delete source branch after merge</label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="squashMerge" />
          <label for="squashMerge">Squash changes when merging</label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="draft" />
          <label for="draft">Create as draft</label>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="button-group">
      <button class="btn-primary" onclick="createPullRequest()">Create Pull Request</button>
      <button class="btn-secondary" onclick="cancel()">Cancel</button>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function toggleReviewer(element) {
      element.classList.toggle('selected');
    }

    function toggleWorkItem(element) {
      element.classList.toggle('selected');
      const checkbox = element.querySelector('.work-item-checkbox');
      checkbox.checked = !checkbox.checked;
    }

    function toggleTag(element) {
      element.classList.toggle('selected');
    }

    function createPullRequest() {
      const sourceBranch = document.getElementById('sourceBranch').value;
      const targetBranch = document.getElementById('targetBranch').value;
      const title = document.getElementById('prTitle').value;
      const description = document.getElementById('prDescription').value;

      // Get selected reviewers
      const selectedReviewers = Array.from(document.querySelectorAll('.reviewer-item.selected'))
        .map(el => el.dataset.id);

      // Get selected work items
      const selectedWorkItems = Array.from(document.querySelectorAll('.work-item.selected'))
        .map(el => el.querySelector('.work-item-id').textContent);

      // Get selected tags
      const selectedTags = Array.from(document.querySelectorAll('.tag-item.selected'))
        .map(el => el.textContent);

      // Get options
      const options = {
        autoComplete: document.getElementById('autoComplete').checked,
        deleteSource: document.getElementById('deleteSource').checked,
        squashMerge: document.getElementById('squashMerge').checked,
        draft: document.getElementById('draft').checked,
      };

      const prData = {
        sourceBranch,
        targetBranch,
        title,
        description,
        reviewers: selectedReviewers,
        workItems: selectedWorkItems,
        tags: selectedTags,
        options,
      };

      vscode.postMessage({
        command: 'createPR',
        data: prData,
      });
    }

    function cancel() {
      vscode.postMessage({
        command: 'cancel',
      });
    }
  </script>
</body>
</html>
  `;
}

// This method is called when your extension is deactivated
export function deactivate() {}
