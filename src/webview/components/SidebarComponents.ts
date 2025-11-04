import { Icons } from '../utils/icons';
import { Reviewer } from '../../pullRequestProvider';

export class SidebarComponents {
  /**
   * Gets the vote status text and color
   */
  private static getVoteStatus(vote: number): { text: string; color: string; icon: string } {
    switch (vote) {
      case 10:
        return {
          text: 'Approved',
          color: 'text-vscode-success',
          icon: `<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>`,
        };
      case 5:
        return {
          text: 'Approved with suggestions',
          color: 'text-vscode-success',
          icon: `<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>`,
        };
      case -5:
        return {
          text: 'Waiting for author',
          color: 'text-vscode-warning',
          icon: `<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                </svg>`,
        };
      case -10:
        return {
          text: 'Rejected',
          color: 'text-vscode-error',
          icon: `<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>`,
        };
      case 0:
      default:
        return {
          text: 'No vote',
          color: 'text-vscode-fg opacity-60',
          icon: '',
        };
    }
  }

  /**
   * Cleans a display name by removing Azure DevOps prefixes
   */
  private static cleanDisplayName(displayName: string): string {
    if (displayName.includes(']\\')) {
      return displayName.split(']\\')[1]?.trim() || displayName;
    }
    return displayName;
  }

  /**
   * Gets initials from a display name
   */
  private static getInitials(displayName: string): string {
    const cleanName = this.cleanDisplayName(displayName);
    const parts = cleanName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanName.substring(0, 2).toUpperCase();
  }

