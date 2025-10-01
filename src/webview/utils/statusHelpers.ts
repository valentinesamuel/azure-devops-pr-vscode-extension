import { PullRequest } from '../../pullRequestProvider';

export class StatusHelpers {
  static getStatusColor(pullRequest: PullRequest): string {
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

  static getStatusIcon(pullRequest: PullRequest): string {
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

  static getStatusButtonClass(pullRequest: PullRequest): string {
    if (pullRequest.isDraft) {
      return 'bg-purple-600 hover:bg-purple-700 text-vscode-fg';
    }
    switch (pullRequest.status) {
      case 'Active':
        return 'bg-vscode-success hover:bg-green-600 text-vscode-fg';
      case 'Completed':
        return 'bg-vscode-success hover:bg-green-600 text-vscode-fg';
      case 'Abandoned':
        return 'bg-vscode-error hover:bg-red-700 text-vscode-fg';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-vscode-fg';
    }
  }

  static getStatusIconSvg(pullRequest: PullRequest): string {
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
}
