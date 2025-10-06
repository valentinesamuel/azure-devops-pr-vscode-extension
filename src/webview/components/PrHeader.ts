import { PullRequest } from '../../pullRequestProvider';
import { StatusHelpers } from '../utils/statusHelpers';
import { Icons } from '../utils/icons';

export class PrHeader {
  static render(pullRequest: PullRequest): string {
    return `
      <div class="bg-vscode-bg rounded-xl border border-vscode-border content-card mb-6 overflow-hidden modern-card">
        <div class="p-8 bg-gradient-to-br from-transparent to-azure/5">
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-4 flex-1">
              <div class="w-10 h-10 mt-1 flex items-center justify-center rounded-lg">
                ${Icons.azureDevOpsLogo}
              </div>
              <div class="flex-1">
                <h1 class="text-3xl font-bold text-vscode-fg mb-5 tracking-tight">
                  <span class="text-azure font-semibold">PR #${pullRequest.id}</span> ${pullRequest.title}
                </h1>
                <div class="flex items-center space-x-4 text-sm mb-5">
                  <button class="flex items-center space-x-2 ${StatusHelpers.getStatusButtonClass(pullRequest)} px-4 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-sm hover:shadow-md">
                    ${StatusHelpers.getStatusIconSvg(pullRequest)}
                    <span>${pullRequest.isDraft ? 'Draft' : pullRequest.status}</span>
                  </button>
                  <span class="text-vscode-fg opacity-50 text-xs">•</span>
                  <span class="text-vscode-fg opacity-60 font-medium">12${pullRequest.id.toString().slice(-2)}3</span>
                  <span class="text-vscode-fg opacity-50 text-xs">•</span>
                  <span class="text-vscode-fg opacity-60">Valentine Samuel proposes to merge</span>
                </div>
                <div class="flex items-center space-x-3 text-sm">
                  <div class="flex items-center space-x-3 bg-vscode-input-bg/50 px-4 py-2.5 rounded-lg">
                    <div class="flex items-center gap-2">
                      <span class="bg-azure/20 text-azure px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm">
                        ${pullRequest.sourceBranch}
                      </span>
                      <button
                        onclick="copyBranchName('${pullRequest.sourceBranch}')"
                        class="copy-branch-btn hover:bg-azure/20 p-1.5 rounded transition-all opacity-60 hover:opacity-100"
                        title="Copy branch name"
                      >
                        <svg class="w-3.5 h-3.5 text-azure" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                      </button>
                    </div>
                    <div class="text-vscode-fg opacity-40">
                      ${Icons.arrowRight}
                    </div>
                    <span class="bg-success-green/20 text-success-green px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm">
                      ${pullRequest.targetBranch}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <button
                onclick="handleViewOnWeb()"
                class="flex items-center space-x-2 border-1.5 border-vscode-border hover:border-azure hover:bg-vscode-hover text-vscode-fg px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                title="View on Azure DevOps"
              >
                <svg class="view-web-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                <span>View on Web</span>
              </button>
              <button class="bg-vscode-error hover:bg-vscode-error/80 text-vscode-button-fg px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
                Delete source branch
              </button>             
            </div>
          </div>
        </div>
      </div>`;
  }
}
