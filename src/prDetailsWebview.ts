import * as vscode from 'vscode';
import { PullRequest, Reviewer } from './pullRequestProvider';
import { WebviewLayout } from './webview/components/WebviewLayout';
import {
  AzureDevOpsApiClient,
  CommentThread,
  AzureDevOpsProfile,
  PullRequestFileChange,
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

    // Fetch threads and statuses from Azure DevOps
    let threads: CommentThread[] = [];
    let fileChanges: PullRequestFileChange[] = [];
    let userProfile = authService.getUserProfileService().getStoredProfile();
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
        }
      }
    } catch (error) {
      console.error('Failed to fetch PR threads:', error);
      vscode.window.showWarningMessage(
        `Failed to load comments for PR #${pullRequest.id}. Using dummy data.`,
      );
    }

    panel.webview.html = this.getWebviewContent(
      panel.webview,
      extensionUri,
      pullRequest,
      threads,
      userProfile,
      fileChanges,
    );

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
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
    threads: CommentThread[],
    userProfile?: AzureDevOpsProfile,
    fileChanges?: PullRequestFileChange[],
  ): string {
    return WebviewLayout.render(pullRequest, threads, userProfile, fileChanges);
  }
}
