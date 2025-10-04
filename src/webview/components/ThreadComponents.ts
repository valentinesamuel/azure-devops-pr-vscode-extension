import { CommentThread, Comment } from '../../services/azureDevOpsApiClient';
import { Icons } from '../utils/icons';

export class ThreadComponents {
  /**
   * Gets the system event message based on thread properties and content
   */
  private static getSystemEventMessage(thread: CommentThread, author: string): string | null {
    const firstComment = thread.comments?.[0];
    const content = firstComment?.content || '';
    const threadType = thread.properties?.CodeReviewThreadType?.$value;

    // Handle "voted 10" pattern - transform to "approved the pull request"
    if (content.includes('voted 10')) {
      return `${author} approved the pull request`;
    }
    if (content.includes('voted 5')) {
      return `${author} approved with suggestions`;
    }
    if (content.includes('voted -10')) {
      return `${author} rejected the pull request`;
    }
    if (content.includes('voted -5')) {
      return `${author} is waiting for the author`;
    }
    if (content.includes('voted 0')) {
      return `${author} reset their vote`;
    }

    // Handle PolicyStatusUpdate - check identities for required reviewer info
    if (threadType === 'PolicyStatusUpdate' && thread.identities) {
      const identityKey =
        thread.properties?.CodeReviewRequiredReviewerExampleReviewerIdentities?.$value;
      if (identityKey) {
        // Parse the identity key (it comes as JSON string like "[\"1\"]")
        try {
          const keys = JSON.parse(identityKey);
          if (keys && keys.length > 0) {
            const identity = thread.identities[keys[0]];
            if (identity?.displayName) {
              const cleanName = this.cleanDisplayName(identity.displayName);
              return `${cleanName} was added as a required reviewer`;
            }
          }
        } catch (e) {
          console.error('Failed to parse identity key:', e);
        }
      }
    }

    // Azure DevOps messages that are already formatted correctly
    if (content) {
      // Pattern: "joined as a reviewer"
      if (content.includes('joined as a reviewer')) {
        return content;
      }

      // Pattern: "created the pull request"
      if (content.includes('created the pull request')) {
        return content;
      }

      // Pattern: "was added as a required reviewer"
      if (content.includes('was added as a required reviewer')) {
        return content;
      }

      // Pattern: "was added as an optional reviewer"
      if (content.includes('was added as an optional reviewer')) {
        return content;
      }

      // Pattern: "approved the pull request"
      if (content.includes('approved the pull request')) {
        return content;
      }

      // Other patterns
      if (content.includes('approved with suggestions')) {
        return content;
      }
      if (content.includes('rejected')) {
        return content;
      }
      if (content.includes('waiting for the author')) {
        return content;
      }
      if (content.includes('reset their vote')) {
        return content;
      }
    }

    // Fallback: Try to construct message from properties
    if (!thread.properties) {
      return null;
    }

    const voteResult = thread.properties.CodeReviewVoteResult?.$value;

    // Vote update - use the actual vote value
    if (threadType === 'VoteUpdate' && voteResult) {
      const vote = parseInt(voteResult);
      if (vote === 10) {
        return `${author} approved the pull request`;
      } else if (vote === 5) {
        return `${author} approved with suggestions`;
      } else if (vote === -10) {
        return `${author} rejected the pull request`;
      } else if (vote === -5) {
        return `${author} is waiting for the author`;
      } else if (vote === 0) {
        return `${author} reset their vote`;
      }
    }

    // Reviewer added/updated
    if (threadType === 'ReviewersUpdate') {
      return `${author} joined as a reviewer`;
    }

    // PR created
    if (threadType === 'PullRequestCreated') {
      return `${author} created the pull request`;
    }

    return null;
  }

