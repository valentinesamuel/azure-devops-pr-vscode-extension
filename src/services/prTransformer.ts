import { PullRequest } from '../pullRequestProvider';
import { AzureDevOpsPullRequest } from './azureDevOpsApiClient';
import { AzureDevOpsRepository } from './gitService';

export class PrTransformer {
  /**
   * Transforms Azure DevOps PR to our internal PullRequest interface
   */
  static transform(
    azurePr: AzureDevOpsPullRequest,
    repository?: AzureDevOpsRepository,
  ): PullRequest {
    // Map Azure DevOps status to our status
    const status = this.mapStatus(azurePr.status);

    // Extract branch names (remove refs/heads/ prefix)
    const sourceBranch = azurePr.sourceRefName.replace('refs/heads/', '');
    const targetBranch = azurePr.targetRefName.replace('refs/heads/', '');

    return {
      id: azurePr.pullRequestId,
      title: azurePr.title,
      author: azurePr.createdBy.uniqueName,
      createdDate: new Date(azurePr.creationDate),
      status,
      isDraft: azurePr.isDraft,
      targetBranch,
      sourceBranch,
      reviewers: azurePr.reviewers.map((r) => r.uniqueName),
      reviewersDetailed: azurePr.reviewers.map((r) => ({
        displayName: r.displayName,
        uniqueName: r.uniqueName,
        id: r.id,
        vote: r.vote,
        isRequired: r.isRequired,
        imageUrl: r.imageUrl,
        isContainer: r.isContainer,
        votedFor: r.votedFor,
      })),
      description: azurePr.description || undefined,
      repository,
    };
  }

  /**
   * Transforms a list of Azure DevOps PRs
   */
  static transformList(
    azurePrs: AzureDevOpsPullRequest[],
    repository?: AzureDevOpsRepository,
  ): PullRequest[] {
    return azurePrs.map((pr) => this.transform(pr, repository));
  }

  /**
   * Maps Azure DevOps status to our status enum
   */
  private static mapStatus(azureStatus: string): 'Active' | 'Completed' | 'Abandoned' {
    switch (azureStatus.toLowerCase()) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'abandoned':
        return 'Abandoned';
      default:
        return 'Active';
    }
  }
}
