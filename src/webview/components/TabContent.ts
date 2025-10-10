import {
  PullRequestFileChange,
  GitCommit,
  PullRequestUpdate,
} from '../../services/azureDevOpsApiClient';

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
        <button class="w-full flex items-center px-2 py-1.5 hover:bg-vscode-list-hover-bg rounded text-sm transition-colors file-item group" onclick="viewFileDiff('${node.path}', '${node.changeType}', '${node.name}')">
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
    const fileTree = this.buildFileTree(fileChanges);

    const fileCount = fileChanges.length;
    return `
      <div id="filesContent" class="tab-content hidden h-full flex gap-4 relative">
        <!-- Collapsed State Button (Initially Hidden) -->
        <button id="expandFileTreeBtn" class="hidden absolute left-0 top-0 bottom-0 w-8 bg-vscode-bg border-r border-vscode-border hover:bg-vscode-list-hover-bg transition-colors z-10" onclick="toggleFileTree()" title="Expand file tree">
          <svg class="w-4 h-4 mx-auto text-vscode-fg" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
          </svg>
        </button>

        <!-- Left Column - File Tree -->
        <div id="fileTreePanel" class="w-80 bg-vscode-bg rounded-lg border border-vscode-border overflow-hidden flex flex-col transition-all duration-300">
          <!-- Header -->
          <div class="p-4 border-b border-vscode-border">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-medium text-vscode-fg">All Changes</h3>
              <button onclick="toggleFileTree()" class="text-vscode-fg opacity-60 hover:opacity-100 transition-opacity" title="Collapse file tree">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </button>
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

  static renderUpdatesContent(updates: PullRequestUpdate[]): string {
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    };

    const formatFullDate = (dateString: string): string => {
      const date = new Date(dateString);
      return (
        date.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }) +
        ' at ' +
        date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: false,
        })
      );
    };

    const getAuthorInitials = (name: string): string => {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };

    return `
      <div id="updatesContent" class="tab-content bg-vscode-bg rounded-lg border border-vscode-border content-card hidden h-full flex flex-col">
        ${
          updates.length > 0
            ? `
          <div class="flex-1 overflow-y-auto">
            <div class="divide-y divide-vscode-border">
              ${updates
                .map(
                  (update, index) => `
                <div class="p-6">
                  <div class="flex items-start space-x-4">
                    <!-- Update Number Badge -->
                    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-vscode-button-bg flex items-center justify-center text-vscode-button-fg text-sm font-semibold">
                      ${updates.length - index}
                    </div>

                    <!-- Update Content -->
                    <div class="flex-1 min-w-0">
                      <!-- Update Header -->
                      <div class="flex items-center space-x-2 mb-4">
                        ${
                          update.iteration.author?.imageUrl
                            ? `<img src="${update.iteration.author.imageUrl}" alt="${update.iteration.author.displayName}" class="w-5 h-5 rounded-full" />`
                            : `<div class="w-5 h-5 rounded-full bg-vscode-button-bg flex items-center justify-center text-vscode-button-fg text-xs font-semibold">
                            ${update.iteration.author ? getAuthorInitials(update.iteration.author.displayName) : 'UN'}
                          </div>`
                        }
                        <div class="text-sm text-vscode-fg">
                          <span class="font-medium">${update.iteration.author?.displayName || 'Unknown'}</span>
                          <span class="opacity-60"> pushed ${update.pushCount} commit${update.pushCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div class="text-xs text-vscode-fg opacity-60 mb-3">${formatDate(update.iteration.createdDate)}</div>

                      <!-- Commits in this update -->
                      ${
                        update.commits.length > 0
                          ? `
                        <div class="space-y-3 pl-4 border-l-2 border-vscode-border">
                          ${update.commits
                            .map(
                              (commit) => `
                            <div class="bg-vscode-input-bg bg-opacity-30 rounded p-3 hover:bg-opacity-50 transition-colors">
                              <div class="flex items-start justify-between">
                                <div class="flex-1 min-w-0">
                                  <!-- Commit Message -->
                                  <div class="text-sm font-medium text-vscode-fg mb-2">
                                    ${commit.comment.split('\n')[0]}
                                  </div>

                                  <!-- Commit Metadata -->
                                  <div class="flex items-center space-x-3 text-xs">
                                    <!-- Commit Hash -->
                                    <div class="flex items-center space-x-1 text-vscode-fg opacity-60">
                                      <code class="font-mono bg-vscode-bg px-1.5 py-0.5 rounded">${commit.commitId.substring(0, 7)}</code>
                                    </div>

                                    <!-- Author Badge -->
                                    <div class="flex items-center space-x-1">
                                      <span class="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold ${this.getAuthorBadgeColor(commit.author.name)}">
                                        ${getAuthorInitials(commit.author.name)}
                                      </span>
                                      <span class="text-vscode-fg opacity-60">${commit.author.name}</span>
                                    </div>

                                    <!-- Timestamp -->
                                    <span class="text-vscode-fg opacity-60">${formatFullDate(commit.author.date)}</span>
                                  </div>
                                </div>

                                <!-- Actions -->
                                <button
                                  onclick="copyCommitHash('${commit.commitId}')"
                                  class="ml-3 p-1 rounded hover:bg-vscode-button-hover-bg text-vscode-fg opacity-60 hover:opacity-100 transition-opacity"
                                  title="Copy commit hash"
                                >
                                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          `,
                            )
                            .join('')}
                        </div>
                      `
                          : ''
                      }
                    </div>
                  </div>
                </div>
              `,
                )
                .join('')}
            </div>
          </div>
        `
            : `
          <!-- Empty State -->
          <div class="flex-1 flex items-center justify-center text-vscode-fg opacity-60">
            <div class="text-center py-12">
              <svg class="w-16 h-16 mx-auto mb-4 text-vscode-border" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clip-rule="evenodd"/>
              </svg>
              <p class="text-sm font-medium mb-1">No updates yet</p>
              <p class="text-xs opacity-70">Updates will appear here when changes are pushed to the PR</p>
            </div>
          </div>
        `
        }
      </div>`;
  }

  private static getAuthorBadgeColor(authorName: string): string {
    // Generate a consistent color based on the author name
    const colors = [
      'bg-blue-500 text-white',
      'bg-green-500 text-white',
      'bg-purple-500 text-white',
      'bg-pink-500 text-white',
      'bg-yellow-500 text-gray-900',
      'bg-red-500 text-white',
      'bg-indigo-500 text-white',
      'bg-teal-500 text-white',
    ];

    // Simple hash function to get consistent color for same author
    let hash = 0;
    for (let i = 0; i < authorName.length; i++) {
      hash = authorName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  static renderCommitsContent(commits: GitCommit[]): string {
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins < 1 ? 'Just now' : `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else if (diffDays === 1) {
        return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })}`;
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
    };

    const getAuthorInitials = (name: string): string => {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };

    return `
      <div id="commitsContent" class="tab-content bg-vscode-bg rounded-lg border border-vscode-border content-card hidden h-full flex flex-col">
        ${
          commits.length > 0
            ? `
          <!-- Header -->
          <div class="px-6 py-4 border-b border-vscode-border">
            <h3 class="text-lg font-medium text-vscode-fg">${commits.length} Commit${commits.length !== 1 ? 's' : ''}</h3>
          </div>

          <!-- Commits List -->
          <div class="flex-1 overflow-y-auto">
            <div class="divide-y divide-vscode-border">
              ${commits
                .map(
                  (commit) => `
                <div class="px-6 py-4 hover:bg-vscode-list-hover-bg transition-colors">
                  <div class="flex items-start space-x-3">
                    <!-- Author Avatar -->
                    <div class="flex-shrink-0 mt-1">
                      <div class="w-8 h-8 rounded-full bg-vscode-button-bg flex items-center justify-center text-vscode-button-fg text-xs font-semibold">
                        ${getAuthorInitials(commit.author.name)}
                      </div>
                    </div>

                    <!-- Commit Details -->
                    <div class="flex-1 min-w-0">
                      <!-- Commit Message -->
                      <div class="text-sm font-medium text-vscode-fg mb-1">
                        ${commit.comment.split('\n')[0]}${commit.commentTruncated ? '...' : ''}
                      </div>

                      <!-- Commit Metadata -->
                      <div class="flex items-center space-x-3 text-xs text-vscode-fg opacity-60">
                        <!-- Commit Hash -->
                        <div class="flex items-center space-x-1">
                          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0013.414 6L10 2.586A2 2 0 008.586 2H4zm8 10a1 1 0 10-2 0v2a1 1 0 102 0v-2z" clip-rule="evenodd"/>
                          </svg>
                          <code class="font-mono">${commit.commitId.substring(0, 8)}</code>
                        </div>

                        <!-- Author -->
                        <div class="flex items-center space-x-1">
                          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                          </svg>
                          <span>${commit.author.name}</span>
                        </div>

                        <!-- Date -->
                        <div class="flex items-center space-x-1">
                          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                          </svg>
                          <span>${formatDate(commit.author.date)}</span>
                        </div>
                      </div>

                      ${
                        commit.comment.split('\n').length > 1
                          ? `
                        <!-- Extended Commit Message -->
                        <div class="mt-2 text-xs text-vscode-fg opacity-70 pl-4 border-l-2 border-vscode-border">
                          ${commit.comment
                            .split('\n')
                            .slice(1)
                            .filter((line) => line.trim())
                            .map((line) => `<div class="mb-1">${line}</div>`)
                            .join('')}
                        </div>
                      `
                          : ''
                      }
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex-shrink-0 flex items-center space-x-2">
                      <button
                        onclick="copyCommitHash('${commit.commitId}')"
                        class="p-1.5 rounded hover:bg-vscode-button-hover-bg text-vscode-fg opacity-60 hover:opacity-100 transition-opacity"
                        title="Copy commit hash"
                      >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              `,
                )
                .join('')}
            </div>
          </div>
        `
            : `
          <!-- Empty State -->
          <div class="flex-1 flex items-center justify-center text-vscode-fg opacity-60">
            <div class="text-center py-12">
              <svg class="w-16 h-16 mx-auto mb-4 text-vscode-border" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0013.414 6L10 2.586A2 2 0 008.586 2H4zm8 10a1 1 0 10-2 0v2a1 1 0 102 0v-2z" clip-rule="evenodd"/>
              </svg>
              <p class="text-sm font-medium mb-1">No commits found</p>
              <p class="text-xs opacity-70">This pull request doesn't have any commits yet</p>
            </div>
          </div>
        `
        }
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
