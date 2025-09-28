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
<body class="bg-azure-dark text-azure-text font-sans h-screen overflow-hidden">
    <!-- Main Content -->
    <div class="h-full bg-azure-dark p-6 flex flex-col">
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
                            <div class="flex items-center space-x-4 text-sm mb-4">
                                <button class="flex items-center space-x-2 ${this.getStatusButtonClass(pullRequest)} px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                                    ${this.getStatusIconSvg(pullRequest)}
                                    <span>${pullRequest.isDraft ? 'Draft' : pullRequest.status}</span>
                                </button>
                                <span class="text-azure-text-dim">12${pullRequest.id.toString().slice(-2)}3</span>
                                <span class="text-azure-text-dim">Valentine Samuel proposes to merge</span>
                            </div>
                            <div class="flex items-center space-x-3 text-sm">
                                <div class="flex items-center space-x-2">
                                    <span class="bg-azure-blue/20 text-azure-blue px-3 py-1 rounded-full text-xs font-medium border border-azure-blue/30">
                                        ${pullRequest.sourceBranch}
                                    </span>
                                    <svg class="w-4 h-4 text-azure-text-dim" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                    </svg>
                                    <span class="bg-azure-green/20 text-azure-green px-3 py-1 rounded-full text-xs font-medium border border-azure-green/30">
                                        ${pullRequest.targetBranch}
                                    </span>
                                </div>
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

        <!-- Tabs Section - Full Width -->
        <div class="bg-azure-darker rounded-lg border border-azure-border content-card mb-6 flex-shrink-0">
            <div class="border-b border-azure-border">
                <div class="flex px-8">
                    <button id="overviewTab" class="tab-button relative px-6 py-4 text-sm font-medium text-azure-blue nav-indicator">Overview</button>
                    <button id="filesTab" class="tab-button px-6 py-4 text-sm font-medium text-azure-text-dim hover:text-white">Files</button>
                    <button id="updatesTab" class="tab-button px-6 py-4 text-sm font-medium text-azure-text-dim hover:text-white">Updates</button>
                    <button id="commitsTab" class="tab-button px-6 py-4 text-sm font-medium text-azure-text-dim hover:text-white">Commits</button>
                    <button id="conflictsTab" class="tab-button px-6 py-4 text-sm font-medium text-azure-text-dim hover:text-white">Conflicts</button>
                </div>
            </div>
        </div>

        <!-- Content Area - Dynamic Layout Based on Tab -->
        <div class="flex-1 overflow-hidden">
            <!-- Overview Tab Content - Two Columns -->
            <div id="overviewContent" class="tab-content flex gap-6 h-full">
                <!-- Left Column - Overview Content -->
                <div class="flex-1 bg-azure-darker rounded-lg border border-azure-border content-card overflow-y-auto p-8">
                <!-- Abandonment Status -->
                <div class="mb-8">
                    <div class="flex items-center bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-6">
                        <svg class="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"/>
                            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h8v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
                        </svg>
                        <span class="text-red-200">The pull request was abandoned 19 Aug</span>
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

                    <!-- Checks Section -->
                    <div class="space-y-4 mb-8">
                        <!-- Required check succeeded -->
                        <div class="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                            <div class="flex items-center space-x-3">
                                <div class="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                </div>
                                <span class="text-sm font-medium text-white">Required check succeeded</span>
                            </div>
                            <div class="flex items-center space-x-2 mt-2 ml-8">
                                <svg class="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                </svg>
                                <span class="text-xs text-orange-300">1 optional check not yet run</span>
                            </div>
                        </div>

                        <!-- Comments must be resolved -->
                        <div class="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                            <div class="flex items-center space-x-3">
                                <div class="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                </div>
                                <span class="text-sm font-medium text-white">Comments must be resolved</span>
                            </div>
                        </div>

                        <!-- View checks link -->
                        <div class="ml-8">
                            <button id="toggleChecksPanel" class="text-azure-blue text-sm hover:underline flex items-center space-x-1">
                                <span>View 2 checks</span>
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                                </svg>
                            </button>
                        </div>

                        <!-- Waiting for reviewers -->
                        <div class="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                            <div class="flex items-center space-x-3">
                                <div class="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                                    </svg>
                                </div>
                                <span class="text-sm font-medium text-white">2 required reviewers must approve</span>
                            </div>
                        </div>
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

                <!-- Comments & Activity -->
                <div class="space-y-6">
                    <!-- Merge Conflicts Resolution Comment - Multiple Files -->
                    <div class="relative">
                        <div class="timeline-dot absolute left-4 top-6"></div>
                        <div class="flex items-start space-x-4 ml-8">
                            <div class="w-8 h-8 bg-azure-blue rounded-full flex items-center justify-center text-white text-sm font-medium">2</div>
                            <div class="flex-1">
                                <div class="flex items-center space-x-2 mb-2">
                                    <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">VS</div>
                                    <span class="text-white font-medium">Valentine Samuel resolved merge conflicts</span>
                                    <span class="text-azure-text-dim text-xs">19 Sept</span>
                                </div>
                                <div class="bg-azure-darker rounded-lg border border-azure-border p-4">
                                    <div class="flex items-center justify-between mb-3">
                                        <div class="flex items-center space-x-2">
                                            <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">VS</div>
                                            <span class="text-white text-sm">Valentine Samuel</span>
                                            <span class="text-azure-text-dim text-xs">19 Sept</span>
                                        </div>
                                        <div class="flex items-center space-x-2">
                                            <button class="text-azure-text-dim hover:text-white">
                                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                                                </svg>
                                            </button>
                                            <button class="text-azure-text-dim hover:text-white">
                                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"/>
                                                    <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h8v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
                                                </svg>
                                            </button>
                                            <button class="text-azure-text-dim hover:text-white">
                                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
                                                </svg>
                                            </button>
                                            <div class="flex items-center space-x-1">
                                                <svg class="w-4 h-4 text-azure-text-dim" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/>
                                                </svg>
                                                <span class="text-azure-green text-xs font-medium">Resolved</span>
                                                <svg class="w-4 h-4 text-azure-text-dim" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-sm text-azure-text mb-3">Submitted conflict resolution for the file(s).</div>
                                    <div class="mb-4">
                                        <ul class="list-disc list-inside space-y-1 ml-2">
                                            <li class="text-azure-blue text-sm hover:underline cursor-pointer">/src/adapters/cache/providers/redis.provider.ts</li>
                                            <li class="text-azure-blue text-sm hover:underline cursor-pointer">/src/configs/redis.config.ts</li>
                                            <li class="text-azure-blue text-sm hover:underline cursor-pointer">/src/configs/schema.config.ts</li>
                                            <li class="text-azure-blue text-sm hover:underline cursor-pointer">/src/modules/inventory/inventory.module.ts</li>
                                            <li class="text-azure-blue text-sm hover:underline cursor-pointer">/src/modules/inventory/jobs/inventorySyncCronJob.service.ts</li>
                                            <li class="text-azure-blue text-sm hover:underline cursor-pointer">/src/modules/inventory/services/inventoryCache.service.ts</li>
                                            <li class="text-azure-blue text-sm hover:underline cursor-pointer">/src/modules/inventory/usecases/getInventorySyncStatus.usecase.ts</li>
                                        </ul>
                                    </div>
                                    <div class="border-t border-azure-border pt-3">
                                        <div class="flex items-center space-x-3">
                                            <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">VS</div>
                                            <input type="text" placeholder="Write a reply..." class="flex-1 bg-azure-dark border border-azure-border rounded px-3 py-2 text-sm text-azure-text placeholder-azure-text-dim focus:outline-none focus:border-azure-blue"/>
                                            <button class="bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium">Reactivate</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Commit Push Activity -->
                    <div class="relative">
                        <div class="timeline-dot absolute left-4 top-6"></div>
                        <div class="flex items-start space-x-4 ml-8">
                            <div class="w-8 h-8 bg-azure-blue rounded-full flex items-center justify-center text-white text-sm font-medium">
                                2
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center space-x-2">
                                        <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">
                                            VS
                                        </div>
                                        <span class="text-white font-medium">Valentine Samuel pushed 1 commit</span>
                                    </div>
                                    <span class="text-azure-text-dim text-xs">Friday</span>
                                </div>

                                <!-- Commit Details Card -->
                                <div class="bg-azure-dark rounded-lg border border-azure-border p-4">
                                    <div class="text-sm text-white mb-2">
                                        fix: check for missing dist code
                                    </div>
                                    <div class="flex items-center space-x-3 text-xs text-azure-text-dim">
                                        <span class="font-mono bg-azure-darker px-2 py-1 rounded">1d1befdd</span>
                                        <div class="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                            V
                                        </div>
                                        <span>valentinesamuel</span>
                                        <span>Fri at 13:18</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Approval Activity -->
                    <div class="relative">
                        <div class="timeline-dot absolute left-4 top-6"></div>
                        <div class="flex items-start space-x-4 ml-8">
                            <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">
                                <svg class="icon-check" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <div class="flex items-center justify-between w-full">
                                <div class="flex items-center space-x-2">
                                    <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">
                                        VS
                                    </div>
                                    <span class="text-white text-sm">Valentine Samuel approved the pull request</span>
                                </div>
                                <span class="text-azure-text-dim text-xs">Friday</span>
                            </div>
                        </div>
                    </div>

                    <!-- Creation Activity -->
                    <div class="relative">
                        <div class="timeline-dot absolute left-4 top-6"></div>
                        <div class="flex items-start space-x-4 ml-8">
                            <div class="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs">
                                SA
                            </div>
                            <div class="flex items-center justify-between w-full">
                                <div class="text-sm">
                                    <span class="text-white">Success Abhulimen created the pull request</span>
                                </div>
                                <span class="text-azure-text-dim text-xs">Friday</span>
                            </div>
                        </div>
                    </div>
                </div>
                </div>

                <!-- Right Column - Sidebar (Only for Overview) -->
                <div class="w-80 bg-azure-darker rounded-lg border border-azure-border sidebar-card flex flex-col overflow-hidden">
                    <div class="p-6 overflow-y-auto flex-1">
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
            </div>

            <!-- Files Tab Content - Full Width -->
            <div id="filesContent" class="tab-content bg-azure-darker rounded-lg border border-azure-border content-card p-8 hidden">
                <div class="mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-white">Files changed</h3>
                        <div class="flex items-center space-x-4">
                            <button class="text-azure-blue text-sm hover:underline">View merge commit</button>
                            <div class="flex items-center space-x-2">
                                <button class="bg-azure-blue text-white px-3 py-1 rounded text-sm">Filter</button>
                                <span class="text-azure-text-dim text-sm">58 changed files</span>
                            </div>
                        </div>
                    </div>

                    <!-- File Conflict Alert -->
                    <div class="bg-orange-900/20 border border-orange-600/30 rounded-lg p-4 mb-6">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 text-orange-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                            </svg>
                            <span class="text-orange-200">There are some conflict resolutions applied that aren't visible in the Files tab. Review merge commit to see all the changes including conflict resolutions.</span>
                            <button class="ml-auto text-orange-200 hover:text-white">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Filter Bar -->
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-4">
                            <button class="bg-azure-blue text-white px-3 py-1 rounded text-sm">All Changes</button>
                            <button class="text-azure-text-dim text-sm hover:text-white">Filter</button>
                            <span class="text-azure-text-dim text-sm">58 changed files</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button class="text-azure-text-dim hover:text-white p-2">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V4z"/>
                                </svg>
                            </button>
                            <button class="text-azure-text-dim hover:text-white p-2">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414L8.586 11H5v-1a1 1 0 10-2 0v4a1 1 0 001 1h2.414l-1.707 1.707a1 1 0 101.414 1.414L9 14.414l2.879 2.879a1 1 0 001.414-1.414L11.586 14H15a1 1 0 001-1v-4a1 1 0 10-2 0v1h-3.586l3.293-3.293z" clip-rule="evenodd"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- File Tree -->
                    <div class="space-y-2">
                        <!-- Folder: src -->
                        <div class="border border-azure-border rounded-lg">
                            <div class="flex items-center p-3 bg-azure-dark/30">
                                <button class="mr-2 text-azure-text-dim hover:text-white">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                    </svg>
                                </button>
                                <span class="font-medium text-white mr-2">src</span>
                                <span class="text-xs text-azure-text-dim bg-azure-darker px-2 py-1 rounded">+42 -15</span>
                            </div>

                            <!-- Files in src folder -->
                            <div class="border-t border-azure-border">
                                <div class="flex items-center justify-between p-3 hover:bg-azure-dark/50 cursor-pointer">
                                    <div class="flex items-center">
                                        <span class="mr-3 text-azure-text-dim">├─</span>
                                        <div class="flex items-center space-x-2">
                                            <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V4z"/>
                                            </svg>
                                            <span class="text-white">account-ms-cl.yml</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center space-x-4">
                                        <span class="text-xs text-azure-text-dim">+7 -3</span>
                                        <button class="text-azure-blue text-sm hover:underline">View</button>
                                    </div>
                                </div>

                                <div class="flex items-center justify-between p-3 hover:bg-azure-dark/50 cursor-pointer border-t border-azure-border/50">
                                    <div class="flex items-center">
                                        <span class="mr-3 text-azure-text-dim">├─</span>
                                        <div class="flex items-center space-x-2">
                                            <svg class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                                            </svg>
                                            <span class="text-white">azuredevopsuserpipelines</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center space-x-4">
                                        <span class="text-xs text-azure-text-dim">+15 -8</span>
                                        <button class="text-azure-blue text-sm hover:underline">View</button>
                                    </div>
                                </div>

                                <div class="flex items-center justify-between p-3 hover:bg-azure-dark/50 cursor-pointer border-t border-azure-border/50">
                                    <div class="flex items-center">
                                        <span class="mr-3 text-azure-text-dim">└─</span>
                                        <div class="flex items-center space-x-2">
                                            <svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                            </svg>
                                            <span class="text-white">azuredbstorage.provider.ts</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center space-x-4">
                                        <span class="text-xs text-azure-text-dim">+20 -4</span>
                                        <button class="text-azure-blue text-sm hover:underline">View</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Other files -->
                        <div class="space-y-1">
                            <div class="flex items-center justify-between p-3 hover:bg-azure-dark/30 rounded cursor-pointer">
                                <div class="flex items-center space-x-2">
                                    <svg class="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V4z"/>
                                    </svg>
                                    <span class="text-white">redis.provider.ts</span>
                                </div>
                                <div class="flex items-center space-x-4">
                                    <span class="text-xs text-azure-text-dim">+5 -2</span>
                                    <button class="text-azure-blue text-sm hover:underline">View</button>
                                </div>
                            </div>

                            <div class="flex items-center justify-between p-3 hover:bg-azure-dark/30 rounded cursor-pointer">
                                <div class="flex items-center space-x-2">
                                    <svg class="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                                    </svg>
                                    <span class="text-white">cache.adapter.ts</span>
                                </div>
                                <div class="flex items-center space-x-4">
                                    <span class="text-xs text-azure-text-dim">+3 -1</span>
                                    <button class="text-azure-blue text-sm hover:underline">View</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="updatesContent" class="tab-content bg-azure-darker rounded-lg border border-azure-border content-card p-8 hidden">
                <h3 class="text-lg font-medium text-white mb-4">Updates</h3>
                <p class="text-azure-text-dim">Updates content would go here...</p>
            </div>

            <div id="commitsContent" class="tab-content bg-azure-darker rounded-lg border border-azure-border content-card p-8 hidden">
                <h3 class="text-lg font-medium text-white mb-4">Commits</h3>
                <p class="text-azure-text-dim">Commits content would go here...</p>
            </div>

            <div id="conflictsContent" class="tab-content bg-azure-darker rounded-lg border border-azure-border content-card p-8 hidden">
                <h3 class="text-lg font-medium text-white mb-4">Conflicts</h3>
                <p class="text-azure-text-dim">Conflicts content would go here...</p>
            </div>
        </div>
    </div>

    <!-- Checks Panel (Hidden by default) -->
    <div id="checksPanel" class="fixed top-0 right-0 h-full w-96 bg-azure-darker border-l border-azure-border transform translate-x-full transition-transform duration-300 ease-in-out z-50 shadow-2xl">
        <div class="h-full flex flex-col">
            <!-- Panel Header -->
            <div class="flex items-center justify-between p-4 border-b border-azure-border">
                <h2 class="text-lg font-medium text-white">Checks</h2>
                <button id="closeChecksPanel" class="text-azure-text-dim hover:text-white">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                </button>
            </div>

            <!-- Panel Content -->
            <div class="flex-1 overflow-y-auto p-4">
                <div class="text-xs text-azure-text-dim mb-4">
                    The displayed list of checks may be truncated for optimal performance. For a smoother experience, please maintain a reasonable number of policies (fewer than 100).
                </div>

                <!-- Required Checks Section -->
                <div class="mb-6">
                    <h3 class="text-sm font-medium text-white mb-3">Required</h3>

                    <!-- Comments must be resolved check -->
                    <div class="bg-azure-dark rounded-lg border border-azure-border p-4 mb-3">
                        <div class="flex items-start justify-between">
                            <div class="flex items-start space-x-3">
                                <div class="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white mt-0.5">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                </div>
                                <div class="flex-1">
                                    <div class="text-sm font-medium text-white mb-1">Comments must be resolved</div>
                                    <div class="text-xs text-green-400">Succeeded</div>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <button class="text-azure-text-dim hover:text-white text-xs" title="Skip this check">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                    </svg>
                                </button>
                                <button class="text-azure-blue hover:text-blue-400 text-xs">Details</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Optional Checks Section -->
                <div class="mb-6">
                    <h3 class="text-sm font-medium text-white mb-3">Optional</h3>

                    <!-- Work items must be linked check -->
                    <div class="bg-azure-dark rounded-lg border border-azure-border p-4 mb-3">
                        <div class="flex items-start justify-between">
                            <div class="flex items-start space-x-3">
                                <div class="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white mt-0.5">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                    </svg>
                                </div>
                                <div class="flex-1">
                                    <div class="text-sm font-medium text-white mb-1">Work items must be linked</div>
                                    <div class="text-xs text-red-400">Failed</div>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <button class="bg-azure-blue hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition-colors" title="Skip this check">
                                    Skip
                                </button>
                                <button class="text-azure-blue hover:text-blue-400 text-xs">Retry</button>
                                <button class="text-azure-blue hover:text-blue-400 text-xs">Details</button>
                            </div>
                        </div>
                        <div class="mt-3 text-xs text-azure-text-dim">
                            This pull request does not have any linked work items. Link a work item to this pull request to track your changes.
                        </div>
                    </div>
                </div>

                <!-- Actions Section -->
                <div class="border-t border-azure-border pt-4">
                    <div class="flex space-x-2">
                        <button class="bg-azure-blue hover:bg-blue-600 text-white text-sm px-4 py-2 rounded transition-colors">
                            Retry all failed
                        </button>
                        <button class="bg-gray-600 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded transition-colors">
                            Skip all optional
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Overlay for panel -->
    <div id="panelOverlay" class="fixed inset-0 bg-black bg-opacity-50 hidden z-40"></div>

    <script>
        const vscode = acquireVsCodeApi();

        // Checks panel functionality
        const checksPanel = document.getElementById('checksPanel');
        const panelOverlay = document.getElementById('panelOverlay');
        const toggleChecksBtn = document.getElementById('toggleChecksPanel');
        const closeChecksBtn = document.getElementById('closeChecksPanel');

        function openChecksPanel() {
            checksPanel.classList.remove('translate-x-full');
            panelOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeChecksPanel() {
            checksPanel.classList.add('translate-x-full');
            panelOverlay.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }

        toggleChecksBtn.addEventListener('click', openChecksPanel);
        closeChecksBtn.addEventListener('click', closeChecksPanel);
        panelOverlay.addEventListener('click', closeChecksPanel);

        // Handle check skip actions
        document.querySelectorAll('[title="Skip this check"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const checkCard = btn.closest('.bg-azure-dark');
                const checkName = checkCard.querySelector('.text-white').textContent;

                if (confirm(\`Are you sure you want to skip the check: \${checkName}?\`)) {
                    // Add skipped state styling
                    checkCard.classList.add('opacity-60');
                    const statusElement = checkCard.querySelector('.text-xs');
                    statusElement.textContent = 'Skipped';
                    statusElement.className = 'text-xs text-yellow-400';

                    // Update icon
                    const iconDiv = checkCard.querySelector('.w-5.h-5');
                    iconDiv.className = 'w-5 h-5 bg-yellow-600 rounded-full flex items-center justify-center text-white mt-0.5';
                    iconDiv.innerHTML = '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>';

                    vscode.postMessage({
                        command: 'skipCheck',
                        checkName: checkName
                    });
                }
            });
        });

        // Handle retry actions
        document.querySelectorAll('button').forEach(btn => {
            if (btn.textContent === 'Retry') {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const checkCard = btn.closest('.bg-azure-dark');
                    const checkName = checkCard.querySelector('.text-white').textContent;

                    // Show running state
                    const statusElement = checkCard.querySelector('.text-xs');
                    statusElement.textContent = 'Running...';
                    statusElement.className = 'text-xs text-yellow-400';

                    // Update icon to loading
                    const iconDiv = checkCard.querySelector('.w-5.h-5');
                    iconDiv.className = 'w-5 h-5 bg-yellow-600 rounded-full flex items-center justify-center text-white mt-0.5 animate-spin';
                    iconDiv.innerHTML = '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/></svg>';

                    vscode.postMessage({
                        command: 'retryCheck',
                        checkName: checkName
                    });
                });
            }
        });

        // Tab switching functionality
        function showTab(tabName) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });

            // Remove active state from all tabs
            document.querySelectorAll('.tab-button').forEach(tab => {
                tab.classList.remove('nav-indicator', 'text-azure-blue');
                tab.classList.add('text-azure-text-dim');
            });

            // Show selected tab content
            const targetContent = document.getElementById(tabName + 'Content');
            if (targetContent) {
                targetContent.classList.remove('hidden');
            }

            // Add active state to clicked tab
            const activeTab = document.getElementById(tabName + 'Tab');
            if (activeTab) {
                activeTab.classList.add('nav-indicator', 'text-azure-blue');
                activeTab.classList.remove('text-azure-text-dim');
            }
        }

        // Add click event listeners to all tabs
        document.getElementById('overviewTab').addEventListener('click', () => showTab('overview'));
        document.getElementById('filesTab').addEventListener('click', () => showTab('files'));
        document.getElementById('updatesTab').addEventListener('click', () => showTab('updates'));
        document.getElementById('commitsTab').addEventListener('click', () => showTab('commits'));
        document.getElementById('conflictsTab').addEventListener('click', () => showTab('conflicts'));

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

  private static getStatusButtonClass(pullRequest: PullRequest): string {
    if (pullRequest.isDraft) {
      return 'bg-purple-600 hover:bg-purple-700 text-white';
    }
    switch (pullRequest.status) {
      case 'Active':
        return 'bg-azure-green hover:bg-green-600 text-white';
      case 'Completed':
        return 'bg-azure-green hover:bg-green-600 text-white';
      case 'Abandoned':
        return 'bg-red-600 hover:bg-red-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  }

  private static getStatusIconSvg(pullRequest: PullRequest): string {
    if (pullRequest.isDraft) {
      return `<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>`;
    }
    switch (pullRequest.status) {
      case 'Active':
        return `<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 10.793a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd"/>
                </svg>`;
      case 'Completed':
        return `<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>`;
      case 'Abandoned':
        return `<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>`;
      default:
        return `<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
                </svg>`;
    }
  }

  // Comment Types Map for easy maintenance
  private static getCommentTemplate(type: string, data: any): string {
    const templates: Record<string, string> = {
      // Merge conflicts resolution with single file and active status
      mergeConflictSingle: `
        <div class="relative">
          <div class="timeline-dot absolute left-4 top-6"></div>
          <div class="flex items-start space-x-4 ml-8">
            <div class="w-8 h-8 bg-azure-blue rounded-full flex items-center justify-center text-white text-sm font-medium">2</div>
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">VS</div>
                <span class="text-white font-medium">Valentine Samuel resolved merge conflicts</span>
                <span class="text-azure-text-dim text-xs">4m ago</span>
              </div>
              <div class="bg-azure-dark rounded-lg border border-azure-border p-4 mb-4">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <div class="w-6 h-6 bg-gray-600 rounded flex items-center justify-center text-white text-xs">TS</div>
                    <div>
                      <div class="text-sm font-medium text-white">customerBulkUpload.service.ts</div>
                      <div class="text-xs text-azure-text-dim">/src/modules/customer/services/customerBulkUpload.service.ts</div>
                    </div>
                  </div>
                  <span class="text-xs text-azure-text-dim">4m ago</span>
                </div>
                <div class="bg-azure-darker rounded-lg border border-azure-border p-4 mt-3">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-2">
                      <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">VS</div>
                      <span class="text-white text-sm">Valentine Samuel</span>
                      <span class="text-azure-text-dim text-xs">4m ago</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <button class="text-azure-text-dim hover:text-white">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                        </svg>
                      </button>
                      <div class="flex items-center space-x-1">
                        <svg class="w-4 h-4 text-azure-text-dim" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/>
                        </svg>
                        <span class="text-azure-text-dim text-xs">Active</span>
                        <svg class="w-4 h-4 text-azure-text-dim" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div class="text-sm text-azure-text mb-3">Submitted conflict resolution for the file(s).</div>
                  <div class="mb-4">
                    <div class="text-azure-blue text-sm hover:underline cursor-pointer">/src/modules/customer/services/customerBulkUpload.service.ts</div>
                  </div>
                  <div class="border-t border-azure-border pt-3">
                    <div class="flex items-center space-x-3">
                      <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">VS</div>
                      <input type="text" placeholder="Write a reply..." class="flex-1 bg-azure-dark border border-azure-border rounded px-3 py-2 text-sm text-azure-text placeholder-azure-text-dim focus:outline-none focus:border-azure-blue"/>
                      <button class="bg-azure-blue hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors">Resolve</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`,

      // Merge conflicts resolution with multiple files and resolved status
      mergeConflictMultiple: `
        <div class="relative">
          <div class="timeline-dot absolute left-4 top-6"></div>
          <div class="flex items-start space-x-4 ml-8">
            <div class="w-8 h-8 bg-azure-blue rounded-full flex items-center justify-center text-white text-sm font-medium">2</div>
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">VS</div>
                <span class="text-white font-medium">Valentine Samuel resolved merge conflicts</span>
                <span class="text-azure-text-dim text-xs">19 Sept</span>
              </div>
              <div class="bg-azure-darker rounded-lg border border-azure-border p-4">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center space-x-2">
                    <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">VS</div>
                    <span class="text-white text-sm">Valentine Samuel</span>
                    <span class="text-azure-text-dim text-xs">19 Sept</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button class="text-azure-text-dim hover:text-white">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                      </svg>
                    </button>
                    <button class="text-azure-text-dim hover:text-white">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"/>
                        <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h8v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
                      </svg>
                    </button>
                    <button class="text-azure-text-dim hover:text-white">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
                      </svg>
                    </button>
                    <div class="flex items-center space-x-1">
                      <svg class="w-4 h-4 text-azure-text-dim" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/>
                      </svg>
                      <span class="text-azure-green text-xs font-medium">Resolved</span>
                      <svg class="w-4 h-4 text-azure-text-dim" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div class="text-sm text-azure-text mb-3">Submitted conflict resolution for the file(s).</div>
                <div class="mb-4">
                  <ul class="list-disc list-inside space-y-1 ml-2">
                    <li class="text-azure-blue text-sm hover:underline cursor-pointer">/src/adapters/cache/providers/redis.provider.ts</li>
                    <li class="text-azure-blue text-sm hover:underline cursor-pointer">/src/configs/redis.config.ts</li>
                    <li class="text-azure-blue text-sm hover:underline cursor-pointer">/src/configs/schema.config.ts</li>
                    <li class="text-azure-blue text-sm hover:underline cursor-pointer">/src/modules/inventory/inventory.module.ts</li>
                    <li class="text-azure-blue text-sm hover:underline cursor-pointer">/src/modules/inventory/jobs/inventorySyncCronJob.service.ts</li>
                    <li class="text-azure-blue text-sm hover:underline cursor-pointer">/src/modules/inventory/services/inventoryCache.service.ts</li>
                    <li class="text-azure-blue text-sm hover:underline cursor-pointer">/src/modules/inventory/usecases/getInventorySyncStatus.usecase.ts</li>
                  </ul>
                </div>
                <div class="border-t border-azure-border pt-3">
                  <div class="flex items-center space-x-3">
                    <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">VS</div>
                    <input type="text" placeholder="Write a reply..." class="flex-1 bg-azure-dark border border-azure-border rounded px-3 py-2 text-sm text-azure-text placeholder-azure-text-dim focus:outline-none focus:border-azure-blue"/>
                    <button class="bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium">Reactivate</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`,

      // Commit push activity
      commitPush: `
        <div class="relative">
          <div class="timeline-dot absolute left-4 top-6"></div>
          <div class="flex items-start space-x-4 ml-8">
            <div class="w-8 h-8 bg-azure-blue rounded-full flex items-center justify-center text-white text-sm font-medium">2</div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">VS</div>
                  <span class="text-white font-medium">Valentine Samuel pushed 1 commit</span>
                </div>
                <span class="text-azure-text-dim text-xs">Friday</span>
              </div>
              <div class="bg-azure-dark rounded-lg border border-azure-border p-4">
                <div class="text-sm text-white mb-2">fix: check for missing dist code</div>
                <div class="flex items-center space-x-3 text-xs text-azure-text-dim">
                  <span class="font-mono bg-azure-darker px-2 py-1 rounded">1d1befdd</span>
                  <div class="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-medium">V</div>
                  <span>valentinesamuel</span>
                  <span>Fri at 13:18</span>
                </div>
              </div>
            </div>
          </div>
        </div>`,

      // Simple activity (approval, creation, etc.)
      simpleActivity: `
        <div class="relative">
          <div class="timeline-dot absolute left-4 top-6"></div>
          <div class="flex items-start space-x-4 ml-8">
            <div class="w-6 h-6 {{avatarClass}} rounded-full flex items-center justify-center text-white text-xs">{{avatar}}</div>
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 {{userAvatarClass}} rounded-full flex items-center justify-center text-white text-xs">{{userAvatar}}</div>
                <span class="text-white text-sm">{{activityText}}</span>
              </div>
              <span class="text-azure-text-dim text-xs">{{timestamp}}</span>
            </div>
          </div>
        </div>`,
    };

    return templates[type] || '';
  }
}
