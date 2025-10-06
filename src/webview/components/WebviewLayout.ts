import { PullRequest } from '../../pullRequestProvider';
import { WebviewStyles } from '../styles/webviewStyles';
import { PrHeader } from './PrHeader';
import { TabNavigation } from './TabNavigation';
import { OverviewContent } from './OverviewContent';
import { TabContent } from './TabContent';
import { ChecksPanel } from './ChecksPanel';
import {
  CommentThread,
  AzureDevOpsProfile,
  PullRequestFileChange,
} from '../../services/azureDevOpsApiClient';
import { ThreadComponents } from './ThreadComponents';

export class WebviewLayout {
  static render(
    pullRequest: PullRequest,
    threads: CommentThread[] = [],
    userProfile?: AzureDevOpsProfile,
    fileChanges?: PullRequestFileChange[],
  ): string {
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
      ${OverviewContent.render(pullRequest, threads, userProfile)}

      <!-- Files Tab Content - Full Width -->
      ${TabContent.renderFilesContent(fileChanges || [])}

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

    function handleViewOnWeb() {
      openInBrowser();
    }

    function copyBranchName(branchName) {
      navigator.clipboard.writeText(branchName).then(() => {
        // Visual feedback: briefly change the icon or show a tooltip
        const btn = event.target.closest('.copy-branch-btn');
        if (btn) {
          const originalHTML = btn.innerHTML;
          btn.innerHTML = '<svg class="w-3.5 h-3.5 text-vscode-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
          setTimeout(() => {
            btn.innerHTML = originalHTML;
          }, 1000);
        }
      }).catch(err => {
        console.error('Failed to copy branch name:', err);
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

    // Comment Functions
    function submitComment() {
      const input = document.getElementById('newCommentInput');
      const commentText = input.value.trim();

      if (!commentText) {
        return;
      }

      vscode.postMessage({
        command: 'addComment',
        text: commentText,
        prId: ${pullRequest.id}
      });

      // Clear the input
      input.value = '';
    }

    function cancelComment() {
      const input = document.getElementById('newCommentInput');
      input.value = '';
      input.blur();
    }

    // Description Edit Functions
    function editDescription(currentDescription) {
      const displayDiv = document.getElementById('descriptionDisplay');
      const editDiv = document.getElementById('descriptionEdit');
      const textarea = document.getElementById('descriptionTextarea');

      if (displayDiv && editDiv && textarea) {
        displayDiv.classList.add('hidden');
        editDiv.classList.remove('hidden');
        textarea.value = currentDescription;
        textarea.focus();
      }
    }

    function cancelEditDescription(originalDescription) {
      const displayDiv = document.getElementById('descriptionDisplay');
      const editDiv = document.getElementById('descriptionEdit');
      const textarea = document.getElementById('descriptionTextarea');

      if (displayDiv && editDiv && textarea) {
        editDiv.classList.add('hidden');
        displayDiv.classList.remove('hidden');
        textarea.value = originalDescription;
      }
    }

    function saveDescription() {
      const textarea = document.getElementById('descriptionTextarea');
      const newDescription = textarea.value.trim();

      vscode.postMessage({
        command: 'updateDescription',
        description: newDescription,
        prId: ${pullRequest.id}
      });

      // Update the display
      const displayDiv = document.getElementById('descriptionDisplay');
      const editDiv = document.getElementById('descriptionEdit');

      if (displayDiv && editDiv) {
        displayDiv.innerHTML = newDescription.replace(/\\n/g, '<br>') || 'No description provided';
        editDiv.classList.add('hidden');
        displayDiv.classList.remove('hidden');
      }
    }
  </script>
</body>
</html>`;
  }
}
