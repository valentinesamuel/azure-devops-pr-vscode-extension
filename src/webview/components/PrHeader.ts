import { PullRequest } from '../../pullRequestProvider';
import { StatusHelpers } from '../utils/statusHelpers';
import { Icons } from '../utils/icons';

export class PrHeader {
  static render(pullRequest: PullRequest): string {
    return `
      <div class="bg-azure-darker rounded-lg border border-azure-border content-card mb-6">
        <div class="p-8">
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-3 flex-1">
              <div class="w-6 h-6 mt-1">
                ${Icons.azureDevOpsLogo}
              </div>
              <div class="flex-1">
                <h1 class="text-2xl font-medium text-white mb-4">
                  Merged PR ${pullRequest.id}: ${pullRequest.title}
                </h1>
                <div class="flex items-center space-x-4 text-sm mb-4">
                  <button class="flex items-center space-x-2 ${StatusHelpers.getStatusButtonClass(pullRequest)} px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                    ${StatusHelpers.getStatusIconSvg(pullRequest)}
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
                    ${Icons.arrowRight}
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
      </div>`;
  }
}
