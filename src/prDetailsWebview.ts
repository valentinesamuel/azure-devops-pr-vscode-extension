import * as vscode from 'vscode';
import { PullRequest } from './pullRequestProvider';

export class PrDetailsWebviewProvider {
  public static createOrShow(extensionUri: vscode.Uri, pullRequest: PullRequest) {
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
    const statusColor = this.getStatusColor(pullRequest);
    const statusIcon = this.getStatusIcon(pullRequest);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pull Request ${pullRequest.id}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'azure-dark': '#1e1e1e',
                        'azure-darker': '#252526',
                        'azure-border': '#3c3c3c',
                        'azure-text': '#cccccc',
                        'azure-text-dim': '#969696',
                        'azure-blue': '#0078d4',
                        'azure-green': '#16a34a',
                        'azure-success': '#10b981'
                    }
                }
            }
        }
    </script>
    <style>
        .nav-indicator::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background-color: #0078d4;
        }
        .timeline-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #16a34a;
            margin-right: 8px;
            margin-top: 6px;
            flex-shrink: 0;
        }
        .check-circle {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background-color: #16a34a;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
        }
    </style>
</head>
<body class="bg-azure-dark text-azure-text font-sans">
    <!-- Top Navigation Bar -->
    <div class="bg-blue-600 text-white px-4 py-2 text-sm font-medium">
        Azure DevOps
    </div>

    <!-- Breadcrumb -->
    <div class="bg-azure-darker px-4 py-2 text-sm border-b border-azure-border">
        <div class="flex items-center space-x-1 text-azure-text-dim">
            <span class="text-azure-blue cursor-pointer hover:underline">ab-inbev-afr</span>
            <span>/</span>
            <span class="text-azure-blue cursor-pointer hover:underline">AFR-WEB_Distributor_Management...</span>
            <span>/</span>
            <span class="text-azure-blue cursor-pointer hover:underline">Repos</span>
            <span>/</span>
            <span class="text-azure-blue cursor-pointer hover:underline">Pull requests</span>
            <span>/</span>
            <span class="text-red-400">🔥 kuja_order_ms</span>
        </div>
    </div>

    <!-- Main Content -->
    <div class="flex min-h-screen">
        <!-- Left Content Area -->
        <div class="flex-1 bg-azure-darker">
            <!-- PR Header -->
            <div class="p-6 border-b border-azure-border">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-start space-x-3">
                        <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs font-bold mt-1">
                            ✓
                        </div>
                        <div>
                            <h1 class="text-xl font-medium text-white mb-2">
                                Merged PR ${pullRequest.id}: ${pullRequest.title}
                            </h1>
                            <div class="flex items-center space-x-2 text-sm text-azure-text-dim mb-2">
                                <span class="bg-azure-green text-white px-2 py-1 rounded text-xs font-medium">Completed</span>
                                <span>12${pullRequest.id.toString().slice(-2)}3</span>
                                <div class="w-4 h-4 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">✓</div>
                                <span>Valentine Samuel proposes to merge DEV</span>
                                <span>into QA</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button class="text-azure-text-dim hover:text-white">Delete source branch</button>
                        <button class="text-azure-text-dim hover:text-white">⋯</button>
                        <div class="w-8 h-8 bg-azure-green rounded-full flex items-center justify-center text-white text-sm">
                            VS
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="border-b border-azure-border">
                <div class="flex px-6">
                    <button class="relative px-4 py-3 text-sm font-medium text-azure-blue nav-indicator">Overview</button>
                    <button class="px-4 py-3 text-sm font-medium text-azure-text-dim hover:text-white">Files</button>
                    <button class="px-4 py-3 text-sm font-medium text-azure-text-dim hover:text-white">Updates</button>
                    <button class="px-4 py-3 text-sm font-medium text-azure-text-dim hover:text-white">Commits</button>
                    <button class="px-4 py-3 text-sm font-medium text-azure-text-dim hover:text-white">Conflicts</button>
                </div>
            </div>

            <!-- Content Area -->
            <div class="p-6">
                <!-- Completion Status -->
                <div class="mb-6">
                    <div class="flex items-center text-sm text-azure-text-dim mb-4">
                        <div class="timeline-dot"></div>
                        <span>Valentine Samuel completed this pull request Friday</span>
                        <div class="ml-auto flex space-x-2">
                            <button class="text-azure-blue hover:underline">Cherry-pick</button>
                            <button class="text-azure-blue hover:underline">Revert</button>
                        </div>
                    </div>

                    <!-- Merge Info -->
                    <div class="bg-azure-dark rounded p-4 mb-4">
                        <div class="text-sm text-azure-text-dim mb-2">
                            Merged PR 21363: Merged PR 21362: feat: add endpoint to update bees order invoice
                        </div>
                        <div class="text-xs text-azure-text-dim">
                            6602f48 🔀 Valentine Samuel Fri at 14:57
                        </div>
                        <button class="text-azure-blue text-sm mt-2 hover:underline">Show details</button>
                    </div>

                    <!-- Checklist -->
                    <div class="space-y-2 mb-6">
                        <div class="flex items-center space-x-3">
                            <div class="check-circle">✓</div>
                            <span class="text-sm">Required check succeeded</span>
                        </div>
                        <div class="text-xs text-red-400 ml-7">🔴 1 optional check failed</div>

                        <div class="flex items-center space-x-3">
                            <div class="check-circle">✓</div>
                            <span class="text-sm">Comments must be resolved</span>
                        </div>

                        <div class="text-azure-blue text-sm ml-7 cursor-pointer hover:underline">View 2 checks</div>

                        <div class="flex items-center space-x-3">
                            <div class="check-circle">✓</div>
                            <span class="text-sm">Required reviewers have approved</span>
                        </div>

                        <div class="flex items-center space-x-3">
                            <div class="check-circle">✓</div>
                            <span class="text-sm">No merge conflicts</span>
                        </div>
                        <div class="text-xs text-azure-text-dim ml-7">Last checked Friday</div>
                    </div>
                </div>

                <!-- Description -->
                <div class="mb-6">
                    <h3 class="text-lg font-medium text-white mb-3">Description</h3>
                    <div class="text-sm text-azure-text-dim">
                        ${pullRequest.description || 'Merged PR 21362: feat: add endpoint to update bees order invoice'}
                        <ul class="list-disc list-inside mt-2 ml-4">
                            <li>chore: remove unused vars</li>
                            <li>feat: add endpoint to update bees order invoice</li>
                        </ul>
                    </div>
                </div>

                <!-- Show everything dropdown -->
                <div class="mb-6">
                    <button class="bg-azure-dark border border-azure-border rounded px-3 py-2 text-sm text-azure-text-dim hover:bg-azure-border">
                        Show everything (6) ▼
                    </button>
                </div>

                <!-- Comment Section -->
                <div class="mb-6">
                    <div class="flex items-center space-x-3 mb-4">
                        <div class="w-8 h-8 bg-azure-green rounded-full flex items-center justify-center text-white text-sm">
                            VS
                        </div>
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            class="flex-1 bg-azure-dark border border-azure-border rounded px-3 py-2 text-sm text-azure-text placeholder-azure-text-dim"
                        />
                    </div>
                </div>

                <!-- Activity Timeline -->
                <div class="space-y-4">
                    <div class="flex items-start space-x-3">
                        <div class="timeline-dot mt-1"></div>
                        <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">VS</div>
                        <div class="text-sm">
                            <span class="text-white">Valentine Samuel completed the pull request</span>
                            <div class="text-azure-text-dim text-xs">Friday</div>
                        </div>
                    </div>

                    <div class="flex items-start space-x-3">
                        <div class="timeline-dot mt-1"></div>
                        <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">✓</div>
                        <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">VS</div>
                        <div class="text-sm">
                            <span class="text-white">Valentine Samuel approved the pull request</span>
                            <div class="text-azure-text-dim text-xs">Friday</div>
                        </div>
                    </div>

                    <div class="flex items-start space-x-3">
                        <div class="timeline-dot mt-1"></div>
                        <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">VS</div>
                        <div class="text-sm">
                            <span class="text-white">Valentine Samuel joined as a reviewer</span>
                            <div class="text-azure-text-dim text-xs">Friday</div>
                        </div>
                    </div>

                    <div class="flex items-start space-x-3">
                        <div class="timeline-dot mt-1"></div>
                        <div class="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">KL</div>
                        <div class="text-sm">
                            <span class="text-white">[AFR_WEB_Distributor Management System (DMS)] Kuja Leads was added as a required reviewer.</span>
                            <div class="text-azure-text-dim text-xs">Friday</div>
                        </div>
                    </div>

                    <div class="flex items-start space-x-3">
                        <div class="timeline-dot mt-1"></div>
                        <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">VS</div>
                        <div class="text-sm">
                            <span class="text-white">Valentine Samuel created the pull request</span>
                            <div class="text-azure-text-dim text-xs">Friday</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Sidebar -->
        <div class="w-80 bg-azure-darker border-l border-azure-border p-6">
            <!-- Reviewers -->
            <div class="mb-6">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-medium text-white">Reviewers</h3>
                    <button class="text-azure-blue text-sm hover:underline">Add</button>
                </div>

                <div class="space-y-3">
                    <div class="text-xs text-azure-text-dim font-medium">Required</div>

                    <div class="flex items-center space-x-3">
                        <div class="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">KL</div>
                        <div class="flex-1">
                            <div class="text-sm text-white">Kuja Leads</div>
                            <div class="text-xs text-azure-green">Approved via Valentine Samuel</div>
                        </div>
                        <div class="w-4 h-4 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">✓</div>
                    </div>

                    <div class="text-xs text-azure-text-dim font-medium mt-4">Optional</div>

                    <div class="flex items-center space-x-3">
                        <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">VS</div>
                        <div class="flex-1">
                            <div class="text-sm text-white">Valentine Samuel</div>
                            <div class="text-xs text-azure-green">Approved</div>
                        </div>
                        <div class="w-4 h-4 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">✓</div>
                    </div>
                </div>
            </div>

            <!-- Tags -->
            <div class="mb-6">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-medium text-white">Tags</h3>
                    <button class="text-azure-text-dim hover:text-white text-lg">+</button>
                </div>
                <div class="text-sm text-azure-text-dim">No tags</div>
            </div>

            <!-- Work Items -->
            <div class="mb-6">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-medium text-white">Work Items</h3>
                    <button class="text-azure-text-dim hover:text-white text-lg">+</button>
                </div>
                <div class="text-sm text-azure-text-dim">No work items</div>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        // Tab switching
        document.querySelectorAll('button').forEach(btn => {
            if (btn.textContent === 'Overview' || btn.textContent === 'Files' || btn.textContent === 'Updates' || btn.textContent === 'Commits' || btn.textContent === 'Conflicts') {
                btn.addEventListener('click', () => {
                    // Remove active state from all tabs
                    document.querySelectorAll('.nav-indicator').forEach(el => {
                        el.classList.remove('nav-indicator', 'text-azure-blue');
                        el.classList.add('text-azure-text-dim');
                    });

                    // Add active state to clicked tab
                    btn.classList.add('nav-indicator', 'text-azure-blue');
                    btn.classList.remove('text-azure-text-dim');
                });
            }
        });

        function openInBrowser() {
            vscode.postMessage({
                command: 'openInBrowser',
                prId: ${pullRequest.id}
            });
        }

        function checkout() {
            vscode.postMessage({
                command: 'checkoutBranch',
                branch: '${pullRequest.sourceBranch}',
                prId: ${pullRequest.id}
            });
        }
    </script>
</body>
</html>`;
  }

  private static getStatusColor(pullRequest: PullRequest): string {
    if (pullRequest.isDraft) {
      return '#8764b8';
    }
    switch (pullRequest.status) {
      case 'Active':
        return '#107c10';
      case 'Completed':
        return '#8764b8';
      case 'Abandoned':
        return '#d13438';
      default:
        return '#605e5c';
    }
  }

  private static getStatusIcon(pullRequest: PullRequest): string {
    if (pullRequest.isDraft) {
      return '✎';
    }
    switch (pullRequest.status) {
      case 'Active':
        return '⬊';
      case 'Completed':
        return '✓';
      case 'Abandoned':
        return '✕';
      default:
        return '?';
    }
  }

  private static formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
      }
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }

  private static getInitials(email: string): string {
    const name = email.split('@')[0];
    const parts = name.split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
