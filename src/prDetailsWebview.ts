import * as vscode from 'vscode';
import { PullRequest, Reviewer } from './pullRequestProvider';
import { WebviewLayout } from './webview/components/WebviewLayout';
import {
  AzureDevOpsApiClient,
  CommentThread,
  AzureDevOpsProfile,
  PullRequestFileChange,
  GitCommit,
  PullRequestUpdate,
} from './services/azureDevOpsApiClient';
import { AuthService } from './services/authService';

export class PrDetailsWebviewProvider {
  private static activePanels: Map<number, vscode.WebviewPanel> = new Map();

  /**
   * Enriches reviewer data with team member information from vote threads
   */
  private static enrichReviewersWithTeamMembers(
    reviewers: Reviewer[],
    threads: CommentThread[],
  ): Reviewer[] {
    // Create a map of team ID to members who voted on behalf of that team
    // The data comes from the reviewer's votedFor array
    const teamMemberMap = new Map<
      string,
      Array<{ displayName: string; id: string; uniqueName: string; imageUrl?: string }>
    >();

    // First pass: find reviewers who voted on behalf of teams
    reviewers.forEach((reviewer) => {
      // If this reviewer has votedFor array, they voted on behalf of teams
      if (reviewer.votedFor && reviewer.votedFor.length > 0) {
        reviewer.votedFor.forEach((team: any) => {
          if (team.isContainer) {
            // This reviewer voted on behalf of this team
            const teamId = team.id;
            if (!teamMemberMap.has(teamId)) {
              teamMemberMap.set(teamId, []);
            }
            const members = teamMemberMap.get(teamId)!;
            // Add this reviewer as a member who voted for the team
            if (!members.find((m) => m.id === reviewer.id)) {
              members.push({
                displayName: reviewer.displayName,
                id: reviewer.id,
                uniqueName: reviewer.uniqueName,
                imageUrl: reviewer.imageUrl,
              });
            }
          }
        });
      }
    });

    // Second pass: enrich team reviewers with member information
    const enrichedReviewers = reviewers.map((reviewer) => {
      if (reviewer.isContainer && teamMemberMap.has(reviewer.id)) {
        const enriched = {
          ...reviewer,
          votedFor: teamMemberMap.get(reviewer.id),
        };
        return enriched;
      }
      return reviewer;
    });

    return enrichedReviewers;
  }

