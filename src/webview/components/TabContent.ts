import { PullRequestFileChange } from '../../services/azureDevOpsApiClient';

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  changeType?: 'add' | 'edit' | 'delete' | 'rename';
  children?: FileTreeNode[];
  fileCount?: number;
}

export class TabContent {
  private static buildFileTree(fileChanges: PullRequestFileChange[]): FileTreeNode[] {
    const root: FileTreeNode = {
      name: '',
      path: '',
      type: 'folder',
      children: [],
    };

    fileChanges.forEach((change) => {
      const pathParts = change.path.split('/').filter((p) => p !== '' && p !== '.');
      let currentNode = root;

      pathParts.forEach((part, index) => {
        const isFile = index === pathParts.length - 1;

        // Find or create the child node
        let childNode = currentNode.children?.find((child) => child.name === part);

        if (!childNode) {
          const fullPath = pathParts.slice(0, index + 1).join('/');
          childNode = {
            name: part,
            path: fullPath,
            type: isFile ? 'file' : 'folder',
            changeType: isFile ? change.changeType : undefined,
            children: isFile ? undefined : [],
          };
          currentNode.children!.push(childNode);
        }

        // Move to the next level if it's a folder
        if (!isFile) {
          currentNode = childNode;
        }
      });
    });

    // Calculate file counts for folders
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

    calculateFileCounts(root);

    console.log('Root node children:', root.children);
    return root.children || [];
  }

  private static renderFileTreeNode(node: FileTreeNode): string {
    if (node.type === 'folder') {
      return `
        <div class="file-tree-item">
          <button class="w-full flex items-center px-2 py-1.5 hover:bg-vscode-list-hover-bg rounded text-sm transition-colors folder-item" onclick="toggleFolder(this)">
            <svg class="w-3 h-3 mr-2 folder-chevron transition-transform text-vscode-fg" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
            <svg class="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
            </svg>
            <span class="flex-1 text-left font-medium text-vscode-fg">${node.name}</span>
          </button>
          <div class="folder-content hidden ml-5">
            ${node.children?.map((child) => this.renderFileTreeNode(child)).join('') || ''}
          </div>
        </div>
      `;
    } else {
      const changeTypeStyles: Record<string, string> = {
        add: 'bg-green-500 bg-opacity-20 text-green-300 border border-green-500 border-opacity-30',
        edit: 'bg-blue-500 bg-opacity-20 text-blue-300 border border-blue-500 border-opacity-30',
        delete: 'bg-red-500 bg-opacity-20 text-red-300 border border-red-500 border-opacity-30',
        rename:
          'bg-yellow-500 bg-opacity-20 text-yellow-300 border border-yellow-500 border-opacity-30',
      };

      const changeTypeLabel: Record<string, string> = {
        add: 'A',
        edit: 'M',
        delete: 'D',
        rename: 'R',
      };

      return `
        <button class="w-full flex items-center px-2 py-1.5 hover:bg-vscode-list-hover-bg rounded text-sm transition-colors file-item group" onclick="selectFile(this, '${node.path}')">
          <svg class="w-4 h-4 mr-2 text-vscode-fg opacity-70 group-hover:opacity-100" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
          </svg>
          <span class="flex-1 text-left text-vscode-fg">${node.name}</span>
          ${node.changeType ? `<span class="text-xs px-2 py-0.5 rounded font-semibold ${changeTypeStyles[node.changeType] || ''}">${changeTypeLabel[node.changeType] || node.changeType[0].toUpperCase()}</span>` : ''}
        </button>
      `;
    }
  }

