import { Icons } from '../utils/icons';

export class SidebarComponents {
  static renderReviewersSection(): string {
    return `
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-white">Reviewers</h3>
          <button class="text-azure-blue text-sm hover:underline">Add</button>
        </div>

        <div class="space-y-4">
          <div class="text-xs text-azure-text-dim font-medium uppercase tracking-wide">Required</div>

          <div class="flex items-center space-x-3 p-3 rounded-lg border border-azure-border bg-azure-dark/30">
            <div class="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">
              ${Icons.user}
            </div>
            <div class="flex-1">
              <div class="text-sm text-white">Kuja Leads</div>
              <div class="text-xs text-azure-green">Approved via Valentine Samuel</div>
            </div>
            <div class="w-4 h-4 bg-azure-green rounded-full flex items-center justify-center text-white">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </div>
          </div>

          <div class="text-xs text-azure-text-dim font-medium uppercase tracking-wide mt-6">Optional</div>

          <div class="flex items-center space-x-3 p-3 rounded-lg border border-azure-border bg-azure-dark/30">
            <div class="w-6 h-6 bg-azure-green rounded-full flex items-center justify-center text-white text-xs">
              ${Icons.user}
            </div>
            <div class="flex-1">
              <div class="text-sm text-white">Valentine Samuel</div>
              <div class="text-xs text-azure-green">Approved</div>
            </div>
            <div class="w-4 h-4 bg-azure-green rounded-full flex items-center justify-center text-white">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>
      </div>`;
  }

  static renderTagsSection(): string {
    return `
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-white">Tags</h3>
          <button class="text-azure-text-dim hover:text-white text-lg">+</button>
        </div>
        <div class="p-4 rounded-lg border border-azure-border bg-azure-dark/30">
          <div class="text-sm text-azure-text-dim">No tags</div>
        </div>
      </div>`;
  }

  static renderWorkItemsSection(): string {
    return `
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-white">Work Items</h3>
          <button class="text-azure-text-dim hover:text-white text-lg">+</button>
        </div>
        <div class="p-4 rounded-lg border border-azure-border bg-azure-dark/30">
          <div class="text-sm text-azure-text-dim">No work items</div>
        </div>
      </div>`;
  }

  static renderSidebar(): string {
    return `
      <div class="w-80 bg-azure-darker rounded-lg border border-azure-border sidebar-card flex flex-col overflow-hidden">
        <div class="p-6 overflow-y-auto flex-1">
          ${this.renderReviewersSection()}
          ${this.renderTagsSection()}
          ${this.renderWorkItemsSection()}
        </div>
      </div>`;
  }
}
