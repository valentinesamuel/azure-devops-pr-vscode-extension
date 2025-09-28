export class TabNavigation {
  static render(): string {
    return `
      <div class="bg-azure-darker rounded-lg border border-azure-border content-card mb-6 flex-shrink-0">
        <div class="border-b border-azure-border">
          <div class="flex px-8">
            <button id="overviewTab" class="tab-button relative px-6 py-4 text-sm font-medium text-azure-blue nav-indicator">Overview</button>
            <button id="filesTab" class="tab-button px-6 py-4 text-sm font-medium text-azure-text-dim hover:text-white">Files</button>
            <button id="updatesTab" class="tab-button px-6 py-4 text-sm font-medium text-azure-text-dim hover:text-white">Updates</button>
            <button id="commitsTab" class="tab-button px-6 py-4 text-sm font-medium text-azure-text-dim hover:text-white">Commits</button>
            <button id="conflictsTab" class="tab-button px-6 py-4 text-sm font-medium text-azure-text-dim hover:text-white">Conflicts</button>
          </div>
        </div>
      </div>`;
  }

  static getScript(): string {
    return `
      // Tab switching functionality
      function showTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.add('hidden');
        });

        // Remove active state from all tabs
        document.querySelectorAll('.tab-button').forEach(tab => {
          tab.classList.remove('nav-indicator', 'text-azure-blue');
          tab.classList.add('text-azure-text-dim');
        });

        // Show selected tab content
        const targetContent = document.getElementById(tabName + 'Content');
        if (targetContent) {
          targetContent.classList.remove('hidden');
        }

        // Add active state to clicked tab
        const activeTab = document.getElementById(tabName + 'Tab');
        if (activeTab) {
          activeTab.classList.add('nav-indicator', 'text-azure-blue');
          activeTab.classList.remove('text-azure-text-dim');
        }
      }

      // Add click event listeners to all tabs
      document.getElementById('overviewTab').addEventListener('click', () => showTab('overview'));
      document.getElementById('filesTab').addEventListener('click', () => showTab('files'));
      document.getElementById('updatesTab').addEventListener('click', () => showTab('updates'));
      document.getElementById('commitsTab').addEventListener('click', () => showTab('commits'));
      document.getElementById('conflictsTab').addEventListener('click', () => showTab('conflicts'));
    `;
  }
}
