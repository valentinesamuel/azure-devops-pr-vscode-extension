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
          class="w-6 h-6 rounded-full flex-shrink-0"
          alt="${cleanName}"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          style="display: block;"
        />
        <div class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0" style="background-color: ${avatarColor}; display: none;">
          ${initials}
        </div>`
      : `<div class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0" style="background-color: ${avatarColor}">
          ${initials}
        </div>`;

    return `
      <div class="flex items-center space-x-3 p-3 rounded-lg border border-vscode-border bg-vscode-input-bg opacity-30">
        ${avatarHtml}
        <div class="flex-1 min-w-0">
          <div class="text-sm text-vscode-fg truncate">${cleanName}</div>
          <div class="text-xs ${voteStatus.color}">${statusText}</div>
        </div>
        ${
          voteStatus.icon
            ? `<div class="w-4 h-4 ${voteStatus.color === 'text-vscode-success' ? 'bg-vscode-success' : voteStatus.color === 'text-vscode-error' ? 'bg-vscode-error' : 'bg-vscode-warning'} rounded-full flex items-center justify-center text-vscode-fg flex-shrink-0">
              ${voteStatus.icon}
            </div>`
            : ''
        }
      </div>`;
  }

  static renderReviewersSection(reviewers?: Reviewer[]): string {
    if (!reviewers || reviewers.length === 0) {
      return `
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-vscode-fg">Reviewers</h3>
            <button class="text-vscode-link text-sm hover:underline">Add</button>
          </div>
          <div class="p-4 rounded-lg border border-vscode-border bg-vscode-input-bg opacity-30">
            <div class="text-sm text-vscode-fg opacity-60">No reviewers</div>
          </div>
        </div>`;
    }

    const requiredReviewers = reviewers.filter((r) => r.isRequired);
    const optionalReviewers = reviewers.filter((r) => !r.isRequired);

    return `
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-vscode-fg">Reviewers</h3>
          <button class="text-vscode-link text-sm hover:underline">Add</button>
        </div>

        <div class="space-y-4">
          ${
            requiredReviewers.length > 0
              ? `
            <div class="text-xs text-vscode-fg opacity-60 font-medium uppercase tracking-wide">Required</div>
            ${requiredReviewers.map((r) => this.renderReviewer(r)).join('')}
          `
              : ''
          }

          ${
            optionalReviewers.length > 0
              ? `
            <div class="text-xs text-vscode-fg opacity-60 font-medium uppercase tracking-wide ${requiredReviewers.length > 0 ? 'mt-6' : ''}">Optional</div>
            ${optionalReviewers.map((r) => this.renderReviewer(r)).join('')}
          `
              : ''
          }
        </div>
      </div>`;
  }

  static renderTagsSection(): string {
    return `
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-vscode-fg">Tags</h3>
          <button class="text-vscode-fg opacity-60 hover:text-vscode-fg text-lg">+</button>
        </div>
        <div class="p-4 rounded-lg border border-vscode-border bg-vscode-input-bg opacity-30">
          <div class="text-sm text-vscode-fg opacity-60">No tags</div>
        </div>
      </div>`;
  }

  static renderWorkItemsSection(): string {
    return `
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-vscode-fg">Work Items</h3>
          <button class="text-vscode-fg opacity-60 hover:text-vscode-fg text-lg">+</button>
        </div>
        <div class="p-4 rounded-lg border border-vscode-border bg-vscode-input-bg opacity-30">
          <div class="text-sm text-vscode-fg opacity-60">No work items</div>
        </div>
      </div>`;
  }

  static renderSidebar(reviewers?: Reviewer[]): string {
    return `
      <div class="w-80 bg-vscode-bg rounded-lg border border-vscode-border sidebar-card flex flex-col overflow-hidden">
        <div class="p-6 overflow-y-auto flex-1">
          ${this.renderReviewersSection(reviewers)}
          ${this.renderTagsSection()}
          ${this.renderWorkItemsSection()}
        </div>
      </div>`;
  }
}
