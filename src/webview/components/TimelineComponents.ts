import { Icons } from '../utils/icons';

export class TimelineComponents {
  static renderCommentInput(): string {
    return `
      <div class="mb-8">
        <div class="flex items-center space-x-4 mb-6">
          <div class="w-8 h-8 bg-azure-green rounded-full flex items-center justify-center text-white text-sm">
            VS
          </div>
          <input
            type="text"
            placeholder="Add a comment..."
            class="flex-1 bg-azure-dark border border-azure-border rounded-lg px-4 py-3 text-sm text-azure-text placeholder-azure-text-dim focus:outline-none focus:border-azure-blue"
          />
        </div>
      </div>`;
  }

  static renderMergeConflictComment(): string {
    return `
      <div class="relative">
        <div class="timeline-dot absolute left-4 top-6"></div>
        <div class="flex items-start space-x-4 ml-8">
          <div class="w-8 h-8 bg-azure-blue rounded-full flex items-center justify-center text-white text-sm font-medium">2</div>
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-2">
              <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">VS</div>
              <span class="text-white font-medium">Valentine Samuel resolved merge conflicts</span>
              <span class="text-azure-text-dim text-xs">19 Sept</span>
            </div>
            <div class="bg-azure-darker rounded-lg border border-azure-border p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">VS</div>
                  <span class="text-white text-sm">Valentine Samuel</span>
                  <span class="text-azure-text-dim text-xs">19 Sept</span>
                </div>
                <div class="flex items-center space-x-2">
                  <button class="text-azure-text-dim hover:text-white">
                    ${Icons.edit}
                  </button>
                  <button class="text-azure-text-dim hover:text-white">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"/>
                      <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h8v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                  <button class="text-azure-text-dim hover:text-white">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                  <div class="flex items-center space-x-1">
                    <svg class="w-4 h-4 text-azure-text-dim" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-azure-green text-xs font-medium">Resolved</span>
                    <svg class="w-4 h-4 text-azure-text-dim" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div class="text-sm text-azure-text mb-3">Submitted conflict resolution for the file(s).</div>
              <div class="mb-4">
                <ul class="list-disc list-inside space-y-1 ml-2">
                  <li class="text-azure-blue text-sm hover:underline cursor-pointer">/src/adapters/cache/providers/redis.provider.ts</li>
                  <li class="text-azure-blue text-sm hover:underline cursor-pointer">/src/configs/redis.config.ts</li>
                  <li class="text-azure-blue text-sm hover:underline cursor-pointer">/src/configs/schema.config.ts</li>
                  <li class="text-azure-blue text-sm hover:underline cursor-pointer">/src/modules/inventory/inventory.module.ts</li>
                  <li class="text-azure-blue text-sm hover:underline cursor-pointer">/src/modules/inventory/jobs/inventorySyncCronJob.service.ts</li>
                  <li class="text-azure-blue text-sm hover:underline cursor-pointer">/src/modules/inventory/services/inventoryCache.service.ts</li>
                  <li class="text-azure-blue text-sm hover:underline cursor-pointer">/src/modules/inventory/usecases/getInventorySyncStatus.usecase.ts</li>
                </ul>
              </div>
              <div class="border-t border-azure-border pt-3">
                <div class="flex items-center space-x-3">
                  <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">VS</div>
                  <input type="text" placeholder="Write a reply..." class="flex-1 bg-azure-dark border border-azure-border rounded px-3 py-2 text-sm text-azure-text placeholder-azure-text-dim focus:outline-none focus:border-azure-blue"/>
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
          <div class="w-8 h-8 bg-azure-blue rounded-full flex items-center justify-center text-white text-sm font-medium">
            2
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">
                  VS
                </div>
                <span class="text-white font-medium">Valentine Samuel pushed 1 commit</span>
              </div>
              <span class="text-azure-text-dim text-xs">Friday</span>
            </div>

            <div class="bg-azure-dark rounded-lg border border-azure-border p-4">
              <div class="text-sm text-white mb-2">
                fix: check for missing dist code
              </div>
              <div class="flex items-center space-x-3 text-xs text-azure-text-dim">
                <span class="font-mono bg-azure-darker px-2 py-1 rounded">1d1befdd</span>
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
          <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">
            <svg class="icon-check" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">
                VS
              </div>
              <span class="text-white text-sm">Valentine Samuel approved the pull request</span>
            </div>
            <span class="text-azure-text-dim text-xs">Friday</span>
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
              <span class="text-white">Success Abhulimen created the pull request</span>
            </div>
            <span class="text-azure-text-dim text-xs">Friday</span>
          </div>
        </div>
      </div>`;
  }

  static renderTimelineSection(): string {
    return `
      <div class="space-y-6">
        ${this.renderMergeConflictComment()}
        ${this.renderCommitActivity()}
        ${this.renderApprovalActivity()}
        ${this.renderCreationActivity()}
      </div>`;
  }
}
