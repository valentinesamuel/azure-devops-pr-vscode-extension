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
          <h3 class="text-lg font-semibold text-vscode-fg flex items-center gap-2">
            <span class="text-xl">📝</span>
            <span>Description</span>
          </h3>
          ${isActive ? `<button id="editDescriptionBtn" onclick="editDescription('${escapedDescription}')" class="text-azure text-sm font-medium hover:underline transition-all hover:text-azure/80">Edit</button>` : ''}
        </div>
        <div id="descriptionDisplay" class="bg-gradient-to-br from-vscode-input-bg to-vscode-input-bg/50 rounded-xl border border-vscode-input-border p-6 text-sm text-vscode-fg opacity-80 whitespace-pre-wrap shadow-sm">
          ${formattedDescription}
        </div>
        <div id="descriptionEdit" class="hidden space-y-3">
          <textarea
            id="descriptionTextarea"
            rows="8"
            class="w-full bg-vscode-input-bg border border-vscode-input-border rounded-xl px-4 py-3 text-sm text-vscode-fg placeholder-vscode-fg opacity-60 focus:outline-none focus:border-azure focus:ring-2 focus:ring-azure/20 resize-none transition-all"
          ></textarea>
          <div class="flex justify-end space-x-2">
            <button
              id="cancelDescriptionBtn"
              onclick="cancelEditDescription('${escapedDescription}')"
              class="px-4 py-2 text-sm text-vscode-fg opacity-60 hover:opacity-100 rounded-lg transition-all hover:bg-vscode-hover"
            >
              Cancel
            </button>
            <button
              id="saveDescriptionBtn"
              onclick="saveDescription()"
              class="px-4 py-2 text-sm bg-azure text-white hover:bg-azure/90 rounded-lg transition-all shadow-sm hover:shadow-md"
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
        <button class="bg-gradient-to-r from-vscode-input-bg to-vscode-input-bg/50 border border-vscode-input-border rounded-xl px-5 py-3 text-sm text-vscode-fg font-medium hover:border-azure/50 hover:shadow-md transition-all flex items-center gap-2">
          <span>Show everything</span>
          <span class="bg-azure/20 text-azure px-2 py-0.5 rounded-full text-xs font-semibold">6</span>
          <span class="ml-1">▼</span>
        </button>
      </div>`;
  }

  static renderLeftColumn(
    pullRequest: PullRequest,
    threads: CommentThread[],
    userProfile?: AzureDevOpsProfile,
  ): string {
    return `
      <div class="flex-1 bg-vscode-bg rounded-xl border border-vscode-border content-card overflow-y-auto p-8 modern-card">
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
    sidebarError?: { hasError: boolean; message?: string },
  ): string {
    return `
      <div id="overviewContent" class="tab-content flex gap-6 h-full">
        <!-- Left Column - Overview Content -->
        ${this.renderLeftColumn(pullRequest, threads, userProfile)}

        <!-- Right Column - Sidebar -->
        ${SidebarComponents.renderSidebar(
          pullRequest.reviewersDetailed,
          sidebarError?.hasError || false,
          sidebarError?.message,
        )}
      </div>`;
  }
}
