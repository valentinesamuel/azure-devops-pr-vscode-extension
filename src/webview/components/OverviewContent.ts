import { PullRequest } from '../../pullRequestProvider';
import { StatusComponents } from './StatusComponents';
import { TimelineComponents } from './TimelineComponents';
import { SidebarComponents } from './SidebarComponents';
import { CommentThread, AzureDevOpsProfile } from '../../services/azureDevOpsApiClient';
import { ThreadComponents } from './ThreadComponents';

export class OverviewContent {
  static renderDescription(pullRequest: PullRequest): string {
    const description = pullRequest.description || 'No description provided';
    // Convert newlines to <br> tags for proper rendering
    const formattedDescription = description.replace(/\n/g, '<br>');
    const isActive = pullRequest.status === 'Active';

    // Escape the description for use in JavaScript
    const escapedDescription = (pullRequest.description || '')
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');

    return `
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-vscode-fg">Description</h3>
          ${isActive ? `<button id="editDescriptionBtn" onclick="editDescription('${escapedDescription}')" class="text-vscode-link text-sm hover:underline">Edit</button>` : ''}
        </div>
        <div id="descriptionDisplay" class="bg-vscode-input-bg rounded-lg border border-vscode-input-border p-6 text-sm text-vscode-fg opacity-70 whitespace-pre-wrap">
          ${formattedDescription}
        </div>
        <div id="descriptionEdit" class="hidden space-y-3">
          <textarea
            id="descriptionTextarea"
            rows="8"
            class="w-full bg-vscode-input-bg border border-vscode-input-border rounded-lg px-4 py-3 text-sm text-vscode-fg placeholder-vscode-fg opacity-60 focus:outline-none focus:border-vscode-link resize-none"
          ></textarea>
          <div class="flex justify-end space-x-2">
            <button
              id="cancelDescriptionBtn"
              onclick="cancelEditDescription('${escapedDescription}')"
              class="px-4 py-2 text-sm text-vscode-fg opacity-60 hover:opacity-100 rounded transition-opacity"
            >
              Cancel
            </button>
            <button
              id="saveDescriptionBtn"
              onclick="saveDescription()"
              class="px-4 py-2 text-sm bg-vscode-button-bg text-vscode-button-fg hover:bg-vscode-button-hover rounded transition-colors"
            >
              Save
            </button>
          </div>
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
        ${StatusComponents.renderMergeInfo(pullRequest)}
        ${StatusComponents.renderChecksSection(pullRequest.statuses)}
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
        ${SidebarComponents.renderSidebar(pullRequest.reviewersDetailed)}
      </div>`;
  }
}
