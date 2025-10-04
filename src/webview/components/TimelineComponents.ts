import { Icons } from '../utils/icons';
import { CommentGenerator, CommentData } from '../utils/commentGenerator';
import { PullRequest } from '../../pullRequestProvider';

export class TimelineComponents {
  /**
   * Cleans a display name by removing Azure DevOps prefixes
   */
  private static cleanDisplayName(displayName: string): string {
    // Remove any prefix in brackets (e.g., "[AFR_WEB_Distributor Management System (DMS)]\\Kuja Leads")
    if (displayName.includes(']\\')) {
      return displayName.split(']\\')[1]?.trim() || displayName;
    }
    return displayName;
  }

  private static getInitials(displayName: string): string {
    const cleanName = this.cleanDisplayName(displayName);
    const parts = cleanName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanName.substring(0, 2).toUpperCase();
  }

  static renderCommentInput(userProfile?: { displayName?: string; imageUrl?: string }): string {
    const displayName = userProfile?.displayName || 'VS Code';
    const initials = this.getInitials(displayName);
    const avatarHtml = userProfile?.imageUrl
      ? `<img
          src="${userProfile.imageUrl}"
          class="w-8 h-8 rounded-full flex-shrink-0"
          alt="${userProfile.displayName}"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          style="display: block;"
        />
        <div class="w-8 h-8 bg-vscode-success rounded-full flex items-center justify-center text-vscode-fg text-sm" style="display: none;">
          ${initials}
        </div>`
      : `<div class="w-8 h-8 bg-vscode-success rounded-full flex items-center justify-center text-vscode-fg text-sm">
          ${initials}
        </div>`;

    return `
      <div class="mb-8">
        <div class="flex items-center space-x-4 mb-6">
          ${avatarHtml}
          <input
            type="text"
            placeholder="Add a comment..."
            class="flex-1 bg-vscode-input-bg border border-vscode-input-border rounded-lg px-4 py-3 text-sm text-vscode-fg placeholder-vscode-fg opacity-60 focus:outline-none focus:border-vscode-link"
          />
        </div>
      </div>`;
  }