  /**
   * Checks if this is a system event thread
   */
  private static isSystemEvent(thread: CommentThread): boolean {
    if (!thread.comments || thread.comments.length === 0) {
      return false;
    }

    const firstComment = thread.comments[0];
    const content = firstComment?.content || '';

    // Check comment type
    if (firstComment.commentType === 'system') {
      return true;
    }

    // Check thread type from properties
    const threadType = thread.properties?.CodeReviewThreadType?.$value;
    if (threadType) {
      const systemTypes = [
        'VoteUpdate',
        'ReviewersUpdate',
        'ReviewerAdd',
        'PullRequestCreated',
        'Iteration',
        'PolicyStatusUpdate',
      ];
      if (systemTypes.includes(threadType)) {
        return true;
      }
    }

    // Check if the thread has no file context and looks like a system message
    if (!thread.threadContext?.filePath && !thread.pullRequestThreadContext?.filePath) {
      const systemPhrases = [
        'approved the pull request',
        'joined as a reviewer',
        'created the pull request',
        'added as a reviewer',
        'required reviewer',
        'waiting for the author',
        'rejected',
        'voted',
      ];

      const hasSystemPhrase = systemPhrases.some((phrase) =>
        content.toLowerCase().includes(phrase.toLowerCase()),
      );

      if (hasSystemPhrase) {
        return true;
      }
    }

    return false;
  }

