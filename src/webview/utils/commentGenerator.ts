import { PullRequest } from '../../pullRequestProvider';
import { DateFormatter } from './dateFormatter';

export interface CommentData {
  type:
    | 'merge_conflict'
    | 'code_review'
    | 'general'
    | 'commit_push'
    | 'approval'
    | 'creation'
    | 'build_failure'
    | 'security_scan';
  author: string;
  timestamp: string;
  content: string;
  files?: string[];
  status?: 'active' | 'resolved' | 'pending';
  avatarInitials: string;
  avatarColor: string;
}

export class CommentGenerator {
  private static readonly COMMENT_TEMPLATES = {
    merge_conflict_single: {
      authors: ['Valentine Samuel', 'John Doe', 'Sarah Wilson'],
      content: 'Submitted conflict resolution for the file(s).',
      files: [
        '/src/modules/customer/services/customerBulkUpload.service.ts',
        '/src/components/auth/LoginForm.tsx',
        '/src/utils/api/httpClient.ts',
        '/src/models/user/UserRepository.ts',
      ],
    },
    merge_conflict_multiple: {
      authors: ['Valentine Samuel', 'Alex Johnson', 'Maria Garcia'],
      content: 'Submitted conflict resolution for the file(s).',
      fileSets: [
        [
          '/src/adapters/cache/providers/redis.provider.ts',
          '/src/configs/redis.config.ts',
          '/src/configs/schema.config.ts',
          '/src/modules/inventory/inventory.module.ts',
        ],
        [
          '/src/components/Dashboard/index.tsx',
          '/src/components/Dashboard/widgets/Chart.tsx',
          '/src/hooks/useAuth.ts',
          '/src/types/api.ts',
        ],
        [
          '/src/services/userService.ts',
          '/src/middleware/auth.middleware.ts',
          '/src/routes/api/users.ts',
        ],
      ],
    },
    code_review: {
      authors: ['Emily Chen', 'Michael Brown', 'David Kumar'],
      comments: [
        'Could we add some error handling here? What happens if the API call fails?',
        'This looks good overall, but consider extracting this logic into a separate utility function.',
        'LGTM! Nice clean implementation. Just one minor suggestion about the variable naming.',
        'Great work on the refactoring! This is much more readable now.',
        'Should we add unit tests for this new functionality?',
        'Consider using TypeScript strict mode for better type safety.',
        'This could benefit from some documentation comments explaining the algorithm.',
      ],
    },
    general: {
      authors: ['Lisa Park', 'Robert Taylor', 'Anna Rodriguez'],
      comments: [
        'Updated the README with the new deployment instructions.',
        'Fixed the ESLint configuration to match our coding standards.',
        'Added support for dark mode in the user preferences.',
        'Optimized the database queries for better performance.',
        'Integrated the new design system components.',
        'Updated dependencies to their latest stable versions.',
        'Added comprehensive error logging throughout the application.',
      ],
    },
    commit_push: {
      authors: ['Valentine Samuel', 'Chris Lee', 'Jennifer White'],
      messages: [
        'fix: check for missing dist code',
        'feat: add user authentication middleware',
        'refactor: extract common utility functions',
        'fix: resolve memory leak in event listeners',
        'feat: implement real-time notifications',
        'docs: update API documentation',
        'test: add integration tests for payment flow',
      ],
      hashes: ['1d1befdd', 'a7f3c21e', '9b8e2d14', 'c5f9a830', '7e2d4b89', 'f1a8c937', '3d7e9b42'],
    },
    build_failure: {
      authors: ['CI/CD Pipeline', 'GitHub Actions', 'Azure DevOps'],
      failures: [
        'Build failed: TypeScript compilation errors in src/components/UserProfile.tsx',
        'Tests failed: 3 unit tests failing in the authentication module',
        'Security scan failed: High severity vulnerability detected in package dependencies',
        'Lint failed: Code style violations found in 5 files',
        'Build failed: Missing environment variables for production deployment',
      ],
    },
    security_scan: {
      authors: ['Security Scanner', 'Dependabot', 'CodeQL'],
      findings: [
        'No security vulnerabilities detected in this pull request.',
        'Warning: Potential SQL injection vulnerability detected in user input handling.',
        'Info: Consider updating lodash to version 4.17.21 for security patches.',
        'Critical: XSS vulnerability found in comment rendering component.',
        'Medium: Weak cryptographic algorithm detected in password hashing.',
      ],
    },
  };

  static generateRandomComments(pullRequest: PullRequest, count: number = 3): CommentData[] {
    const comments: CommentData[] = [];
    const commentTypes: CommentData['type'][] = [
      'merge_conflict',
      'code_review',
      'general',
      'commit_push',
      'approval',
      'creation',
      'build_failure',
      'security_scan',
    ];

    for (let i = 0; i < count; i++) {
      const type = commentTypes[Math.floor(Math.random() * commentTypes.length)];
      const comment = this.generateCommentByType(type, pullRequest, i);
      if (comment) {
        comments.push(comment);
      }
    }

    // Always add creation as the last comment
    const creationComment = this.generateCommentByType('creation', pullRequest, count);
    if (creationComment) {
      comments.push(creationComment);
    }

    return comments.reverse(); // Show newest first
  }