  static renderMergeConflictComment(): string {
    return `
      <div class="relative">
        <div class="timeline-dot absolute left-4 top-6"></div>
        <div class="flex items-start space-x-4 ml-8">
          <div class="w-8 h-8 bg-vscode-info rounded-full flex items-center justify-center text-vscode-fg text-sm font-medium">2</div>
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-2">
              <div class="w-6 h-6 bg-vscode-success rounded-full flex items-center justify-center text-vscode-fg text-xs">VS</div>
              <span class="text-vscode-fg font-medium">Valentine Samuel resolved merge conflicts</span>
              <span class="text-vscode-fg opacity-60 text-xs">19 Sept</span>
            </div>
            <div class="bg-vscode-bg rounded-lg border border-vscode-border p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 bg-vscode-success rounded-full flex items-center justify-center text-vscode-fg text-xs">VS</div>
                  <span class="text-vscode-fg text-sm">Valentine Samuel</span>
                  <span class="text-vscode-fg opacity-60 text-xs">19 Sept</span>
                </div>
                <div class="flex items-center space-x-2">
                  <button class="text-vscode-fg opacity-60 hover:text-vscode-fg">
                    ${Icons.edit}
                  </button>
                  <button class="text-vscode-fg opacity-60 hover:text-vscode-fg">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"/>
                      <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h8v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                  <button class="text-vscode-fg opacity-60 hover:text-vscode-fg">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                  <div class="flex items-center space-x-1">
                    <svg class="w-4 h-4 text-vscode-fg opacity-60" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-vscode-success text-xs font-medium">Resolved</span>
                    <svg class="w-4 h-4 text-vscode-fg opacity-60" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div class="text-sm text-vscode-fg mb-3">Submitted conflict resolution for the file(s).</div>
              <div class="mb-4">
                <ul class="list-disc list-inside space-y-1 ml-2">
                  <li class="text-vscode-link text-sm hover:underline cursor-pointer">/src/adapters/cache/providers/redis.provider.ts</li>
                  <li class="text-vscode-link text-sm hover:underline cursor-pointer">/src/configs/redis.config.ts</li>
                  <li class="text-vscode-link text-sm hover:underline cursor-pointer">/src/configs/schema.config.ts</li>
                  <li class="text-vscode-link text-sm hover:underline cursor-pointer">/src/modules/inventory/inventory.module.ts</li>
                  <li class="text-vscode-link text-sm hover:underline cursor-pointer">/src/modules/inventory/jobs/inventorySyncCronJob.service.ts</li>
                  <li class="text-vscode-link text-sm hover:underline cursor-pointer">/src/modules/inventory/services/inventoryCache.service.ts</li>
                  <li class="text-vscode-link text-sm hover:underline cursor-pointer">/src/modules/inventory/usecases/getInventorySyncStatus.usecase.ts</li>
                </ul>
              </div>
              <div class="border-t border-vscode-border pt-3">
                <div class="flex items-center space-x-3">
                  <div class="w-6 h-6 bg-vscode-success rounded-full flex items-center justify-center text-vscode-fg text-xs">VS</div>
                  <input type="text" placeholder="Write a reply..." class="flex-1 bg-vscode-input-bg border border-vscode-input-border rounded px-3 py-2 text-sm text-vscode-fg placeholder-vscode-fg opacity-60 focus:outline-none focus:border-vscode-link"/>
                  <button class="bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium">Reactivate</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  static renderCommitActivity(): string {
    return `
      <div class="relative">
        <div class="timeline-dot absolute left-4 top-6"></div>
        <div class="flex items-start space-x-4 ml-8">
          <div class="w-8 h-8 bg-vscode-info rounded-full flex items-center justify-center text-vscode-fg text-sm font-medium">
            2
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 bg-vscode-success rounded-full flex items-center justify-center text-vscode-fg text-xs">
                  VS
                </div>
                <span class="text-vscode-fg font-medium">Valentine Samuel pushed 1 commit</span>
              </div>
              <span class="text-vscode-fg opacity-60 text-xs">Friday</span>
            </div>

            <div class="bg-vscode-input-bg rounded-lg border border-vscode-input-border p-4">
              <div class="text-sm text-vscode-fg mb-2">
                fix: check for missing dist code
              </div>
              <div class="flex items-center space-x-3 text-xs text-vscode-fg opacity-60">
                <span class="font-mono bg-vscode-bg px-2 py-1 rounded">1d1befdd</span>
                <div class="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  V
                </div>
                <span>valentinesamuel</span>
                <span>Fri at 13:18</span>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  static renderApprovalActivity(): string {
    return `
      <div class="relative">
        <div class="timeline-dot absolute left-4 top-6"></div>
        <div class="flex items-start space-x-4 ml-8">
          <div class="w-6 h-6 bg-vscode-success rounded-full flex items-center justify-center text-vscode-fg text-xs">
            <svg class="icon-check" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 bg-vscode-success rounded-full flex items-center justify-center text-vscode-fg text-xs">
                VS
              </div>
              <span class="text-vscode-fg text-sm">Valentine Samuel approved the pull request</span>
            </div>
            <span class="text-vscode-fg opacity-60 text-xs">Friday</span>
          </div>
        </div>
      </div>`;
  }

  static renderCreationActivity(): string {
    return `
      <div class="relative">
        <div class="timeline-dot absolute left-4 top-6"></div>
        <div class="flex items-start space-x-4 ml-8">
          <div class="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs">
            SA
          </div>
          <div class="flex items-center justify-between w-full">
            <div class="text-sm">
              <span class="text-vscode-fg">Success Abhulimen created the pull request</span>
            </div>
            <span class="text-vscode-fg opacity-60 text-xs">Friday</span>
          </div>
        </div>
      </div>`;
  }

  static renderTimelineSection(pullRequest: PullRequest): string {
    const comments = CommentGenerator.generateRandomComments(pullRequest, 4);
    const renderedComments = comments
      .map((comment) => this.renderDynamicComment(comment))
      .join('\n');

    return `
      <div class="space-y-6">
        ${renderedComments}
      </div>`;
  }

  static renderDynamicComment(comment: CommentData): string {
    switch (comment.type) {
      case 'merge_conflict':
        return this.renderMergeConflictFromData(comment);
      case 'code_review':
        return this.renderCodeReviewComment(comment);
      case 'general':
        return this.renderGeneralComment(comment);
      case 'commit_push':
        return this.renderCommitPushFromData(comment);
      case 'approval':
        return this.renderApprovalFromData(comment);
      case 'creation':
        return this.renderCreationFromData(comment);
      case 'build_failure':
        return this.renderBuildFailureComment(comment);
      case 'security_scan':
        return this.renderSecurityScanComment(comment);
      default:
        return this.renderGeneralComment(comment);
    }
  }

  static renderMergeConflictFromData(comment: CommentData): string {
    const isMultiple = comment.files && comment.files.length > 1;
    const statusClass =
      comment.status === 'resolved' ? 'text-vscode-success' : 'text-vscode-fg opacity-60';
    const statusText = comment.status === 'resolved' ? 'Resolved' : 'Active';
    const buttonText = comment.status === 'resolved' ? 'Reactivate' : 'Resolve';
    const buttonClass =
      comment.status === 'resolved' ? 'bg-gray-600' : 'bg-vscode-info hover:bg-blue-600';

    return `
      <div class="relative">
        <div class="timeline-dot absolute left-4 top-6"></div>
        <div class="flex items-start space-x-4 ml-8">
          <div class="w-8 h-8 bg-vscode-info rounded-full flex items-center justify-center text-vscode-fg text-sm font-medium">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-2">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-vscode-fg text-xs" style="background-color: ${comment.avatarColor}">
                ${comment.avatarInitials}
              </div>
              <span class="text-vscode-fg font-medium">${comment.author} resolved merge conflicts</span>
              <span class="text-vscode-fg opacity-60 text-xs">${comment.timestamp}</span>
            </div>
            <div class="bg-vscode-bg rounded-lg border border-vscode-border p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center text-vscode-fg text-xs" style="background-color: ${comment.avatarColor}">
                    ${comment.avatarInitials}
                  </div>
                  <span class="text-vscode-fg text-sm">${comment.author}</span>
                  <span class="text-vscode-fg opacity-60 text-xs">${comment.timestamp}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <button class="text-vscode-fg opacity-60 hover:text-vscode-fg">
                    ${Icons.edit}
                  </button>
                  <div class="flex items-center space-x-1">
                    <svg class="w-4 h-4 text-vscode-fg opacity-60" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/>
                    </svg>
                    <span class="${statusClass} text-xs font-medium">${statusText}</span>
                  </div>
                </div>
              </div>
              <div class="text-sm text-vscode-fg mb-3">${comment.content}</div>
              <div class="mb-4">
                ${
                  isMultiple
                    ? `<ul class="list-disc list-inside space-y-1 ml-2">
                    ${comment.files!.map((file) => `<li class="text-vscode-link text-sm hover:underline cursor-pointer">${file}</li>`).join('')}
                  </ul>`
                    : `<div class="text-vscode-link text-sm hover:underline cursor-pointer">${comment.files![0]}</div>`
                }
              </div>
              <div class="border-t border-vscode-border pt-3">
                <div class="flex items-center space-x-3">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center text-vscode-fg text-xs" style="background-color: ${comment.avatarColor}">
                    ${comment.avatarInitials}
                  </div>
                  <input type="text" placeholder="Write a reply..." class="flex-1 bg-vscode-input-bg border border-vscode-input-border rounded px-3 py-2 text-sm text-vscode-fg placeholder-vscode-fg opacity-60 focus:outline-none focus:border-vscode-link"/>
                  <button class="${buttonClass} text-vscode-fg px-3 py-2 rounded text-sm font-medium transition-colors">${buttonText}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  static renderCodeReviewComment(comment: CommentData): string {
    return `
      <div class="relative">
        <div class="timeline-dot absolute left-4 top-6"></div>
        <div class="flex items-start space-x-4 ml-8">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-vscode-fg text-xs" style="background-color: ${comment.avatarColor}">
            ${comment.avatarInitials}
          </div>
          <div class="flex-1">
            <div class="bg-vscode-bg rounded-lg border border-vscode-border p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center text-vscode-fg text-xs" style="background-color: ${comment.avatarColor}">
                    ${comment.avatarInitials}
                  </div>
                  <span class="text-vscode-fg text-sm">${comment.author}</span>
                  <span class="text-vscode-fg opacity-60 text-xs">${comment.timestamp}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <button class="text-vscode-fg opacity-60 hover:text-vscode-fg">
                    ${Icons.edit}
                  </button>
                  <div class="flex items-center space-x-1">
                    <span class="text-vscode-fg opacity-60 text-xs">Active</span>
                  </div>
                </div>
              </div>
              <div class="text-sm text-vscode-fg mb-3">${comment.content}</div>
              <div class="border-t border-vscode-border pt-3">
                <div class="flex items-center space-x-3">
                  <div class="w-6 h-6 bg-vscode-success rounded-full flex items-center justify-center text-vscode-fg text-xs">VS</div>
                  <input type="text" placeholder="Write a reply..." class="flex-1 bg-vscode-input-bg border border-vscode-input-border rounded px-3 py-2 text-sm text-vscode-fg placeholder-vscode-fg opacity-60 focus:outline-none focus:border-vscode-link"/>
                  <button class="bg-vscode-info hover:bg-blue-600 text-vscode-fg px-3 py-2 rounded text-sm font-medium transition-colors">Reply</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  static renderGeneralComment(comment: CommentData): string {
    return `
      <div class="relative">
        <div class="timeline-dot absolute left-4 top-6"></div>
        <div class="flex items-start space-x-4 ml-8">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-vscode-fg text-xs" style="background-color: ${comment.avatarColor}">
            ${comment.avatarInitials}
          </div>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center space-x-2">
              <span class="text-vscode-fg text-sm">${comment.author} ${comment.content}</span>
            </div>
            <span class="text-vscode-fg opacity-60 text-xs">${comment.timestamp}</span>
          </div>
        </div>
      </div>`;
  }

  static renderCommitPushFromData(comment: CommentData): string {
    return `
      <div class="relative">
        <div class="timeline-dot absolute left-4 top-6"></div>
        <div class="flex items-start space-x-4 ml-8">
          <div class="w-8 h-8 bg-vscode-info rounded-full flex items-center justify-center text-vscode-fg text-sm font-medium">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 rounded-full flex items-center justify-center text-vscode-fg text-xs" style="background-color: ${comment.avatarColor}">
                  ${comment.avatarInitials}
                </div>
                <span class="text-vscode-fg font-medium">${comment.author} pushed 1 commit</span>
              </div>
              <span class="text-vscode-fg opacity-60 text-xs">${comment.timestamp}</span>
            </div>
            <div class="bg-vscode-input-bg rounded-lg border border-vscode-input-border p-4">
              <div class="text-sm text-vscode-fg mb-2">${comment.content}</div>
              <div class="flex items-center space-x-3 text-xs text-vscode-fg opacity-60">
                <span class="font-mono bg-vscode-bg px-2 py-1 rounded">${Math.random().toString(36).substr(2, 8)}</span>
                <div class="w-5 h-5 rounded-full flex items-center justify-center text-vscode-fg text-xs font-medium" style="background-color: ${comment.avatarColor}">
                  ${comment.avatarInitials}
                </div>
                <span>${comment.author.toLowerCase().replace(' ', '')}</span>
                <span>${comment.timestamp}</span>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  static renderApprovalFromData(comment: CommentData): string {
    return `
      <div class="relative">
        <div class="timeline-dot absolute left-4 top-6"></div>
        <div class="flex items-start space-x-4 ml-8">
          <div class="w-6 h-6 bg-vscode-success rounded-full flex items-center justify-center text-vscode-fg text-xs">
            ${Icons.check}
          </div>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-vscode-fg text-xs" style="background-color: ${comment.avatarColor}">
                ${comment.avatarInitials}
              </div>
              <span class="text-vscode-fg text-sm">${comment.content}</span>
            </div>
            <span class="text-vscode-fg opacity-60 text-xs">${comment.timestamp}</span>
          </div>
        </div>
      </div>`;
  }

  static renderCreationFromData(comment: CommentData): string {
    return `
      <div class="relative">
        <div class="timeline-dot absolute left-4 top-6"></div>
        <div class="flex items-start space-x-4 ml-8">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style="background-color: ${comment.avatarColor}">
            ${comment.avatarInitials}
          </div>
          <div class="flex items-center justify-between w-full">
            <div class="text-sm">
              <span class="text-vscode-fg">${comment.content}</span>
            </div>
            <span class="text-vscode-fg opacity-60 text-xs">${comment.timestamp}</span>
          </div>
        </div>
      </div>`;
  }

  static renderBuildFailureComment(comment: CommentData): string {
    const isFailure = comment.content.toLowerCase().includes('failed');
    const bgColor = isFailure
      ? 'bg-vscode-error opacity-20 border-vscode-error opacity-30'
      : 'bg-vscode-success opacity-20 border-vscode-success opacity-30';
    const iconColor = isFailure ? 'bg-vscode-error' : 'bg-vscode-success';
    const icon = isFailure ? Icons.close : Icons.check;

    return `
      <div class="relative">
        <div class="timeline-dot absolute left-4 top-6"></div>
        <div class="flex items-start space-x-4 ml-8">
          <div class="w-6 h-6 ${iconColor} rounded-full flex items-center justify-center text-vscode-fg text-xs">
            ${icon}
          </div>
          <div class="flex-1">
            <div class="${bgColor} rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <span class="text-vscode-fg font-medium">${comment.author}</span>
                  <span class="text-vscode-fg opacity-60 text-xs">${comment.timestamp}</span>
                </div>
              </div>
              <div class="text-sm text-vscode-fg">${comment.content}</div>
            </div>
          </div>
        </div>
      </div>`;
  }

  static renderSecurityScanComment(comment: CommentData): string {
    const isSuccess = comment.content.toLowerCase().includes('no security');
    const bgColor = isSuccess
      ? 'bg-vscode-success opacity-20 border-vscode-success opacity-30'
      : 'bg-yellow-600 opacity-20 border-yellow-600 opacity-30';
    const iconColor = isSuccess ? 'bg-vscode-success' : 'bg-yellow-600';
    const icon = isSuccess ? Icons.check : Icons.warning;

    return `
      <div class="relative">
        <div class="timeline-dot absolute left-4 top-6"></div>
        <div class="flex items-start space-x-4 ml-8">
          <div class="w-6 h-6 ${iconColor} rounded-full flex items-center justify-center text-vscode-fg text-xs">
            ${icon}
          </div>
          <div class="flex-1">
            <div class="${bgColor} rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <span class="text-vscode-fg font-medium">${comment.author}</span>
                  <span class="text-vscode-fg opacity-60 text-xs">${comment.timestamp}</span>
                </div>
              </div>
              <div class="text-sm text-vscode-fg">${comment.content}</div>
            </div>
          </div>
        </div>
      </div>`;
  }
}
