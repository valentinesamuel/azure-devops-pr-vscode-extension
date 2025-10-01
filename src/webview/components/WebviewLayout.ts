import { PullRequest } from '../../pullRequestProvider';
import { WebviewStyles } from '../styles/webviewStyles';
import { PrHeader } from './PrHeader';
import { TabNavigation } from './TabNavigation';
import { OverviewContent } from './OverviewContent';
import { TabContent } from './TabContent';
import { ChecksPanel } from './ChecksPanel';

export class WebviewLayout {
  static render(pullRequest: PullRequest): string {
    return `<!DOCTYPE html>
<html lang="en">
${WebviewStyles.getHtmlHead()}
<body class="bg-vscode-input-bg text-vscode-fg font-sans h-screen overflow-hidden">
  <!-- Main Content -->
  <div class="h-full bg-vscode-input-bg p-6 flex flex-col">
    <!-- PR Header - Full Width -->
    ${PrHeader.render(pullRequest)}

    <!-- Tabs Section - Full Width -->
    ${TabNavigation.render()}

    <!-- Content Area - Dynamic Layout Based on Tab -->
    <div class="flex-1 overflow-hidden">
      <!-- Overview Tab Content - Two Columns -->
      ${OverviewContent.render(pullRequest)}

      <!-- Files Tab Content - Full Width -->
      ${TabContent.renderFilesContent()}

      ${TabContent.renderUpdatesContent()}

      ${TabContent.renderCommitsContent()}

      ${TabContent.renderConflictsContent()}
    </div>
  </div>

  ${ChecksPanel.render()}

  <script>
    const vscode = acquireVsCodeApi();

    ${ChecksPanel.getScript()}

    ${TabNavigation.getScript()}

    function openInBrowser() {
      vscode.postMessage({
        command: 'openInBrowser',
        prId: ${pullRequest.id}
      });
    }

    function checkout() {
      vscode.postMessage({
        command: 'checkoutBranch',
        branch: '${pullRequest.sourceBranch}',
        prId: ${pullRequest.id}
      });
    }

    // File Tree Functions
    function toggleFolder(button) {
      const folderContent = button.parentElement.querySelector('.folder-content');
      const chevron = button.querySelector('.folder-chevron');

      if (folderContent.classList.contains('hidden')) {
        folderContent.classList.remove('hidden');
        chevron.style.transform = 'rotate(90deg)';
      } else {
        folderContent.classList.add('hidden');
        chevron.style.transform = 'rotate(0deg)';
      }
    }

    function selectFile(button, fileName) {
      // Remove active state from all file items
      document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('bg-vscode-info', 'opacity-20', 'text-vscode-fg');
      });

      // Add active state to selected file
      button.classList.add('bg-vscode-info', 'opacity-20', 'text-vscode-fg');

      // Show diff view
      const emptyState = document.getElementById('emptyState');
      const diffView = document.getElementById('diffView');
      const fileNameElement = document.getElementById('fileName');

      if (emptyState && diffView && fileNameElement) {
        emptyState.classList.add('hidden');
        diffView.classList.remove('hidden');
        fileNameElement.textContent = fileName;
      }
    }
  </script>
</body>
</html>`;
  }
}
