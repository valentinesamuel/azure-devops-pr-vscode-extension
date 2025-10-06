# How to Use the File Tree API

## 1. Fetch PR File Changes

In your `prDetailsWebview.ts`, you can fetch the file changes like this:

```typescript
// Inside PrDetailsWebviewProvider.createOrShow()
let fileChanges: PullRequestFileChange[] = [];
try {
  if (pullRequest.repository) {
    const pat = await authService.getPersonalAccessToken();
    if (pat) {
      const apiClient = new AzureDevOpsApiClient({
        organization: pullRequest.repository.organization,
        pat,
      });

      // Fetch file changes
      fileChanges = await apiClient.getPullRequestFileChanges(
        pullRequest.repository.project,
        pullRequest.repository.repository,
        pullRequest.id,
      );
    }
  }
} catch (error) {
  console.error('Failed to fetch PR file changes:', error);
}
```

## 2. Organize Files into a Tree Structure

Create a helper function to build the file tree:

```typescript
interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  changeType?: 'add' | 'edit' | 'delete' | 'rename';
  children?: FileTreeNode[];
  fileCount?: number; // For folders
}

function buildFileTree(fileChanges: PullRequestFileChange[]): FileTreeNode[] {
  const root: Map<string, FileTreeNode> = new Map();

  fileChanges.forEach((change) => {
    const pathParts = change.path.split('/').filter((p) => p !== '');
    let currentLevel = root;
    let currentPath = '';

    pathParts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isFile = index === pathParts.length - 1;

      if (!currentLevel.has(part)) {
        const node: FileTreeNode = {
          name: part,
          path: currentPath,
          type: isFile ? 'file' : 'folder',
          changeType: isFile ? change.changeType : undefined,
          children: isFile ? undefined : [],
        };
        currentLevel.set(part, node);
      }

      if (!isFile) {
        const folderNode = currentLevel.get(part)!;
        if (!folderNode.children) {
          folderNode.children = [];
        }
        // Create a map for the next level
        const nextLevelMap = new Map<string, FileTreeNode>();
        folderNode.children.forEach((child) => nextLevelMap.set(child.name, child));
        currentLevel = nextLevelMap;
      }
    });
  });

  // Convert to array and calculate file counts for folders
  function calculateFileCounts(node: FileTreeNode): number {
    if (node.type === 'file') {
      return 1;
    }
    let count = 0;
    node.children?.forEach((child) => {
      count += calculateFileCounts(child);
    });
    node.fileCount = count;
    return count;
  }

  const treeArray = Array.from(root.values());
  treeArray.forEach(calculateFileCounts);
  return treeArray;
}
```

## 3. Pass Data to Webview

Update the `getWebviewContent` method to accept file changes:

```typescript
panel.webview.html = this.getWebviewContent(
  panel.webview,
  extensionUri,
  pullRequest,
  threads,
  userProfile,
  fileChanges, // Add this
);
```

## 4. Update TabContent.ts

Modify `TabContent.renderFilesContent()` to accept and render the file tree:

```typescript
static renderFilesContent(fileTree: FileTreeNode[]): string {
  const fileCount = fileTree.reduce((sum, node) => sum + (node.fileCount || 1), 0);

  return `
    <div id="filesContent" class="tab-content hidden h-full flex gap-4">
      <div class="w-80 bg-vscode-bg rounded-lg border border-vscode-border overflow-hidden flex flex-col">
        <div class="p-4 border-b border-vscode-border">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-medium text-vscode-fg">All Changes</h3>
          </div>
          <div class="text-xs text-vscode-fg opacity-60">${fileCount} changed files</div>
        </div>

        <div class="flex-1 overflow-y-auto p-4">
          <div class="space-y-1">
            ${fileTree.map((node) => renderFileTreeNode(node)).join('')}
          </div>
        </div>
      </div>
      <!-- Right column remains the same -->
    </div>
  `;
}

function renderFileTreeNode(node: FileTreeNode, level: number = 0): string {
  if (node.type === 'folder') {
    return `
      <div class="file-tree-item">
        <button class="w-full flex items-center p-2 hover:bg-vscode-input-bg rounded text-sm text-vscode-fg opacity-60 hover:text-vscode-fg transition-colors" onclick="toggleFolder(this)">
          <svg class="w-3 h-3 mr-2 folder-chevron transition-transform" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
          </svg>
          <svg class="w-4 h-4 mr-2 text-vscode-link" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
          </svg>
          <span class="flex-1 text-left">${node.name}</span>
          <span class="text-xs bg-vscode-success opacity-30 text-vscode-success px-1.5 py-0.5 rounded">${node.fileCount || 0}</span>
        </button>
        <div class="folder-content hidden ml-5">
          ${node.children?.map((child) => renderFileTreeNode(child, level + 1)).join('') || ''}
        </div>
      </div>
    `;
  } else {
    const changeTypeColor = {
      add: 'bg-vscode-success opacity-30 text-vscode-success',
      edit: 'bg-blue-600 opacity-30 text-blue-400',
      delete: 'bg-vscode-error opacity-30 text-vscode-error',
      rename: 'bg-yellow-600 opacity-30 text-yellow-400',
    };

    return `
      <button class="w-full flex items-center p-2 hover:bg-vscode-input-bg rounded text-sm text-vscode-fg opacity-60 hover:text-vscode-fg transition-colors file-item" onclick="selectFile(this, '${node.path}')">
        <svg class="w-4 h-4 mr-2 text-vscode-fg opacity-60" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
        </svg>
        <span class="flex-1 text-left">${node.name}</span>
        ${node.changeType ? `<span class="text-xs px-1.5 py-0.5 rounded ${changeTypeColor[node.changeType] || ''}">${node.changeType[0].toUpperCase()}</span>` : ''}
      </button>
    `;
  }
}
```

## 5. Key Azure DevOps API Endpoints

1. **Get PR Iterations**:
   - `GET https://dev.azure.com/{org}/{project}/_apis/git/repositories/{repoId}/pullRequests/{prId}/iterations?api-version=7.1`

2. **Get File Changes for an Iteration**:
   - `GET https://dev.azure.com/{org}/{project}/_apis/git/repositories/{repoId}/pullRequests/{prId}/iterations/{iterationId}/changes?api-version=7.1`

3. **Get File Diff** (for showing actual changes):
   - `GET https://dev.azure.com/{org}/{project}/_apis/git/repositories/{repoId}/diffs/commits?baseVersion={baseCommitId}&targetVersion={targetCommitId}&api-version=7.1`

## Response Format

The `changeEntries` array contains:
```json
{
  "changeEntries": [
    {
      "changeType": "edit",
      "item": {
        "path": "/src/file.ts",
        "gitObjectType": "blob"
      }
    }
  ]
}
```

Change types: `add`, `edit`, `delete`, `rename`, `sourceRename`