  public static async createOrShow(
    extensionUri: vscode.Uri,
    pullRequest: PullRequest,
    authService: AuthService,
  ) {
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

    // Show funny loading state immediately
    panel.webview.html = this.getLoadingContent();

    // Fetch threads and statuses from Azure DevOps
    let threads: CommentThread[] = [];
    let fileChanges: PullRequestFileChange[] = [];
    let commits: GitCommit[] = [];
    let updates: PullRequestUpdate[] = [];
    let userProfile = authService.getUserProfileService().getStoredProfile();
    let sidebarError: { hasError: boolean; message?: string } | undefined;

    try {
      if (pullRequest.repository) {
        const pat = await authService.getPersonalAccessToken();
        if (pat) {
          const apiClient = new AzureDevOpsApiClient({
            organization: pullRequest.repository.organization,
            pat,
          });

          threads = await apiClient.getPullRequestThreads(
            pullRequest.repository.project,
            pullRequest.repository.repository,
            pullRequest.id,
          );

          // Fetch PR statuses
          const statuses = await apiClient.getPullRequestStatuses(
            pullRequest.repository.project,
            pullRequest.repository.repository,
            pullRequest.id,
          );
          pullRequest.statuses = statuses;

          // Fetch file changes
          try {
            fileChanges = await apiClient.getPullRequestFileChanges(
              pullRequest.repository.project,
              pullRequest.repository.repository,
              pullRequest.id,
            );
          } catch (fileError) {
            console.error('Failed to fetch PR file changes:', fileError);
            if (fileError instanceof Error) {
              console.error('Error details:', fileError.message);
            }
          }

          // Fetch commits
          try {
            commits = await apiClient.getPullRequestCommits(
              pullRequest.repository.project,
              pullRequest.repository.repository,
              pullRequest.id,
            );
          } catch (commitError) {
            console.error('Failed to fetch PR commits:', commitError);
            if (commitError instanceof Error) {
              console.error('Error details:', commitError.message);
            }
          }

          // Fetch updates (iterations with commits)
          try {
            updates = await apiClient.getPullRequestUpdates(
              pullRequest.repository.project,
              pullRequest.repository.repository,
              pullRequest.id,
            );
          } catch (updateError) {
            console.error('Failed to fetch PR updates:', updateError);
            if (updateError instanceof Error) {
              console.error('Error details:', updateError.message);
            }
          }

          // Add a synthetic "PR created" thread since Azure DevOps doesn't always include it in threads
          // Get the current user profile to see if they are the creator
          const currentProfile = userProfile;
          const isCurrentUser = currentProfile?.emailAddress === pullRequest.author;

          // For the creator name, use the stored profile if it's the current user, otherwise extract from email
          const creatorDisplayName = isCurrentUser
            ? currentProfile?.displayName || pullRequest.author.split('@')[0]
            : pullRequest.author.split('@')[0];

          const prCreatedThread: CommentThread = {
            id: -1, // Negative ID to indicate synthetic
            publishedDate: pullRequest.createdDate.toISOString(),
            comments: [
              {
                id: -1,
                author: {
                  displayName: creatorDisplayName,
                  id: 'creator',
                  uniqueName: pullRequest.author,
                },
                content: `${creatorDisplayName} created the pull request`,
                publishedDate: pullRequest.createdDate.toISOString(),
                commentType: 'system',
              },
            ],
            properties: {
              CodeReviewThreadType: {
                $value: 'PullRequestCreated',
              },
            },
          };

          threads.push(prCreatedThread);

          // Enrich reviewer data with team member information from threads
          if (pullRequest.reviewersDetailed) {
            pullRequest.reviewersDetailed = this.enrichReviewersWithTeamMembers(
              pullRequest.reviewersDetailed,
              threads,
            );
          }
        } else {
          // No PAT token - set sidebar error
          sidebarError = {
            hasError: true,
            message: 'Authentication required. Please sign in to view PR details.',
          };
        }
      } else {
        // No repository info - set sidebar error
        sidebarError = {
          hasError: true,
          message: 'Repository information not available.',
        };
      }
    } catch (error) {
      console.error('Failed to fetch PR data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      vscode.window.showWarningMessage(`Failed to load PR #${pullRequest.id}: ${errorMessage}`);
      // Set sidebar error
      sidebarError = {
        hasError: true,
        message: `Failed to load PR data: ${errorMessage}`,
      };
    }

    panel.webview.html = this.getWebviewContent(
      panel.webview,
      extensionUri,
      pullRequest,
      threads,
      userProfile,
      fileChanges,
      commits,
      updates,
      sidebarError,
    );

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'refreshPR':
            await this.handleRefreshPR(panel, pullRequest, authService, extensionUri);
            break;
          case 'openInBrowser':
            if (pullRequest.repository) {
              const prUrl = `https://dev.azure.com/${pullRequest.repository.organization}/${pullRequest.repository.project}/_git/${pullRequest.repository.repository}/pullrequest/${pullRequest.id}`;
              vscode.env.openExternal(vscode.Uri.parse(prUrl));
            } else {
              vscode.window.showWarningMessage(
                'Unable to open PR in browser: repository information not available',
              );
            }
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
          case 'addComment':
            vscode.window.showInformationMessage(
              `Adding comment to PR #${message.prId}: "${message.text}"`,
            );
            // TODO: Implement actual comment posting to Azure DevOps API
            // For now, just show a placeholder message
            break;
          case 'updateDescription':
            try {
              if (pullRequest.repository) {
                const pat = await authService.getPersonalAccessToken();
                if (pat) {
                  const apiClient = new AzureDevOpsApiClient({
                    organization: pullRequest.repository.organization,
                    pat,
                  });

                  await apiClient.updatePullRequestDescription(
                    pullRequest.repository.project,
                    pullRequest.repository.repository,
                    message.prId,
                    message.description,
                  );

                  vscode.window.showInformationMessage(
                    `Successfully updated description for PR #${message.prId}`,
                  );
                }
              }
            } catch (error) {
              vscode.window.showErrorMessage(
                `Failed to update PR description: ${error instanceof Error ? error.message : 'Unknown error'}`,
              );
            }
            break;
          case 'getFileDiff':
            try {
              if (pullRequest.repository) {
                const pat = await authService.getPersonalAccessToken();
                if (pat) {
                  const apiClient = new AzureDevOpsApiClient({
                    organization: pullRequest.repository.organization,
                    pat,
                  });

                  // Get iterations to find the latest one
                  const iterations = await apiClient.getPullRequestIterations(
                    pullRequest.repository.project,
                    pullRequest.repository.repository,
                    pullRequest.id,
                  );

                  if (iterations.length > 0) {
                    const latestIteration = iterations[iterations.length - 1];

                    // Get the source and target commit SHAs from the iteration
                    const sourceCommit = latestIteration.sourceRefCommit?.commitId;
                    const targetCommit = latestIteration.targetRefCommit?.commitId;

                    // Fetch both versions of the file
                    let oldContent = '';
                    let newContent = '';

                    try {
                      if (targetCommit && message.changeType !== 'add') {
                        oldContent = await apiClient.getFileContent(
                          pullRequest.repository.project,
                          pullRequest.repository.repository,
                          message.filePath,
                          targetCommit,
                        );
                      }
                    } catch (e) {
                      console.log('Could not fetch old content (file might be new)');
                    }

                    try {
                      if (sourceCommit && message.changeType !== 'delete') {
                        newContent = await apiClient.getFileContent(
                          pullRequest.repository.project,
                          pullRequest.repository.repository,
                          message.filePath,
                          sourceCommit,
                        );
                      }
                    } catch (e) {
                      console.log('Could not fetch new content (file might be deleted)');
                    }

                    // Send diff back to webview
                    panel.webview.postMessage({
                      command: 'fileDiffResponse',
                      filePath: message.filePath,
                      oldContent,
                      newContent,
                      changeType: message.changeType,
                      fileIndex: message.fileIndex,
                      fileName: message.fileName,
                      viewMode: message.viewMode,
                      error: false,
                    });
                  } else {
                    // No iterations found - send error
                    panel.webview.postMessage({
                      command: 'fileDiffResponse',
                      filePath: message.filePath,
                      fileIndex: message.fileIndex,
                      fileName: message.fileName,
                      error: true,
                      errorMessage: 'No PR iterations found',
                    });
                  }
                } else {
                  // No PAT - send error
                  panel.webview.postMessage({
                    command: 'fileDiffResponse',
                    filePath: message.filePath,
                    fileIndex: message.fileIndex,
                    fileName: message.fileName,
                    error: true,
                    errorMessage: 'Authentication required',
                  });
                }
              } else {
                // No repository info - send error
                panel.webview.postMessage({
                  command: 'fileDiffResponse',
                  filePath: message.filePath,
                  fileIndex: message.fileIndex,
                  fileName: message.fileName,
                  error: true,
                  errorMessage: 'Repository information not available',
                });
              }
            } catch (error) {
              console.error('Error fetching file diff:', error);

              // Send error to webview
              panel.webview.postMessage({
                command: 'fileDiffResponse',
                filePath: message.filePath,
                fileIndex: message.fileIndex,
                fileName: message.fileName,
                error: true,
                errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
              });

              vscode.window.showErrorMessage(
                `Failed to fetch file diff: ${error instanceof Error ? error.message : 'Unknown error'}`,
              );
            }
            break;
          case 'openFileDiff':
            try {
              if (pullRequest.repository) {
                const pat = await authService.getPersonalAccessToken();
                if (pat) {
                  const apiClient = new AzureDevOpsApiClient({
                    organization: pullRequest.repository.organization,
                    pat,
                  });

                  // Get iterations to find the latest one
                  const iterations = await apiClient.getPullRequestIterations(
                    pullRequest.repository.project,
                    pullRequest.repository.repository,
                    pullRequest.id,
                  );

                  if (iterations.length > 0) {
                    const latestIteration = iterations[iterations.length - 1];
                    const sourceCommit = latestIteration.sourceRefCommit?.commitId;
                    const targetCommit = latestIteration.targetRefCommit?.commitId;

                    // Fetch both versions of the file
                    let oldContent = '';
                    let newContent = '';

                    try {
                      if (targetCommit && message.changeType !== 'add') {
                        oldContent = await apiClient.getFileContent(
                          pullRequest.repository.project,
                          pullRequest.repository.repository,
                          message.filePath,
                          targetCommit,
                        );
                      }
                    } catch (e) {
                      console.log('Could not fetch old content (file might be new)');
                    }

                    try {
                      if (sourceCommit && message.changeType !== 'delete') {
                        newContent = await apiClient.getFileContent(
                          pullRequest.repository.project,
                          pullRequest.repository.repository,
                          message.filePath,
                          sourceCommit,
                        );
                      }
                    } catch (e) {
                      console.log('Could not fetch new content (file might be deleted)');
                    }

                    // Create virtual documents for the diff view with file extensions for syntax highlighting
                    const oldUri = vscode.Uri.parse(
                      `azure-devops-pr-diff:/${message.filePath}`,
                    ).with({
                      query: JSON.stringify({
                        content: oldContent,
                        path: message.filePath,
                        side: 'base',
                      }),
                    });

                    const newUri = vscode.Uri.parse(
                      `azure-devops-pr-diff:/${message.filePath}`,
                    ).with({
                      query: JSON.stringify({
                        content: newContent,
                        path: message.filePath,
                        side: 'pr',
                      }),
                    });

                    // Open diff view with proper titles
                    await vscode.commands.executeCommand(
                      'vscode.diff',
                      oldUri,
                      newUri,
                      `${message.fileName} (Base ↔ PR)`,
                      { preview: false },
                    );
                  }
                }
              }
            } catch (error) {
              console.error('Error opening file diff:', error);
              vscode.window.showErrorMessage(
                `Failed to open file diff: ${error instanceof Error ? error.message : 'Unknown error'}`,
              );
            }
            break;
          case 'searchIdentities':
            try {
              console.log('=== Message Handler: searchIdentities ===');
              console.log('Query:', message.query);
              console.log('Type:', message.type);
              console.log('Has repository:', !!pullRequest.repository);

              if (pullRequest.repository) {
                const pat = await authService.getPersonalAccessToken();
                console.log('Has PAT:', !!pat);

                if (pat) {
                  const apiClient = new AzureDevOpsApiClient({
                    organization: pullRequest.repository.organization,
                    pat,
                  });

                  // Search for identities
                  console.log('Calling searchIdentities API...');
                  const results = await apiClient.searchIdentities(
                    message.query,
                    pullRequest.repository.project,
                  );

                  console.log('Search results count:', results.length);
                  console.log('Results:', JSON.stringify(results, null, 2));

                  // Send results back to webview
                  console.log('Sending results to webview...');
                  panel.webview.postMessage({
                    command: 'searchResultsResponse',
                    results: results,
                    type: message.type,
                  });
                  console.log('=== End Message Handler ===');
                } else {
                  console.error('No PAT available');
                }
              } else {
                console.error('No repository information');
              }
            } catch (error) {
              console.error('=== Message Handler Error ===');
              console.error('Error searching identities:', error);
              if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
              }
              // Send empty results on error
              panel.webview.postMessage({
                command: 'searchResultsResponse',
                results: [],
                type: message.type,
              });
              console.error('=== End Message Handler Error ===');
            }
            break;
          case 'addReviewerToPR':
            try {
              if (pullRequest.repository) {
                const pat = await authService.getPersonalAccessToken();
                if (pat) {
                  const apiClient = new AzureDevOpsApiClient({
                    organization: pullRequest.repository.organization,
                    pat,
                  });

                  // Add the reviewer to the PR
                  const isRequired = message.type === 'required';
                  await apiClient.addReviewerToPR(
                    pullRequest.repository.project,
                    pullRequest.repository.repository,
                    message.prId,
                    message.identity.id,
                    isRequired,
                  );

                  vscode.window.showInformationMessage(
                    `Successfully added ${message.identity.displayName} as ${message.type} reviewer`,
                  );

                  // Refresh the PR to show the new reviewer
                  await this.handleRefreshPR(panel, pullRequest, authService, extensionUri);
                }
              }
            } catch (error) {
              vscode.window.showErrorMessage(
                `Failed to add reviewer: ${error instanceof Error ? error.message : 'Unknown error'}`,
              );
            }
            break;
        }
      },
      undefined,
      [],
    );
  }

  private static getLoadingContent(): string {
    const loadingMessages = [
      'Convincing the code to behave...',
      'Asking Azure DevOps nicely for your data...',
      'Hunting down those elusive commits...',
      'Teaching the API manners...',
      'Bribing the servers with cookies...',
      'Negotiating with the cloud...',
      'Downloading the internet (just your PR though)...',
      'Performing code archaeology...',
      'Summoning the commit spirits...',
      'Translating git history from ancient scrolls...',
      'Waiting for Azure DevOps to finish its coffee break...',
      'Untangling the spaghetti code...',
      'Asking ChatGPT where your commits went...',
      'Reticulating splines...',
      'Charging flux capacitor...',
    ];

    const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      font-family: var(--vscode-font-family);
      overflow: hidden;
    }

    .loading-container {
      text-align: center;
      padding: 2rem;
      max-width: 500px;
    }

    .spinner {
      width: 80px;
      height: 80px;
      margin: 0 auto 2rem;
      position: relative;
    }

    .spinner-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 4px solid transparent;
      border-top-color: var(--vscode-progressBar-background);
      border-radius: 50%;
      animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    }

    .spinner-ring:nth-child(1) {
      animation-delay: -0.45s;
    }

    .spinner-ring:nth-child(2) {
      animation-delay: -0.3s;
      border-top-color: var(--vscode-button-background);
    }

    .spinner-ring:nth-child(3) {
      animation-delay: -0.15s;
      border-top-color: var(--vscode-textLink-foreground);
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .loading-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      background: linear-gradient(
        90deg,
        var(--vscode-textLink-foreground),
        var(--vscode-button-background),
        var(--vscode-textLink-foreground)
      );
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s linear infinite;
    }

    @keyframes shimmer {
      to {
        background-position: 200% center;
      }
    }

    .loading-message {
      font-size: 1rem;
      opacity: 0.8;
      margin-bottom: 0.5rem;
    }

    .loading-dots {
      font-size: 1.2rem;
      font-weight: bold;
      display: inline-block;
      animation: blink 1.4s infinite;
    }

    .loading-dots::after {
      content: '...';
      animation: dots 1.4s steps(4, end) infinite;
    }

    @keyframes dots {
      0%, 20% {
        content: '.';
      }
      40% {
        content: '..';
      }
      60%, 100% {
        content: '...';
      }
    }

    .pr-icon {
      width: 60px;
      height: 60px;
      margin: 0 auto 1.5rem;
      opacity: 0.6;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    .fun-fact {
      margin-top: 2rem;
      padding: 1rem;
      background-color: var(--vscode-input-background);
      border-radius: 8px;
      font-size: 0.85rem;
      opacity: 0.7;
      border-left: 3px solid var(--vscode-textLink-foreground);
    }

    .fun-fact-title {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--vscode-textLink-foreground);
    }
  </style>
