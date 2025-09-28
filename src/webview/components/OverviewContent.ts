import { PullRequest } from '../../pullRequestProvider';
import { StatusComponents } from './StatusComponents';
import { TimelineComponents } from './TimelineComponents';
import { SidebarComponents } from './SidebarComponents';

export class OverviewContent {
  static renderDescription(pullRequest: PullRequest): string {
    return `
      <div class="mb-8">
        <h3 class="text-lg font-medium text-white mb-4">Description</h3>
        <div class="bg-azure-dark rounded-lg border border-azure-border p-6 text-sm text-azure-text-dim">
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
        <button class="bg-azure-dark border border-azure-border rounded-lg px-4 py-3 text-sm text-azure-text-dim hover:bg-azure-border transition-colors">
          Show everything (6) ▼
        </button>
      </div>`;
  }

  static renderLeftColumn(pullRequest: PullRequest): string {
    return `
      <div class="flex-1 bg-azure-darker rounded-lg border border-azure-border content-card overflow-y-auto p-8">
        ${StatusComponents.renderAbandonmentBanner(pullRequest)}
        ${StatusComponents.renderMergeInfo()}
        ${StatusComponents.renderChecksSection()}
        ${this.renderDescription(pullRequest)}
        ${this.renderShowEverythingDropdown()}
        ${TimelineComponents.renderCommentInput()}
        ${TimelineComponents.renderTimelineSection()}
      </div>`;
  }

  static render(pullRequest: PullRequest): string {
    return `
      <div id="overviewContent" class="tab-content flex gap-6 h-full">
        <!-- Left Column - Overview Content -->
        ${this.renderLeftColumn(pullRequest)}

        <!-- Right Column - Sidebar -->
        ${SidebarComponents.renderSidebar()}
      </div>`;
  }
}
