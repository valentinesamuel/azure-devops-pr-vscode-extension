import { Icons } from '../utils/icons';

export class ChecksPanel {
  static render(): string {
    return `
      <!-- Checks Panel (Hidden by default) -->
      <div id="checksPanel" class="fixed top-0 right-0 h-full w-96 bg-vscode-bg border-l border-vscode-border transform translate-x-full z-50 shadow-2xl">
        <div class="h-full flex flex-col">
          <!-- Panel Header -->
          <div class="flex items-center justify-between p-4 border-b border-vscode-border">
            <h2 class="text-lg font-medium text-vscode-fg">Checks</h2>
            <button id="closeChecksPanel" class="text-vscode-fg opacity-60 hover:text-vscode-fg">
              ${Icons.close}
            </button>
          </div>

          <!-- Panel Content -->
          <div class="flex-1 overflow-y-auto p-4">
            <div class="text-xs text-vscode-fg opacity-60 mb-4">
              The displayed list of checks may be truncated for optimal performance. For a smoother experience, please maintain a reasonable number of policies (fewer than 100).
            </div>

            <!-- Required Checks Section -->
            <div class="mb-6">
              <h3 class="text-sm font-medium text-vscode-fg mb-3">Required</h3>

              <!-- Comments must be resolved check -->
              <div class="bg-vscode-input-bg rounded-lg border border-vscode-input-border p-4 mb-3">
                <div class="flex items-start justify-between">
                  <div class="flex items-start space-x-3">
                    <div class="w-5 h-5 bg-vscode-success rounded-full flex items-center justify-center text-vscode-fg mt-0.5">
                      ${Icons.check}
                    </div>
                    <div class="flex-1">
                      <div class="text-sm font-medium text-vscode-fg mb-1">Comments must be resolved</div>
                      <div class="text-xs text-vscode-success">Succeeded</div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button class="text-vscode-fg opacity-60 hover:text-vscode-fg text-xs" title="Skip this check">
                      ${Icons.close}
                    </button>
                    <button class="text-vscode-link hover:text-blue-400 text-xs">Details</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Optional Checks Section -->
            <div class="mb-6">
              <h3 class="text-sm font-medium text-vscode-fg mb-3">Optional</h3>

              <!-- Work items must be linked check -->
              <div class="bg-vscode-input-bg rounded-lg border border-vscode-input-border p-4 mb-3">
                <div class="flex items-start justify-between">
                  <div class="flex items-start space-x-3">
                    <div class="w-5 h-5 bg-vscode-error rounded-full flex items-center justify-center text-vscode-fg mt-0.5">
                      ${Icons.close}
                    </div>
                    <div class="flex-1">
                      <div class="text-sm font-medium text-vscode-fg mb-1">Work items must be linked</div>
                      <div class="text-xs text-vscode-error">Failed</div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button class="bg-vscode-info hover:bg-blue-600 text-vscode-fg text-xs px-3 py-1 rounded transition-colors" title="Skip this check">
                      Skip
                    </button>
                    <button class="text-vscode-link hover:text-blue-400 text-xs">Retry</button>
                    <button class="text-vscode-link hover:text-blue-400 text-xs">Details</button>
                  </div>
                </div>
                <div class="mt-3 text-xs text-vscode-fg opacity-60">
                  This pull request does not have any linked work items. Link a work item to this pull request to track your changes.
                </div>
              </div>
            </div>

            <!-- Actions Section -->
            <div class="border-t border-vscode-border pt-4">
              <div class="flex space-x-2">
                <button class="bg-vscode-info hover:bg-blue-600 text-vscode-fg text-sm px-4 py-2 rounded transition-colors">
                  Retry all failed
                </button>
                <button class="bg-gray-600 hover:bg-gray-700 text-vscode-fg text-sm px-4 py-2 rounded transition-colors">
                  Skip all optional
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Overlay for panel -->
      <div id="panelOverlay" class="fixed inset-0 bg-black bg-opacity-50 hidden z-40"></div>`;
  }

  static getScript(): string {
    return `
      // Checks panel functionality
      const checksPanel = document.getElementById('checksPanel');
      const panelOverlay = document.getElementById('panelOverlay');
      const toggleChecksBtn = document.getElementById('toggleChecksPanel');
      const closeChecksBtn = document.getElementById('closeChecksPanel');

      if (checksPanel && panelOverlay) {
        // Add transition classes after page load to prevent initial animation glitch
        setTimeout(() => {
          checksPanel.classList.add('transition-transform', 'duration-300', 'ease-in-out');
        }, 100);

        function openChecksPanel() {
          checksPanel.classList.remove('translate-x-full');
          panelOverlay.classList.remove('hidden');
          document.body.style.overflow = 'hidden';
        }

        function closeChecksPanel() {
          checksPanel.classList.add('translate-x-full');
          panelOverlay.classList.add('hidden');
          document.body.style.overflow = 'auto';
        }

        if (toggleChecksBtn) {
          toggleChecksBtn.addEventListener('click', openChecksPanel);
        }
        if (closeChecksBtn) {
          closeChecksBtn.addEventListener('click', closeChecksPanel);
        }
        if (panelOverlay) {
          panelOverlay.addEventListener('click', closeChecksPanel);
        }
      }

      // Handle check skip actions
      document.querySelectorAll('[title="Skip this check"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const checkCard = btn.closest('.bg-vscode-input-bg');
          const checkName = checkCard.querySelector('.text-vscode-fg').textContent;

          if (confirm(\`Are you sure you want to skip the check: \${checkName}?\`)) {
            // Add skipped state styling
            checkCard.classList.add('opacity-60');
            const statusElement = checkCard.querySelector('.text-xs');
            statusElement.textContent = 'Skipped';
            statusElement.className = 'text-xs text-yellow-400';

            // Update icon
            const iconDiv = checkCard.querySelector('.w-5.h-5');
            iconDiv.className = 'w-5 h-5 bg-yellow-600 rounded-full flex items-center justify-center text-white mt-0.5';
            iconDiv.innerHTML = '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>';

            vscode.postMessage({
              command: 'skipCheck',
              checkName: checkName
            });
          }
        });
      });

      // Handle retry actions
      document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent === 'Retry') {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const checkCard = btn.closest('.bg-vscode-input-bg');
            const checkName = checkCard.querySelector('.text-vscode-fg').textContent;

            // Show running state
            const statusElement = checkCard.querySelector('.text-xs');
            statusElement.textContent = 'Running...';
            statusElement.className = 'text-xs text-yellow-400';

            // Update icon to loading
            const iconDiv = checkCard.querySelector('.w-5.h-5');
            iconDiv.className = 'w-5 h-5 bg-yellow-600 rounded-full flex items-center justify-center text-white mt-0.5 animate-spin';
            iconDiv.innerHTML = '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/></svg>';

            vscode.postMessage({
              command: 'retryCheck',
              checkName: checkName
            });
          });
        }
      });
    `;
  }
}