  private static generateCommentByType(
    type: CommentData['type'],
    pullRequest: PullRequest,
    index: number,
  ): CommentData | null {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 7) + 1;
    const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    switch (type) {
      case 'merge_conflict':
        return this.generateMergeConflictComment(timestamp, index);

      case 'code_review':
        return this.generateCodeReviewComment(timestamp);

      case 'general':
        return this.generateGeneralComment(timestamp);

      case 'commit_push':
        return this.generateCommitPushComment(timestamp);

      case 'approval':
        return this.generateApprovalComment(timestamp);

      case 'creation':
        return this.generateCreationComment(timestamp);

      case 'build_failure':
        return this.generateBuildFailureComment(timestamp);

      case 'security_scan':
        return this.generateSecurityScanComment(timestamp);

      default:
        return null;
    }
  }

  private static generateMergeConflictComment(timestamp: Date, index: number): CommentData {
    const template = this.COMMENT_TEMPLATES.merge_conflict_multiple;
    const author = template.authors[Math.floor(Math.random() * template.authors.length)];
    const isMultiple = Math.random() > 0.5;

    let files: string[];
    if (isMultiple) {
      files = template.fileSets[Math.floor(Math.random() * template.fileSets.length)];
    } else {
      files = [
        this.COMMENT_TEMPLATES.merge_conflict_single.files[
          Math.floor(Math.random() * this.COMMENT_TEMPLATES.merge_conflict_single.files.length)
        ],
      ];
    }

    return {
      type: 'merge_conflict',
      author,
      timestamp: DateFormatter.formatDate(timestamp),
      content: template.content,
      files,
      status: Math.random() > 0.3 ? 'resolved' : 'active',
      avatarInitials: DateFormatter.getInitials(author),
      avatarColor: this.getRandomAvatarColor(),
    };
  }

  private static generateCodeReviewComment(timestamp: Date): CommentData {
    const template = this.COMMENT_TEMPLATES.code_review;
    const author = template.authors[Math.floor(Math.random() * template.authors.length)];
    const content = template.comments[Math.floor(Math.random() * template.comments.length)];

    return {
      type: 'code_review',
      author,
      timestamp: DateFormatter.formatDate(timestamp),
      content,
      status: 'active',
      avatarInitials: DateFormatter.getInitials(author),
      avatarColor: this.getRandomAvatarColor(),
    };
  }

  private static generateGeneralComment(timestamp: Date): CommentData {
    const template = this.COMMENT_TEMPLATES.general;
    const author = template.authors[Math.floor(Math.random() * template.authors.length)];
    const content = template.comments[Math.floor(Math.random() * template.comments.length)];

    return {
      type: 'general',
      author,
      timestamp: DateFormatter.formatDate(timestamp),
      content,
      status: 'active',
      avatarInitials: DateFormatter.getInitials(author),
      avatarColor: this.getRandomAvatarColor(),
    };
  }

  private static generateCommitPushComment(timestamp: Date): CommentData {
    const template = this.COMMENT_TEMPLATES.commit_push;
    const author = template.authors[Math.floor(Math.random() * template.authors.length)];
    const content = template.messages[Math.floor(Math.random() * template.messages.length)];

    return {
      type: 'commit_push',
      author,
      timestamp: DateFormatter.formatDate(timestamp),
      content,
      status: 'active',
      avatarInitials: DateFormatter.getInitials(author),
      avatarColor: this.getRandomAvatarColor(),
    };
  }

  private static generateApprovalComment(timestamp: Date): CommentData {
    const authors = ['Valentine Samuel', 'Senior Dev Team', 'Code Review Bot'];
    const author = authors[Math.floor(Math.random() * authors.length)];

    return {
      type: 'approval',
      author,
      timestamp: DateFormatter.formatDate(timestamp),
      content: `${author} approved the pull request`,
      status: 'active',
      avatarInitials: DateFormatter.getInitials(author),
      avatarColor: '#16a34a', // Green for approvals
    };
  }

  private static generateCreationComment(timestamp: Date): CommentData {
    const authors = ['Success Abhulimen', 'Valentine Samuel', 'Project Lead'];
    const author = authors[Math.floor(Math.random() * authors.length)];

    return {
      type: 'creation',
      author,
      timestamp: DateFormatter.formatDate(timestamp),
      content: `${author} created the pull request`,
      status: 'active',
      avatarInitials: DateFormatter.getInitials(author),
      avatarColor: '#ea580c', // Orange for creation
    };
  }

  private static generateBuildFailureComment(timestamp: Date): CommentData {
    const template = this.COMMENT_TEMPLATES.build_failure;
    const author = template.authors[Math.floor(Math.random() * template.authors.length)];
    const content = template.failures[Math.floor(Math.random() * template.failures.length)];

    return {
      type: 'build_failure',
      author,
      timestamp: DateFormatter.formatDate(timestamp),
      content,
      status: 'pending',
      avatarInitials: 'CI',
      avatarColor: '#dc2626', // Red for failures
    };
  }

  private static generateSecurityScanComment(timestamp: Date): CommentData {
    const template = this.COMMENT_TEMPLATES.security_scan;
    const author = template.authors[Math.floor(Math.random() * template.authors.length)];
    const content = template.findings[Math.floor(Math.random() * template.findings.length)];

    return {
      type: 'security_scan',
      author,
      timestamp: DateFormatter.formatDate(timestamp),
      content,
      status: content.includes('No security') ? 'resolved' : 'pending',
      avatarInitials: 'SEC',
      avatarColor: content.includes('Critical')
        ? '#dc2626'
        : content.includes('Warning')
          ? '#ea580c'
          : '#16a34a',
    };
  }

  private static getRandomAvatarColor(): string {
    const colors = [
      '#0078d4', // Azure blue
      '#16a34a', // Green
      '#ea580c', // Orange
      '#8b5cf6', // Purple
      '#ef4444', // Red
      '#06b6d4', // Cyan
      '#84cc16', // Lime
      '#f59e0b', // Amber
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