  /**
   * Generates a color based on the user's name
   */
  private static getAvatarColor(name: string): string {
    const colors = [
      '#0078d4',
      '#16a34a',
      '#d97706',
      '#7c3aed',
      '#db2777',
      '#059669',
      '#2563eb',
      '#c026d3',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Renders a single reviewer item
   */
  private static renderReviewer(reviewer: Reviewer): string {
    const cleanName = this.cleanDisplayName(reviewer.displayName);
    const initials = this.getInitials(reviewer.displayName);
    const avatarColor = this.getAvatarColor(reviewer.displayName);
    const voteStatus = this.getVoteStatus(reviewer.vote);

    // Check if this is a team approval with votedFor members
    const isTeamApproval =
      reviewer.isContainer && reviewer.votedFor && reviewer.votedFor.length > 0;
    let statusText = voteStatus.text;

    if (isTeamApproval && reviewer.votedFor) {
      // Show "via <member names>" for team approvals
      const memberNames = reviewer.votedFor
        .map((m) => this.cleanDisplayName(m.displayName))
        .join(', ');
      statusText = `${voteStatus.text} via ${memberNames}`;
    }

    const avatarHtml = reviewer.imageUrl
      ? `<img
          src="${reviewer.imageUrl}"
          class="avatar-circle w-6 h-6"
          alt="${cleanName}"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          style="display: block;"
        />
        <div class="avatar-circle w-6 h-6 text-white text-xs" style="background-color: ${avatarColor}; display: none;">
          ${initials}
        </div>`
      : `<div class="avatar-circle w-6 h-6 text-white text-xs" style="background-color: ${avatarColor}">
          ${initials}
        </div>`;

    return `
      <div class="flex items-center space-x-3 p-3 rounded-lg border border-vscode-input-border bg-vscode-input-bg">
        ${avatarHtml}
        <div class="flex-1 min-w-0">
          <div class="text-sm text-vscode-fg font-medium truncate">${cleanName}</div>
          <div class="text-xs ${voteStatus.color} font-medium">${statusText}</div>
        </div>
        ${
          voteStatus.icon
            ? `<div class="w-4 h-4 ${voteStatus.color === 'text-vscode-success' ? 'bg-vscode-success' : voteStatus.color === 'text-vscode-error' ? 'bg-vscode-error' : 'bg-vscode-warning'} rounded-full flex items-center justify-center text-white flex-shrink-0">
              ${voteStatus.icon}
            </div>`
            : ''
        }
      </div>`;
  }

  static renderReviewersSection(reviewers?: Reviewer[]): string {
    const requiredReviewers = reviewers?.filter((r) => r.isRequired) || [];
    const optionalReviewers = reviewers?.filter((r) => !r.isRequired) || [];

    return `
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-bold text-vscode-fg flex items-center gap-2">
            <span>Reviewers</span>
          </h3>
          <div class="relative reviewer-dropdown-container">
            <button class="text-azure text-sm font-medium transition-all hover:text-azure/80 flex items-center gap-1 reviewer-dropdown-trigger">
              Add
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
            <div class="reviewer-dropdown-menu hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-vscode-dropdown-background border border-vscode-dropdown-border z-50">
              <div class="py-1">
                <button class="reviewer-dropdown-item w-full text-left px-4 py-2 text-sm text-vscode-dropdown-foreground hover:bg-vscode-list-hoverBackground transition-colors" data-type="required">
                  Add required reviewer
                </button>
                <button class="reviewer-dropdown-item w-full text-left px-4 py-2 text-sm text-vscode-dropdown-foreground hover:bg-vscode-list-hoverBackground transition-colors" data-type="optional">
                  Add optional reviewer
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <!-- Required Reviewers Section -->
          <div id="required-reviewers-section">
            <div class="text-sm text-vscode-fg font-semibold mb-3">Required</div>

            <!-- Search Input for Required Reviewers -->
            <div id="required-search-container" class="hidden mb-3">
              <div class="relative">
                <input
                  type="text"
                  id="required-reviewer-search"
                  placeholder="Search for users or groups"
                  class="w-full px-3 py-2 pr-8 text-sm bg-vscode-input-bg text-vscode-input-fg border border-vscode-input-border rounded focus:outline-none focus:border-azure"
                  autocomplete="off"
                />
                <button
                  onclick="cancelReviewerSearch('required')"
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 text-vscode-fg opacity-60 hover:opacity-100"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </button>
              </div>

              <!-- Search Results -->
              <div id="required-search-results" class="hidden mt-2 max-h-64 overflow-y-auto bg-vscode-dropdown-background border border-vscode-dropdown-border rounded shadow-lg">
                <!-- Results will be populated here -->
              </div>
            </div>

            ${
              requiredReviewers.length > 0
                ? `<div class="space-y-3" id="required-reviewers-list">
                    ${requiredReviewers.map((r) => this.renderReviewer(r)).join('')}
                  </div>`
                : `<div class="text-sm text-vscode-fg opacity-60 text-center py-4" id="required-empty-state">No required reviewers</div>`
            }
          </div>

          <!-- Optional Reviewers Section -->
          <div id="optional-reviewers-section">
            <div class="text-sm text-vscode-fg font-semibold mb-3">Optional</div>

            <!-- Search Input for Optional Reviewers -->
            <div id="optional-search-container" class="hidden mb-3">
              <div class="relative">
                <input
                  type="text"
                  id="optional-reviewer-search"
                  placeholder="Search for users or groups"
                  class="w-full px-3 py-2 pr-8 text-sm bg-vscode-input-bg text-vscode-input-fg border border-vscode-input-border rounded focus:outline-none focus:border-azure"
                  autocomplete="off"
                />
                <button
                  onclick="cancelReviewerSearch('optional')"
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 text-vscode-fg opacity-60 hover:opacity-100"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </button>
              </div>

              <!-- Search Results -->
              <div id="optional-search-results" class="hidden mt-2 max-h-64 overflow-y-auto bg-vscode-dropdown-background border border-vscode-dropdown-border rounded shadow-lg">
                <!-- Results will be populated here -->
              </div>
            </div>

            ${
              optionalReviewers.length > 0
                ? `<div class="space-y-3" id="optional-reviewers-list">
                    ${optionalReviewers.map((r) => this.renderReviewer(r)).join('')}
                  </div>`
                : `<div class="text-sm text-vscode-fg opacity-60 text-center py-4" id="optional-empty-state">No optional reviewers</div>`
            }
          </div>
        </div>
      </div>`;
  }

  static renderTagsSection(): string {
    return `
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-vscode-fg">Tags</h3>
          <button class="text-vscode-link hover:underline text-lg font-medium">+</button>
        </div>
        <div class="p-4 rounded-lg border border-vscode-input-border bg-vscode-input-bg">
          <div class="text-sm text-vscode-fg">No tags</div>
        </div>
      </div>`;
  }

  static renderWorkItemsSection(): string {
    return `
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-vscode-fg">Work Items</h3>
          <button class="text-vscode-link hover:underline text-lg font-medium">+</button>
        </div>
        <div class="p-4 rounded-lg border border-vscode-input-border bg-vscode-input-bg">
          <div class="text-sm text-vscode-fg">No work items</div>
        </div>
      </div>`;
  }

  static renderErrorState(errorMessage?: string): string {
    return `
      <div class="flex flex-col items-center justify-center p-8 text-center">
        <!-- Error Icon -->
        <div class="w-16 h-16 mb-4 rounded-full bg-vscode-error bg-opacity-10 flex items-center justify-center">
          <svg class="w-8 h-8 text-vscode-error" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
        </div>

        <!-- Error Title -->
        <h3 class="text-lg font-semibold text-vscode-fg mb-2">
          Failed to Load PR Details
        </h3>

        <!-- Error Message -->
        <p class="text-sm text-vscode-fg opacity-70 mb-6 max-w-xs">
          ${errorMessage || 'Unable to load pull request information. Please check your connection and try again.'}
        </p>

        <!-- Retry Button -->
        <button
          onclick="refreshPullRequest()"
          class="px-4 py-2 bg-azure text-white rounded-md hover:bg-azure/90 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Retry
        </button>
      </div>`;
  }

  static renderSidebar(
    reviewers?: Reviewer[],
    hasError: boolean = false,
    errorMessage?: string,
  ): string {
    return `
      <div class="w-96 bg-vscode-bg rounded-xl border border-vscode-border sidebar-card flex flex-col overflow-hidden modern-card">
        ${
          hasError
            ? `<div class="flex-1 flex items-center justify-center">${this.renderErrorState(errorMessage)}</div>`
            : `<div class="p-6 overflow-y-auto flex-1">
                ${this.renderReviewersSection(reviewers)}
                ${this.renderTagsSection()}
                ${this.renderWorkItemsSection()}
              </div>`
        }
      </div>`;
  }
}
