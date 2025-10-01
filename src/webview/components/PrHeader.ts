import { PullRequest } from '../../pullRequestProvider';
import { StatusHelpers } from '../utils/statusHelpers';
import { Icons } from '../utils/icons';

export class PrHeader {
  static render(pullRequest: PullRequest): string {
    return `
      <div class="bg-vscode-bg rounded-lg border border-vscode-border content-card mb-6">
        <div class="p-8">
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-3 flex-1">
              <div class="w-6 h-6 mt-1">
                ${Icons.azureDevOpsLogo}
              </div>
              <div class="flex-1">
                <h1 class="text-2xl font-medium text-vscode-fg mb-4">
                  Merged PR ${pullRequest.id}: ${pullRequest.title}
                </h1>
                <div class="flex items-center space-x-4 text-sm mb-4">
                  <button class="flex items-center space-x-2 ${StatusHelpers.getStatusButtonClass(pullRequest)} px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                    ${StatusHelpers.getStatusIconSvg(pullRequest)}
                    <span>${pullRequest.isDraft ? 'Draft' : pullRequest.status}</span>
                  </button>
                  <span class="text-vscode-fg opacity-60">12${pullRequest.id.toString().slice(-2)}3</span>
                  <span class="text-vscode-fg opacity-60">Valentine Samuel proposes to merge</span>
                </div>
                <div class="flex items-center space-x-3 text-sm">
                  <div class="flex items-center space-x-2">
                    <span class="bg-vscode-badge-bg text-vscode-badge-fg px-3 py-1 rounded-full text-xs font-medium border border-vscode-border">
                      ${pullRequest.sourceBranch}
                    </span>
                    ${Icons.arrowRight}
                    <span class="bg-vscode-success/20 text-vscode-success px-3 py-1 rounded-full text-xs font-medium border border-vscode-success/30">
                      ${pullRequest.targetBranch}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <button class="bg-vscode-error hover:opacity-80 text-vscode-button-fg px-4 py-2 rounded text-sm font-medium transition-colors">
                Delete source branch
              </button>
              <div class="w-8 h-8 bg-vscode-badge-bg rounded-full flex items-center justify-center text-vscode-badge-fg text-sm">
                VS
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }
}
