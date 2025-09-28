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
        .icon-check {
            width: 12px;
            height: 12px;
        }
        .icon-user {
            width: 16px;
            height: 16px;
        }
        .icon-merge {
            width: 16px;
            height: 16px;
        }
        .content-card {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .sidebar-card {
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }
        .merge-info-card {
            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body class="bg-azure-dark text-azure-text font-sans">
    <!-- Main Content -->
    <div class="min-h-screen bg-azure-dark p-6">
        <!-- PR Header - Full Width -->
        <div class="bg-azure-darker rounded-lg border border-azure-border content-card mb-6">
            <div class="p-8">
                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3 flex-1">
                        <div class="w-6 h-6 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" class="w-full h-full">
                                <defs>
                                    <linearGradient id="a" gradientUnits="userSpaceOnUse" x1="9" y1="16.97" x2="9" y2="1.03" gradientTransform="scale(7.11111)">
                                        <stop offset="0" stop-color="#0078d4"/>
                                        <stop offset=".16" stop-color="#1380da"/>
                                        <stop offset=".53" stop-color="#3c91e5"/>
                                        <stop offset=".82" stop-color="#559cec"/>
                                        <stop offset="1" stop-color="#5ea0ef"/>
                                    </linearGradient>
                                </defs>
                                <path fill="url(#a)" d="M120.89 28.445v69.262l-28.445 23.324-44.09-16.07v15.93L23.395 88.25l72.746 5.688V31.574ZM96.64 31.93 55.82 7.11v16.285L18.348 34.418 7.109 48.852v32.785l16.075 7.11V46.718Zm0 0"/>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h1 class="text-2xl font-medium text-white mb-4">
                                Merged PR ${pullRequest.id}: ${pullRequest.title}
                            </h1>
                            <div class="flex items-center space-x-3 text-sm text-azure-text-dim mb-4">
                                <span class="bg-azure-green text-white px-3 py-1 rounded text-xs font-medium">Completed</span>
                                <span>12${pullRequest.id.toString().slice(-2)}3</span>
                                <div class="w-4 h-4 bg-azure-green rounded-full flex items-center justify-center text-white">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                </div>
                                <span>Valentine Samuel proposes to merge DEV</span>
                                <span>into QA</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                            Delete source branch
                        </button>
                        <div class="w-8 h-8 bg-azure-green rounded-full flex items-center justify-center text-white text-sm">
                            VS
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Content Area - Two Columns -->
        <div class="flex gap-6">
            <!-- Left Column - Main Content -->
            <div class="flex-1 bg-azure-darker rounded-lg border border-azure-border content-card">
                <!-- Tabs -->
                <div class="border-b border-azure-border">
                    <div class="flex px-8">
                        <button class="relative px-6 py-4 text-sm font-medium text-azure-blue nav-indicator">Overview</button>
                        <button class="px-6 py-4 text-sm font-medium text-azure-text-dim hover:text-white">Files</button>
                        <button class="px-6 py-4 text-sm font-medium text-azure-text-dim hover:text-white">Updates</button>
                        <button class="px-6 py-4 text-sm font-medium text-azure-text-dim hover:text-white">Commits</button>
                        <button class="px-6 py-4 text-sm font-medium text-azure-text-dim hover:text-white">Conflicts</button>
                    </div>
                </div>

            <!-- Content Area -->
            <div class="p-8">
                <!-- Completion Status -->
                <div class="mb-8">
                    <div class="flex items-center text-sm text-azure-text-dim mb-6">
                        <div class="timeline-dot"></div>
                        <span>Valentine Samuel completed this pull request Friday</span>
                        <div class="ml-auto flex space-x-4">
                            <button class="text-azure-blue hover:underline">Cherry-pick</button>
                            <button class="text-azure-blue hover:underline">Revert</button>
                        </div>
                    </div>

                    <!-- Merge Info -->
                    <div class="bg-azure-dark rounded-lg border border-azure-border merge-info-card p-6 mb-6">
                        <div class="text-sm text-azure-text-dim mb-3">
                            Merged PR 21363: Merged PR 21362: feat: add endpoint to update bees order invoice
                        </div>
                        <div class="text-xs text-azure-text-dim mb-3">
                            6602f48
                            <svg class="inline w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414L2.586 7l3.707-3.707a1 1 0 011.414 0z" clip-rule="evenodd"/>
                            </svg>
                            Valentine Samuel Fri at 14:57
                        </div>
                        <button class="text-azure-blue text-sm hover:underline">Show details</button>
                    </div>

                    <!-- Checklist -->
                    <div class="space-y-4 mb-8">
                        <div class="flex items-center space-x-3">
                            <div class="check-circle">
                                <svg class="icon-check" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <span class="text-sm">Required check succeeded</span>
                        </div>
                        <div class="text-xs text-red-400 ml-7 mb-2">
                            <svg class="inline w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                            </svg>
                            1 optional check failed
                        </div>

                        <div class="flex items-center space-x-3">
                            <div class="check-circle">
                                <svg class="icon-check" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <span class="text-sm">Comments must be resolved</span>
                        </div>

                        <div class="text-azure-blue text-sm ml-7 cursor-pointer hover:underline mb-3">View 2 checks</div>

                        <div class="flex items-center space-x-3">
                            <div class="check-circle">
                                <svg class="icon-check" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <span class="text-sm">Required reviewers have approved</span>
                        </div>

                        <div class="flex items-center space-x-3">
                            <div class="check-circle">
                                <svg class="icon-check" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <span class="text-sm">No merge conflicts</span>
                        </div>
                        <div class="text-xs text-azure-text-dim ml-7">Last checked Friday</div>
                    </div>
                </div>

                <!-- Description -->
                <div class="mb-8">
                    <h3 class="text-lg font-medium text-white mb-4">Description</h3>
                    <div class="bg-azure-dark rounded-lg border border-azure-border p-6 text-sm text-azure-text-dim">
                        ${pullRequest.description || 'Merged PR 21362: feat: add endpoint to update bees order invoice'}
                        <ul class="list-disc list-inside mt-4 ml-4 space-y-1">
                            <li>chore: remove unused vars</li>
                            <li>feat: add endpoint to update bees order invoice</li>
                        </ul>
                    </div>
                </div>

                <!-- Show everything dropdown -->
                <div class="mb-8">
                    <button class="bg-azure-dark border border-azure-border rounded-lg px-4 py-3 text-sm text-azure-text-dim hover:bg-azure-border transition-colors">
                        Show everything (6) ▼
                    </button>
                </div>

                <!-- Comment Section -->
                <div class="mb-8">
                    <div class="flex items-center space-x-4 mb-6">
                        <div class="w-8 h-8 bg-azure-green rounded-full flex items-center justify-center text-white text-sm">
                            VS
                        </div>
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            class="flex-1 bg-azure-dark border border-azure-border rounded-lg px-4 py-3 text-sm text-azure-text placeholder-azure-text-dim focus:outline-none focus:border-azure-blue"
                        />
                    </div>
                </div>

                <!-- Activity Timeline -->
                <div class="space-y-6">
                    <div class="flex items-start space-x-4">
                        <div class="timeline-dot mt-1"></div>
                        <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">
                            <svg class="icon-check" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div class="text-sm">
                            <span class="text-white">Valentine Samuel completed the pull request</span>
                            <div class="text-azure-text-dim text-xs mt-1">Friday</div>
                        </div>
                    </div>

                    <div class="flex items-start space-x-4">
                        <div class="timeline-dot mt-1"></div>
                        <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">
                            <svg class="icon-check" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">
                            <svg class="icon-user" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div class="text-sm">
                            <span class="text-white">Valentine Samuel approved the pull request</span>
                            <div class="text-azure-text-dim text-xs mt-1">Friday</div>
                        </div>
                    </div>

                    <div class="flex items-start space-x-4">
                        <div class="timeline-dot mt-1"></div>
                        <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">
                            <svg class="icon-user" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div class="text-sm">
                            <span class="text-white">Valentine Samuel joined as a reviewer</span>
                            <div class="text-azure-text-dim text-xs mt-1">Friday</div>
                        </div>
                    </div>

                    <div class="flex items-start space-x-4">
                        <div class="timeline-dot mt-1"></div>
                        <div class="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                            <svg class="icon-user" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div class="text-sm">
                            <span class="text-white">[AFR_WEB_Distributor Management System (DMS)] Kuja Leads was added as a required reviewer.</span>
                            <div class="text-azure-text-dim text-xs mt-1">Friday</div>
                        </div>
                    </div>

                    <div class="flex items-start space-x-4">
                        <div class="timeline-dot mt-1"></div>
                        <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">
                            <svg class="icon-merge" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414L2.586 7l3.707-3.707a1 1 0 011.414 0z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div class="text-sm">
                            <span class="text-white">Valentine Samuel created the pull request</span>
                            <div class="text-azure-text-dim text-xs mt-1">Friday</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Column - Sidebar -->
        <div class="w-80 bg-azure-darker rounded-lg border border-azure-border sidebar-card p-6">
            <!-- Reviewers -->
            <div class="mb-8">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-medium text-white">Reviewers</h3>
                    <button class="text-azure-blue text-sm hover:underline">Add</button>
                </div>

                <div class="space-y-4">
                    <div class="text-xs text-azure-text-dim font-medium uppercase tracking-wide">Required</div>

                    <div class="flex items-center space-x-3 p-3 rounded-lg border border-azure-border bg-azure-dark/30">
                        <div class="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                            <svg class="icon-user" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <div class="text-sm text-white">Kuja Leads</div>
                            <div class="text-xs text-azure-green">Approved via Valentine Samuel</div>
                        </div>
                        <div class="w-4 h-4 bg-azure-green rounded-full flex items-center justify-center text-white">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                    </div>

                    <div class="text-xs text-azure-text-dim font-medium uppercase tracking-wide mt-6">Optional</div>

                    <div class="flex items-center space-x-3 p-3 rounded-lg border border-azure-border bg-azure-dark/30">
                        <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">
                            <svg class="icon-user" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <div class="text-sm text-white">Valentine Samuel</div>
                            <div class="text-xs text-azure-green">Approved</div>
                        </div>
                        <div class="w-4 h-4 bg-azure-green rounded-full flex items-center justify-center text-white">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tags -->
            <div class="mb-8">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-medium text-white">Tags</h3>
                    <button class="text-azure-text-dim hover:text-white text-lg">+</button>
                </div>
                <div class="p-4 rounded-lg border border-azure-border bg-azure-dark/30">
                    <div class="text-sm text-azure-text-dim">No tags</div>
                </div>
            </div>

            <!-- Work Items -->
            <div class="mb-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-medium text-white">Work Items</h3>
                    <button class="text-azure-text-dim hover:text-white text-lg">+</button>
                </div>
                <div class="p-4 rounded-lg border border-azure-border bg-azure-dark/30">
                    <div class="text-sm text-azure-text-dim">No work items</div>
                </div>
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