  static renderFilesContent(fileChanges: PullRequestFileChange[]): string {
    console.log('TabContent.renderFilesContent called with:', {
      fileChangesCount: fileChanges.length,
      fileChanges: fileChanges,
    });
    const fileTree = this.buildFileTree(fileChanges);
    console.log('Built file tree:', {
      treeNodeCount: fileTree.length,
      fileTree: fileTree,
    });
    const fileCount = fileChanges.length;
    return `
      <div id="filesContent" class="tab-content hidden h-full flex gap-4">
        <!-- Left Column - File Tree -->
        <div class="w-80 bg-vscode-bg rounded-lg border border-vscode-border overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="p-4 border-b border-vscode-border">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-medium text-vscode-fg">All Changes</h3>
            </div>
            <div class="text-xs text-vscode-fg opacity-60">${fileCount} changed file${fileCount !== 1 ? 's' : ''}</div>
          </div>

          <!-- File Tree -->
          <div class="flex-1 overflow-y-auto p-4">
            ${
              fileTree.length > 0
                ? `<div class="space-y-1">
              ${fileTree.map((node) => this.renderFileTreeNode(node)).join('')}
            </div>`
                : `<div class="text-center text-vscode-fg opacity-60 py-8">
              <p class="text-sm">No files changed</p>
            </div>`
            }
          </div>
        </div>

        <!-- Right Column - File Diff Content -->
        <div class="flex-1 bg-vscode-bg rounded-lg border border-vscode-border overflow-hidden flex flex-col">
          <div id="fileDiffContent" class="h-full">
            <!-- Empty State -->
            <div id="emptyState" class="h-full flex items-center justify-center text-vscode-fg opacity-60">
              <div class="text-center">
                <svg class="w-16 h-16 mx-auto mb-4 text-vscode-border" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
                </svg>
                <p class="text-sm">Select a file or folder to view details</p>
              </div>
            </div>

            <!-- Folder View (Initially Hidden) -->
            <div id="folderView" class="h-full flex-col hidden">
              <!-- Folder Header -->
              <div class="p-4 border-b border-vscode-border bg-vscode-input-bg">
                <div class="flex items-center space-x-3">
                  <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                  </svg>
                  <span id="folderName" class="text-sm font-medium text-vscode-fg"></span>
                  <span id="folderFileCount" class="text-xs text-vscode-fg opacity-60"></span>
                </div>
              </div>

              <!-- Folder Files List -->
              <div class="flex-1 overflow-y-auto p-4">
                <div id="folderFilesList" class="space-y-2">
                  <!-- Files will be populated here -->
                </div>
              </div>
            </div>

            <!-- File Diff View (Initially Hidden) -->
            <div id="diffView" class="h-full flex flex-col hidden">
              <!-- File Header -->
              <div class="p-4 border-b border-vscode-border bg-vscode-input-bg opacity-30">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <span id="fileName" class="text-sm font-medium text-vscode-fg">account-me-ci.yml</span>
                    <span class="text-xs text-vscode-fg opacity-60 bg-vscode-bg px-2 py-1 rounded">+7</span>
                  </div>
                  <button class="text-vscode-link text-sm hover:underline">View</button>
                </div>
              </div>

              <!-- Diff Content -->
              <div class="flex-1 overflow-y-auto">
                <div class="font-mono text-xs">
                  <!-- Sample diff content -->
                  <div class="diff-line flex">
                    <span class="w-12 text-right px-2 bg-vscode-input-bg opacity-50 text-vscode-fg opacity-60 select-none">74</span>
                    <span class="w-12 text-right px-2 bg-vscode-input-bg opacity-50 text-vscode-fg opacity-60 select-none">74</span>
                    <span class="flex-1 px-4 py-1">          --build-arg REDIS_PASSWORD=\${REDIS_PASSWORD} \\</span>
                  </div>
                  <div class="diff-line flex bg-vscode-error opacity-20">
                    <span class="w-12 text-right px-2 bg-vscode-error opacity-30 text-vscode-fg opacity-60 select-none">75</span>
                    <span class="w-12 text-right px-2 bg-vscode-error opacity-30 text-vscode-fg opacity-60 select-none"></span>
                    <span class="flex-1 px-4 py-1 bg-vscode-error opacity-20">          --build-arg REDIS_METAFLOW_CACHE_EXPIRE=\${REDIS_METAFLOW_CACHE_EXPIRE} \\</span>
                  </div>
                  <div class="diff-line flex bg-vscode-success opacity-20">
                    <span class="w-12 text-right px-2 bg-vscode-success opacity-30 text-vscode-fg opacity-60 select-none"></span>
                    <span class="w-12 text-right px-2 bg-vscode-success opacity-30 text-vscode-fg opacity-60 select-none">75</span>
                    <span class="flex-1 px-4 py-1 bg-vscode-success opacity-20">          --build-arg REDIS_METAFLOW_CACHE_EXPIRE=\${REDIS_METAFLOW_CACHE_EXPIRE} \\</span>
                  </div>
                  <div class="diff-line flex">
                    <span class="w-12 text-right px-2 bg-vscode-input-bg opacity-50 text-vscode-fg opacity-60 select-none">76</span>
                    <span class="w-12 text-right px-2 bg-vscode-input-bg opacity-50 text-vscode-fg opacity-60 select-none">76</span>
                    <span class="flex-1 px-4 py-1">          --build-arg SENTRY_DSN=\${SENTRY_DSN} \\</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  static renderUpdatesContent(): string {
    return `
      <div id="updatesContent" class="tab-content bg-vscode-bg rounded-lg border border-vscode-border content-card p-8 hidden">
        <h3 class="text-lg font-medium text-vscode-fg mb-4">Updates</h3>
        <p class="text-vscode-fg opacity-60">Updates content would go here...</p>
      </div>`;
  }

  static renderCommitsContent(): string {
    return `
      <div id="commitsContent" class="tab-content bg-vscode-bg rounded-lg border border-vscode-border content-card p-8 hidden">
        <h3 class="text-lg font-medium text-vscode-fg mb-4">Commits</h3>
        <p class="text-vscode-fg opacity-60">Commits content would go here...</p>
      </div>`;
  }

  static renderConflictsContent(): string {
    return `
      <div id="conflictsContent" class="tab-content bg-vscode-bg rounded-lg border border-vscode-border content-card p-8 hidden">
        <h3 class="text-lg font-medium text-vscode-fg mb-4">Conflicts</h3>
        <p class="text-vscode-fg opacity-60">Conflicts content would go here...</p>
      </div>`;
  }
}
