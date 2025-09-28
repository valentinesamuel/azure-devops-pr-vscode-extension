import { PullRequest } from '../../pullRequestProvider';
import { Icons } from '../utils/icons';

export class StatusComponents {
  static renderAbandonmentBanner(pullRequest: PullRequest): string {
    if (pullRequest.status !== 'Abandoned') {
      return '';
    }

    return `
      <div class="mb-8">
        <div class="flex items-center bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-6">
          ${Icons.warning}
          <span class="text-red-200">The pull request was abandoned 19 Aug</span>
        </div>
      </div>`;
  }

  static renderMergeInfo(): string {
    return `
      <div class="bg-azure-dark rounded-lg border border-azure-border merge-info-card p-6 mb-6">
        <div class="text-sm text-azure-text-dim mb-3">
          Merged PR 21363: Merged PR 21362: feat: add endpoint to update bees order invoice
        </div>
        <div class="text-xs text-azure-text-dim mb-3">
          6602f48
          <svg class="inline w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414L2.586 7l3.707-3.707a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          Valentine Samuel Fri at 14:57
        </div>
        <button class="text-azure-blue text-sm hover:underline">Show details</button>
      </div>`;
  }

  static renderChecksSection(): string {
    return `
      <div class="space-y-4 mb-8">
        <!-- Required check succeeded -->
        <div class="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
          <div class="flex items-center space-x-3">
            <div class="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white">
              ${Icons.check}
            </div>
            <span class="text-sm font-medium text-white">Required check succeeded</span>
          </div>
          <div class="flex items-center space-x-2 mt-2 ml-8">
            <svg class="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <span class="text-xs text-orange-300">1 optional check not yet run</span>
          </div>
        </div>

        <!-- Comments must be resolved -->
        <div class="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
          <div class="flex items-center space-x-3">
            <div class="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white">
              ${Icons.check}
            </div>
            <span class="text-sm font-medium text-white">Comments must be resolved</span>
          </div>
        </div>

        <!-- View checks link -->
        <div class="ml-8">
          <button id="toggleChecksPanel" class="text-azure-blue text-sm hover:underline flex items-center space-x-1">
            <span>View 2 checks</span>
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>

        <!-- Waiting for reviewers -->
        <div class="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
          <div class="flex items-center space-x-3">
            <div class="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white">
              ${Icons.clock}
            </div>
            <span class="text-sm font-medium text-white">2 required reviewers must approve</span>
          </div>
        </div>
      </div>`;
  }
}
