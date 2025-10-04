import { PullRequest } from '../../pullRequestProvider';
import { PullRequestStatus } from '../../services/azureDevOpsApiClient';
import { Icons } from '../utils/icons';

export class StatusComponents {
  static renderAbandonmentBanner(pullRequest: PullRequest): string {
    if (pullRequest.status !== 'Abandoned') {
      return '';
    }

    return `
      <div class="mb-8">
        <div class="flex items-center bg-vscode-error/20 border border-vscode-error/30 rounded-lg p-4 mb-6">
          ${Icons.warning}
          <span class="text-vscode-error">The pull request was abandoned 19 Aug</span>
        </div>
      </div>`;
  }

  static renderMergeInfo(pullRequest: PullRequest): string {
    // Only show if PR is completed/merged
    if (pullRequest.status !== 'Completed' || !pullRequest.closedDate) {
      return '';
    }

    const formatDate = (date: Date): string => {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day - show time
        return date.toLocaleString('en-US', {
          weekday: 'short',
          hour: 'numeric',
          minute: '2-digit',
          hour12: false,
        });
      } else if (diffDays < 7) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString();
      }
    };

    const mergedBy = pullRequest.closedBy || 'Unknown';
    const mergeDate = formatDate(pullRequest.closedDate);
    const commitHash = pullRequest.mergeCommitId || 'unknown';

    return `
      <div class="bg-vscode-input-bg rounded-lg border border-vscode-input-border merge-info-card p-6 mb-6">
        <div class="text-sm text-vscode-fg opacity-70 mb-3">
          Merged PR #${pullRequest.id}: ${pullRequest.title}
        </div>
        <div class="text-xs text-vscode-fg opacity-70 mb-3">
          ${commitHash}
          <svg class="inline w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414L2.586 7l3.707-3.707a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          ${mergedBy} ${mergeDate}
        </div>
        <button class="text-vscode-link text-sm hover:underline">Show details</button>
      </div>`;
  }

  static renderChecksSection(statuses?: PullRequestStatus[]): string {
    if (!statuses || statuses.length === 0) {
      // No checks to display
      return '';
    }

    // Group statuses by state
    const succeededChecks = statuses.filter((s) => s.state === 'succeeded');
    const failedChecks = statuses.filter((s) => s.state === 'failed' || s.state === 'error');
    const pendingChecks = statuses.filter((s) => s.state === 'pending');
    const notApplicableChecks = statuses.filter(
      (s) => s.state === 'notApplicable' || s.state === 'notSet',
    );

    const totalChecks = statuses.length;
    let checksHtml = '';

    // Render succeeded checks summary
    if (succeededChecks.length > 0) {
      checksHtml += `
        <div class="bg-vscode-success/20 border border-vscode-success/30 rounded-lg p-4">
          <div class="flex items-center space-x-3">
            <div class="w-5 h-5 bg-vscode-success rounded-full flex items-center justify-center text-vscode-button-fg">
              ${Icons.check}
            </div>
            <span class="text-sm font-medium text-vscode-fg">${succeededChecks.length} check${succeededChecks.length > 1 ? 's' : ''} succeeded</span>
          </div>
        </div>`;
    }

    // Render failed checks summary
    if (failedChecks.length > 0) {
      checksHtml += `
        <div class="bg-vscode-error/20 border border-vscode-error/30 rounded-lg p-4">
          <div class="flex items-center space-x-3">
            <div class="w-5 h-5 bg-vscode-error rounded-full flex items-center justify-center text-vscode-button-fg">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </div>
            <span class="text-sm font-medium text-vscode-fg">${failedChecks.length} check${failedChecks.length > 1 ? 's' : ''} failed</span>
          </div>
        </div>`;
    }

    // Render pending checks summary
    if (pendingChecks.length > 0) {
      checksHtml += `
        <div class="bg-vscode-warning/20 border border-vscode-warning/30 rounded-lg p-4">
          <div class="flex items-center space-x-3">
            <div class="w-5 h-5 bg-vscode-warning rounded-full flex items-center justify-center text-vscode-button-fg">
              ${Icons.clock}
            </div>
            <span class="text-sm font-medium text-vscode-fg">${pendingChecks.length} check${pendingChecks.length > 1 ? 's' : ''} pending</span>
          </div>
        </div>`;
    }

    // Render not applicable checks summary
    if (notApplicableChecks.length > 0) {
      checksHtml += `
        <div class="flex items-center space-x-2 ml-8">
          <svg class="w-4 h-4 text-vscode-fg opacity-60" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          <span class="text-xs text-vscode-fg opacity-60">${notApplicableChecks.length} check${notApplicableChecks.length > 1 ? 's' : ''} not applicable</span>
        </div>`;
    }

    return `
      <div class="space-y-4 mb-8">
        ${checksHtml}

        <!-- View checks link -->
        <div class="ml-8">
          <button id="toggleChecksPanel" class="text-vscode-link text-sm hover:underline flex items-center space-x-1">
            <span>View ${totalChecks} check${totalChecks > 1 ? 's' : ''}</span>
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>`;
  }
}
