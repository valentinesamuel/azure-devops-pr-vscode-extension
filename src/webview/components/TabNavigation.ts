export class TabNavigation {
  static render(): string {
    return `
      <div class="bg-vscode-bg rounded-lg border border-vscode-border content-card mb-6 flex-shrink-0">
        <div class="border-b border-vscode-border">
          <div class="flex px-8">
            <button id="overviewTab" class="tab-button relative px-6 py-4 text-sm font-medium text-vscode-link nav-indicator">Overview</button>
            <button id="filesTab" class="tab-button px-6 py-4 text-sm font-medium text-vscode-fg opacity-60 hover:text-vscode-fg">Files</button>
            <button id="updatesTab" class="tab-button px-6 py-4 text-sm font-medium text-vscode-fg opacity-60 hover:text-vscode-fg">Updates</button>
            <button id="commitsTab" class="tab-button px-6 py-4 text-sm font-medium text-vscode-fg opacity-60 hover:text-vscode-fg">Commits</button>
            <button id="conflictsTab" class="tab-button px-6 py-4 text-sm font-medium text-vscode-fg opacity-60 hover:text-vscode-fg">Conflicts</button>
          </div>
        </div>
      </div>`;
  }

  static getScript(): string {
    return `
      // Tab switching functionality
      function showTab(tabName) {
        console.log('=== showTab called with:', tabName);

        // Hide all tab contents
        const allTabContents = document.querySelectorAll('.tab-content');
        console.log('All tab-content elements found:', allTabContents.length);
        allTabContents.forEach((content, index) => {
          console.log(\`  Tab content \${index}: id="\${content.id}", hasHidden=\${content.classList.contains('hidden')}\`);
          content.classList.add('hidden');
        });

        // Remove active state from all tabs
        const allTabs = document.querySelectorAll('.tab-button');
        console.log('All tab-button elements found:', allTabs.length);
        allTabs.forEach(tab => {
          tab.classList.remove('nav-indicator', 'text-vscode-link');
          tab.classList.add('text-vscode-fg', 'opacity-60');
        });

        // Show selected tab content
        const targetContent = document.getElementById(tabName + 'Content');
        console.log('Target content element:', targetContent);
        console.log('Target content ID:', tabName + 'Content');
        if (targetContent) {
          console.log('Removing hidden from:', tabName + 'Content');
          targetContent.classList.remove('hidden');
          console.log('Content now has hidden?', targetContent.classList.contains('hidden'));
        } else {
          console.error('Could not find element with ID:', tabName + 'Content');
        }

        // Add active state to clicked tab
        const activeTab = document.getElementById(tabName + 'Tab');
        if (activeTab) {
          activeTab.classList.add('nav-indicator', 'text-vscode-link');
          activeTab.classList.remove('text-vscode-fg', 'opacity-60');
          console.log('Active tab updated:', tabName + 'Tab');
        }
        console.log('=== showTab complete ===');
      }

      // Add click event listeners to all tabs - execute immediately since script is at bottom
      (function() {
        console.log('=== INITIALIZING TAB NAVIGATION ===');
        const overviewTab = document.getElementById('overviewTab');
        const filesTab = document.getElementById('filesTab');
        const updatesTab = document.getElementById('updatesTab');
        const commitsTab = document.getElementById('commitsTab');
        const conflictsTab = document.getElementById('conflictsTab');

        console.log('Tab elements found:', {
          overviewTab: !!overviewTab,
          filesTab: !!filesTab,
          updatesTab: !!updatesTab,
          commitsTab: !!commitsTab,
          conflictsTab: !!conflictsTab
        });

        if (overviewTab) {
          overviewTab.addEventListener('click', () => {
            console.log('>>> Overview tab clicked');
            showTab('overview');
          });
        }
        if (filesTab) {
          filesTab.addEventListener('click', () => {
            console.log('>>> Files tab clicked');
            showTab('files');
          });
        }
        if (updatesTab) {
          updatesTab.addEventListener('click', () => {
            console.log('>>> Updates tab clicked');
            showTab('updates');
          });
        }
        if (commitsTab) {
          commitsTab.addEventListener('click', () => {
            console.log('>>> Commits tab clicked');
            showTab('commits');
          });
        }
        if (conflictsTab) {
          conflictsTab.addEventListener('click', () => {
            console.log('>>> Conflicts tab clicked');
            showTab('conflicts');
          });
        }

        console.log('=== TAB NAVIGATION INITIALIZED ===');
      })();
    `;
  }
}