</head>
<body>
  <div class="loading-container">
    <svg class="pr-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.177 3.073L9.573.677A2.25 2.25 0 0 1 13.192.646L15.293.829A2.25 2.25 0 0 1 16.92 2.456L17.103 4.557A2.25 2.25 0 0 1 16.097 6.578L15.112 7.563L8.163 14.512L6.099 12.448L13.048 5.5L12.866 3.398L10.462 3.215L7.177 6.5L9.241 8.564L8.534 9.271L7.534 10.271L6.241 8.978L3.241 11.978L5.305 14.042L4.598 14.75L3.891 15.457L1.827 13.393L.12 15.1A2.25 2.25 0 0 0 .152 18.719L.335 20.82A2.25 2.25 0 0 0 1.962 22.447L4.063 22.63A2.25 2.25 0 0 0 6.084 21.624L7.891 19.817L5.827 17.753L8.827 14.753L10.12 16.046L11.12 15.046L11.827 14.339L9.763 12.275L12.763 9.275L15.827 12.339L17.891 10.275L14.827 7.211L17.827 4.211L19.12 5.504L20.12 4.504L20.827 3.797L18.763 1.733L20.57.926A2.25 2.25 0 0 1 24.189.958L26.29 1.141A2.25 2.25 0 0 1 27.917 2.768L28.1 4.869A2.25 2.25 0 0 1 27.094 6.89L23.809 10.175L21.745 8.111L18.745 11.111L20.809 13.175L18.745 15.239L16.681 13.175L13.681 16.175L15.745 18.239L14.745 19.239L14.038 19.946L11.974 17.882L8.974 20.882L11.038 22.946L9.331 24.653A2.25 2.25 0 0 1 5.712 24.621L3.611 24.438A2.25 2.25 0 0 1 1.984 22.811L1.801 20.71A2.25 2.25 0 0 1 2.807 18.689L4.514 16.982L6.578 19.046L9.578 16.046L7.514 13.982L10.514 10.982L12.578 13.046L13.578 12.046L14.285 11.339L12.221 9.275L15.221 6.275L17.285 8.339L19.349 6.275L17.285 4.211L20.57 0.926Z"/>
    </svg>

    <div class="spinner">
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
    </div>

    <h1 class="loading-title">Loading Pull Request</h1>
    <p class="loading-message">${randomMessage}</p>
    <div class="loading-dots"></div>

    <div class="fun-fact">
      <div class="fun-fact-title">💡 Pro Tip</div>
      <div>While you wait: Remember, the best code is no code at all. But since we're already here... ☕</div>
    </div>
  </div>
