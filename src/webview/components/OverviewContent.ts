import { PullRequest } from '../../pullRequestProvider';
import { StatusComponents } from './StatusComponents';
import { TimelineComponents } from './TimelineComponents';
import { SidebarComponents } from './SidebarComponents';
import { CommentThread, AzureDevOpsProfile } from '../../services/azureDevOpsApiClient';
import { ThreadComponents } from './ThreadComponents';

export class OverviewContent {
  static renderDescription(pullRequest: PullRequest): string {
    return `
      <div class="mb-8">
        <h3 class="text-lg font-medium text-vscode-fg mb-4">Description</h3>
        <div class="bg-vscode-input-bg rounded-lg border border-vscode-input-border p-6 text-sm text-vscode-fg opacity-70">
          ${pullRequest.description || 'Merged PR 21362: feat: add endpoint to update bees order invoice'}
          <ul class="list-disc list-inside mt-4 ml-4 space-y-1">
            <li>chore: remove unused vars</li>
            <li>feat: add endpoint to update bees order invoice</li>
          </ul>
        </div>
      </div>`;
  }

  static renderShowEverythingDropdown(): string {
    return `
      <div class="mb-8">
        <button class="bg-vscode-input-bg border border-vscode-input-border rounded-lg px-4 py-3 text-sm text-vscode-fg opacity-70 hover:opacity-100 transition-colors">
          Show everything (6) ▼
        </button>
      </div>`;
  }

  static renderLeftColumn(
    pullRequest: PullRequest,
    threads: CommentThread[],
    userProfile?: AzureDevOpsProfile,
  ): string {
    return `
      <div class="flex-1 bg-vscode-bg rounded-lg border border-vscode-border content-card overflow-y-auto p-8">
        ${StatusComponents.renderAbandonmentBanner(pullRequest)}
        ${StatusComponents.renderMergeInfo()}
        ${StatusComponents.renderChecksSection()}
        ${this.renderDescription(pullRequest)}
        ${this.renderShowEverythingDropdown()}
        ${TimelineComponents.renderCommentInput(userProfile)}
        ${ThreadComponents.renderAllThreads(threads)}
      </div>`;
  }

  static render(
    pullRequest: PullRequest,
    threads: CommentThread[] = [],
    userProfile?: AzureDevOpsProfile,
  ): string {
    return `
      <div id="overviewContent" class="tab-content flex gap-6 h-full">
        <!-- Left Column - Overview Content -->
        ${this.renderLeftColumn(pullRequest, threads, userProfile)}

        <!-- Right Column - Sidebar -->
        ${SidebarComponents.renderSidebar()}
      </div>`;
  }
}