  /**
   * Formats a date string to a relative time format
   */
  private static formatDate(dateString?: string): string {
    if (!dateString) {
      return 'Unknown date';
    }

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
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
      '#ea580c',
      '#8b5cf6',
      '#ef4444',
      '#06b6d4',
      '#84cc16',
      '#f59e0b',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Gets status badge info
   */
  private static getStatusBadge(status?: string): { text: string; class: string } {
    if (!status) {
      return { text: 'Active', class: 'text-vscode-fg opacity-60' };
    }

    switch (status.toLowerCase()) {
      case 'active':
        return { text: 'Active', class: 'text-vscode-fg opacity-60' };
      case 'fixed':
      case 'closed':
        return { text: 'Resolved', class: 'text-vscode-success' };
      case 'wontfix':
        return { text: "Won't Fix", class: 'text-vscode-fg opacity-60' };
      case 'bydesign':
        return { text: 'By Design', class: 'text-vscode-fg opacity-60' };
      case 'pending':
        return { text: 'Pending', class: 'text-yellow-500' };
      default:
        return { text: status, class: 'text-vscode-fg opacity-60' };
    }
  }

  /**
   * Renders avatar - uses image if available, otherwise initials
   */
  private static renderAvatar(
    author: { displayName?: string; imageUrl?: string },
    size: 'small' | 'medium' = 'small',
  ): string {
    const displayName = author.displayName || 'Unknown User';
    const imageUrl = author.imageUrl;
    const sizeClass = size === 'small' ? 'w-6 h-6' : 'w-8 h-8';
    const initials = this.getInitials(displayName);
    const avatarColor = this.getAvatarColor(displayName);

    if (imageUrl) {
      // Use image with fallback to initials if image fails to load
      return `<img
        src="${imageUrl}"
        class="${sizeClass} rounded-full flex-shrink-0"
        alt="${displayName}"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        style="display: block;"
      />
      <div class="${sizeClass} rounded-full flex items-center justify-center text-vscode-fg text-xs flex-shrink-0" style="background-color: ${avatarColor}; display: none;">
        ${initials}
      </div>`;
    }

    // Fallback to initials
    return `<div class="${sizeClass} rounded-full flex items-center justify-center text-vscode-fg text-xs flex-shrink-0" style="background-color: ${avatarColor}">
      ${initials}
    </div>`;
  }

  /**
   * Renders a single comment
   */
  private static renderComment(comment: Comment, isFirstComment: boolean): string {
    if (!comment || !comment.author) {
      return '';
    }

    const rawDisplayName = comment.author.displayName || 'Unknown User';
    const displayName = this.cleanDisplayName(rawDisplayName);
    const timeAgo = this.formatDate(comment.publishedDate);

    if (comment.isDeleted) {
      return `
        <div class="mb-3 ml-8">
          <div class="text-sm text-vscode-fg opacity-60 italic">Comment deleted</div>
        </div>`;
    }

    return `
      <div class="${isFirstComment ? '' : 'ml-8 mt-3'}">
        <div class="flex items-start space-x-3">
          ${this.renderAvatar(comment.author, 'small')}
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2 mb-1">
              <span class="text-vscode-fg font-medium text-sm">${displayName}</span>
              <span class="text-vscode-fg opacity-60 text-xs">${timeAgo}</span>
            </div>
            <div class="text-sm text-vscode-fg whitespace-pre-wrap break-words">${this.escapeHtml(comment.content || '')}</div>
          </div>
        </div>
      </div>`;
  }

  /**
   * Extracts the actual user identity from a system event thread
   */
  private static getActualIdentityFromThread(thread: CommentThread): {
    displayName: string;
    imageUrl?: string;
  } | null {
    const threadType = thread.properties?.CodeReviewThreadType?.$value;

    // For vote events, get the voter identity
    if (threadType === 'VoteUpdate' && thread.identities) {
      const voterIdentityKey = thread.properties?.CodeReviewVotedByIdentity?.$value;
      if (voterIdentityKey && thread.identities[voterIdentityKey]) {
        return thread.identities[voterIdentityKey];
      }
    }

    // For reviewer events, get the added reviewer identity
    if (threadType === 'ReviewersUpdate' && thread.identities) {
      const addedIdentityKey = thread.properties?.CodeReviewReviewersUpdatedAddedIdentity?.$value;
      if (addedIdentityKey && thread.identities[addedIdentityKey]) {
        return thread.identities[addedIdentityKey];
      }
    }

    // For policy status update (required reviewer), get from identities
    if (threadType === 'PolicyStatusUpdate' && thread.identities) {
      const identityKey =
        thread.properties?.CodeReviewRequiredReviewerExampleReviewerIdentities?.$value;
      if (identityKey) {
        try {
          const keys = JSON.parse(identityKey);
          if (keys && keys.length > 0 && thread.identities[keys[0]]) {
            return thread.identities[keys[0]];
          }
        } catch (e) {
          console.error('Failed to parse identity key:', e);
        }
      }
    }

    // Fallback to comment author
    if (thread.comments && thread.comments[0]?.author) {
      return thread.comments[0].author;
    }

    return null;
  }

  /**
   * Renders a system event (approval, reviewer change, PR creation)
   */
  private static renderSystemEvent(thread: CommentThread): string {
    if (!thread.comments || thread.comments.length === 0) {
      return '';
    }

    const firstComment = thread.comments[0];

    // Get the actual user identity (not the system author)
    const actualIdentity = this.getActualIdentityFromThread(thread);
    if (!actualIdentity) {
      return '';
    }

    const rawDisplayName = actualIdentity.displayName || 'Unknown User';
    const displayName = this.cleanDisplayName(rawDisplayName);
    const timeAgo = this.formatDate(thread.publishedDate);

    const systemMessage = this.getSystemEventMessage(thread, displayName);
    if (!systemMessage) {
      return '';
    }

    // Check if it's an approval event
    const voteResult = thread.properties?.CodeReviewVoteResult?.$value;
    const isApproval = voteResult === '10';
    const icon = isApproval
      ? `<svg class="icon-check" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>`
      : '';

    const iconBg = isApproval ? 'bg-vscode-success' : '';

    return `
      <div class="relative">
        <div class="timeline-dot absolute left-4 top-6"></div>
        <div class="flex items-start space-x-4 ml-8">
          <div class="w-6 h-6 ${iconBg} rounded-full flex items-center justify-center text-vscode-fg text-xs">
            ${isApproval ? icon : this.renderAvatar(actualIdentity, 'small')}
          </div>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center space-x-2">
              <span class="text-vscode-fg text-sm">${systemMessage}</span>
            </div>
            <span class="text-vscode-fg opacity-60 text-xs">${timeAgo}</span>
          </div>
        </div>
      </div>`;
  }

  /**
   * Renders a comment thread
   */
  static renderThread(thread: CommentThread): string {
    if (!thread || thread.isDeleted || !thread.comments || thread.comments.length === 0) {
      return '';
    }

    const firstComment = thread.comments[0];
    if (!firstComment || !firstComment.author) {
      return '';
    }

    // Check if this is a system event and render differently
    if (this.isSystemEvent(thread)) {
      return this.renderSystemEvent(thread);
    }

    const replies = thread.comments.slice(1);
    const rawDisplayName = firstComment.author.displayName || 'Unknown User';
    const displayName = this.cleanDisplayName(rawDisplayName);
    const timeAgo = this.formatDate(thread.publishedDate);
    const statusBadge = this.getStatusBadge(thread.status);

    // Determine if this is a code comment or general comment
    const isCodeComment =
      !!thread.threadContext?.filePath || !!thread.pullRequestThreadContext?.filePath;
    const filePath =
      thread.threadContext?.filePath || thread.pullRequestThreadContext?.filePath || '';
    const lineNumber =
      thread.threadContext?.rightFileStart?.line ||
      thread.pullRequestThreadContext?.rightFileStart?.line;

    return `
      <div class="relative mb-6">
        <div class="timeline-dot absolute left-4 top-6"></div>
        <div class="flex items-start space-x-4 ml-8">
          ${this.renderAvatar(firstComment.author, 'medium')}
          <div class="flex-1 min-w-0">
            ${
              isCodeComment
                ? `
            <div class="mb-2">
              <div class="flex items-center space-x-2 text-xs text-vscode-link">
                <span class="truncate">${filePath}</span>
                ${lineNumber ? `<span>Line ${lineNumber}</span>` : ''}
              </div>
            </div>`
                : ''
            }
            <div class="bg-vscode-bg rounded-lg border border-vscode-border p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  ${this.renderAvatar(firstComment.author, 'small')}
                  <span class="text-vscode-fg text-sm font-medium">${displayName}</span>
                  <span class="text-vscode-fg opacity-60 text-xs">${timeAgo}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="${statusBadge.class} text-xs font-medium">${statusBadge.text}</span>
                </div>
              </div>
              <div class="text-sm text-vscode-fg mb-3 whitespace-pre-wrap break-words">${this.escapeHtml(firstComment.content || '')}</div>

              ${
                replies.length > 0
                  ? `
                <div class="border-t border-vscode-border pt-3 space-y-3">
                  ${replies
                    .filter((reply) => reply && reply.author)
                    .map((reply) => this.renderComment(reply, false))
                    .join('')}
                </div>
              `
                  : ''
              }

              <div class="border-t border-vscode-border pt-3 mt-3">
                <div class="flex items-center space-x-3">
                  <input type="text" placeholder="Write a reply..." class="flex-1 bg-vscode-input-bg border border-vscode-input-border rounded px-3 py-2 text-sm text-vscode-fg placeholder-vscode-fg opacity-60 focus:outline-none focus:border-vscode-link"/>
                  <button class="bg-vscode-info hover:bg-blue-600 text-vscode-fg px-3 py-2 rounded text-sm font-medium transition-colors">Reply</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  /**
   * Renders all threads
   */
  static renderAllThreads(threads: CommentThread[]): string {
    if (!threads || threads.length === 0) {
      return `
        <div class="text-center py-8">
          <div class="text-vscode-fg opacity-60 text-sm">No comments yet</div>
          <div class="text-vscode-fg opacity-40 text-xs mt-1">Be the first to comment on this pull request</div>
        </div>`;
    }

    // Filter out invalid threads and sort by published date (newest first)
    const validThreads = threads.filter(
      (thread) => thread && thread.comments && thread.comments.length > 0 && !thread.isDeleted,
    );

    if (validThreads.length === 0) {
      return `
        <div class="text-center py-8">
          <div class="text-vscode-fg opacity-60 text-sm">No comments yet</div>
          <div class="text-vscode-fg opacity-40 text-xs mt-1">Be the first to comment on this pull request</div>
        </div>`;
    }

    const sortedThreads = [...validThreads].sort((a, b) => {
      const dateA = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
      const dateB = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
      return dateB - dateA;
    });

    return `
      <div class="space-y-6">
        ${sortedThreads.map((thread) => this.renderThread(thread)).join('')}
      </div>`;
  }

  /**
   * Escapes HTML to prevent XSS
   */
  private static escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