</body>
</html>`;
  }

  private static async handleRefreshPR(
    panel: vscode.WebviewPanel,
    pullRequest: PullRequest,
    authService: AuthService,
    extensionUri: vscode.Uri,
  ) {
    try {
      // Refetch all PR data
      let threads: CommentThread[] = [];
      let fileChanges: PullRequestFileChange[] = [];
      let commits: GitCommit[] = [];
      let updates: PullRequestUpdate[] = [];
      let userProfile = authService.getUserProfileService().getStoredProfile();
      let sidebarError: { hasError: boolean; message?: string } | undefined;

      if (pullRequest.repository) {
        const pat = await authService.getPersonalAccessToken();
        if (pat) {
          const apiClient = new AzureDevOpsApiClient({
            organization: pullRequest.repository.organization,
            pat,
          });

          // Fetch all data in parallel for better performance
          const [threadsResult, statusesResult, fileChangesResult, commitsResult, updatesResult] =
            await Promise.allSettled([
              apiClient.getPullRequestThreads(
                pullRequest.repository.project,
                pullRequest.repository.repository,
                pullRequest.id,
              ),
              apiClient.getPullRequestStatuses(
                pullRequest.repository.project,
                pullRequest.repository.repository,
                pullRequest.id,
              ),
              apiClient.getPullRequestFileChanges(
                pullRequest.repository.project,
                pullRequest.repository.repository,
                pullRequest.id,
              ),
              apiClient.getPullRequestCommits(
                pullRequest.repository.project,
                pullRequest.repository.repository,
                pullRequest.id,
              ),
              apiClient.getPullRequestUpdates(
                pullRequest.repository.project,
                pullRequest.repository.repository,
                pullRequest.id,
              ),
            ]);

          // Extract results
          if (threadsResult.status === 'fulfilled') {
            threads = threadsResult.value;
          }
          if (statusesResult.status === 'fulfilled') {
            pullRequest.statuses = statusesResult.value;
          }
          if (fileChangesResult.status === 'fulfilled') {
            fileChanges = fileChangesResult.value;
          }
          if (commitsResult.status === 'fulfilled') {
            commits = commitsResult.value;
          }
          if (updatesResult.status === 'fulfilled') {
            updates = updatesResult.value;
          }

          // Add synthetic PR created thread
          const currentProfile = userProfile;
          const isCurrentUser = currentProfile?.emailAddress === pullRequest.author;
          const creatorDisplayName = isCurrentUser
            ? currentProfile?.displayName || pullRequest.author.split('@')[0]
            : pullRequest.author.split('@')[0];

          const prCreatedThread: CommentThread = {
            id: -1,
            publishedDate: pullRequest.createdDate.toISOString(),
            comments: [
              {
                id: -1,
                author: {
                  displayName: creatorDisplayName,
                  id: 'creator',
                  uniqueName: pullRequest.author,
                },
                content: `${creatorDisplayName} created the pull request`,
                publishedDate: pullRequest.createdDate.toISOString(),
                commentType: 'system',
              },
            ],
            properties: {
              CodeReviewThreadType: {
                $value: 'PullRequestCreated',
              },
            },
          };

          threads.push(prCreatedThread);

          // Enrich reviewer data
          if (pullRequest.reviewersDetailed) {
            pullRequest.reviewersDetailed = this.enrichReviewersWithTeamMembers(
              pullRequest.reviewersDetailed,
              threads,
            );
          }
        } else {
          // No PAT token - set sidebar error
          sidebarError = {
            hasError: true,
            message: 'Authentication required. Please sign in to view PR details.',
          };
        }
      } else {
        // No repository info - set sidebar error
        sidebarError = {
          hasError: true,
          message: 'Repository information not available.',
        };
      }

      // Update the webview content
      panel.webview.html = this.getWebviewContent(
        panel.webview,
        extensionUri,
        pullRequest,
        threads,
        userProfile,
        fileChanges,
        commits,
        updates,
        sidebarError,
      );

      // Notify webview that refresh is complete
      panel.webview.postMessage({
        command: 'refreshComplete',
      });

      vscode.window.showInformationMessage(`PR #${pullRequest.id} refreshed successfully`);
    } catch (error) {
      console.error('Failed to refresh PR:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      vscode.window.showErrorMessage(`Failed to refresh PR: ${errorMessage}`);

      // Update webview with error state in sidebar
      const sidebarError = {
        hasError: true,
        message: `Failed to refresh PR data: ${errorMessage}`,
      };

      panel.webview.html = this.getWebviewContent(
        panel.webview,
        extensionUri,
        pullRequest,
        [],
        authService.getUserProfileService().getStoredProfile(),
        [],
        [],
        [],
        sidebarError,
      );

      // Still notify webview to hide the loading overlay
      panel.webview.postMessage({
        command: 'refreshComplete',
      });
    }
  }

  private static getWebviewContent(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    pullRequest: PullRequest,
    threads: CommentThread[],
    userProfile?: AzureDevOpsProfile,
    fileChanges?: PullRequestFileChange[],
    commits?: GitCommit[],
    updates?: PullRequestUpdate[],
    sidebarError?: { hasError: boolean; message?: string },
  ): string {
    return WebviewLayout.render(
      pullRequest,
      threads,
      userProfile,
      fileChanges,
      commits,
      updates,
      sidebarError,
    );
  }
}
