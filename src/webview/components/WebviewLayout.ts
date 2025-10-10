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
  GitCommit,
} from '../../services/azureDevOpsApiClient';
import { ThreadComponents } from './ThreadComponents';

export class WebviewLayout {
  static render(
    pullRequest: PullRequest,
    threads: CommentThread[] = [],
    userProfile?: AzureDevOpsProfile,
    fileChanges?: PullRequestFileChange[],
    commits?: GitCommit[],
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

      ${TabContent.renderCommitsContent(commits || [])}

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
    function toggleFileTree() {
      const fileTreePanel = document.getElementById('fileTreePanel');
      const expandBtn = document.getElementById('expandFileTreeBtn');

      if (!fileTreePanel || !expandBtn) return;

      const isCollapsed = fileTreePanel.classList.contains('collapsed');

      if (isCollapsed) {
        // Expand
        fileTreePanel.classList.remove('collapsed');
        fileTreePanel.style.width = '20rem'; // 80 = w-80
        fileTreePanel.style.opacity = '1';
        expandBtn.classList.add('hidden');
      } else {
        // Collapse
        fileTreePanel.classList.add('collapsed');
        fileTreePanel.style.width = '0';
        fileTreePanel.style.opacity = '0';
        expandBtn.classList.remove('hidden');
      }
    }

    function toggleFolder(button) {
      // Clear active state from any selected files and folders
      document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('bg-vscode-list-active-bg', 'selected-file');
      });
      document.querySelectorAll('.folder-item').forEach(item => {
        item.classList.remove('bg-vscode-list-active-bg', 'selected-folder');
      });

      // Add active state to clicked folder
      button.classList.add('bg-vscode-list-active-bg', 'selected-folder');

      const folderContent = button.parentElement.querySelector('.folder-content');
      const chevron = button.querySelector('.folder-chevron');

      // Toggle folder expansion
      if (folderContent.classList.contains('hidden')) {
        folderContent.classList.remove('hidden');
        chevron.style.transform = 'rotate(90deg)';
      } else {
        folderContent.classList.add('hidden');
        chevron.style.transform = 'rotate(0deg)';
      }

      // Show folder details on the right
      showFolderDetails(button);
    }

    function showFolderDetails(folderButton) {
      const folderName = folderButton.querySelector('span.flex-1').textContent;
      const folderContent = folderButton.parentElement.querySelector('.folder-content');

      // Show loading state immediately
      document.getElementById('emptyState').classList.add('hidden');
      document.getElementById('folderView').classList.add('hidden');
      document.getElementById('folderView').classList.remove('flex');

      const diffView = document.getElementById('diffView');
      diffView.classList.remove('hidden');

      // Update header with folder name
      document.getElementById('fileName').textContent = folderName;

      // Show loading state
      const diffContent = diffView.querySelector('.flex-1.overflow-y-auto');
      diffContent.innerHTML = \`
        <div class="flex items-center justify-center h-full text-vscode-fg opacity-60">
          <div class="flex flex-col items-center space-y-4">
            <svg class="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div class="text-center">
              <p class="text-sm font-medium">Loading folder contents</p>
              <p class="text-xs opacity-60 mt-1">Preparing files for \${folderName}</p>
            </div>
          </div>
        </div>
      \`;

      // Use setTimeout to allow UI to update before processing
      setTimeout(() => {
        try {
          // Collect all files in this folder (including nested)
          const files = [];

          function collectFiles(element) {
            if (!element) {
              return;
            }

            const fileButtons = element.querySelectorAll('.file-item');

            fileButtons.forEach(fileBtn => {
              const fileNameSpan = fileBtn.querySelector('span.flex-1');
              if (!fileNameSpan) {
                return;
              }

              const onclickAttr = fileBtn.getAttribute('onclick');

              if (!onclickAttr) {
                return;
              }

              // Need to escape backslashes because this is inside a template literal
              const matches = onclickAttr.match(/viewFileDiff\\('([^']+)',\\s*'([^']+)',\\s*'([^']+)'\\)/);

              if (matches) {
                const filePath = matches[1];
                const changeType = matches[2];
                const name = matches[3];

                // Get change type badge info
                const badge = fileBtn.querySelector('span.rounded');
                const changeTypeLabel = badge ? badge.textContent : '';
                const changeTypeClass = badge ? badge.className : '';

                files.push({ name, path: filePath, changeType, changeTypeLabel, changeTypeClass });
              }
            });
          }

          if (folderContent) {
            collectFiles(folderContent);
          }

          if (files.length === 0) {
            // Show empty state
            diffContent.innerHTML = \`
              <div class="flex items-center justify-center h-full text-vscode-fg opacity-60">
                <div class="text-center">
                  <svg class="w-16 h-16 mx-auto mb-4 text-vscode-border" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                  </svg>
                  <p class="text-sm">No files in this folder</p>
                </div>
              </div>
            \`;
            return;
          }

          // Update header with file count
          document.getElementById('fileName').textContent = folderName + ' (' + files.length + ' file' + (files.length !== 1 ? 's' : '') + ')';

          // Show accordion with loading states
          diffContent.innerHTML = renderFileAccordions(files);

          // Request diffs for all files
          loadFolderDiffs(files);
        } catch (error) {
          // Show error state
          diffContent.innerHTML = \`
            <div class="flex items-center justify-center h-full p-8">
              <div class="max-w-md w-full">
                <div class="flex items-start space-x-3 text-vscode-error bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded p-4">
                  <svg class="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                  </svg>
                  <div class="flex-1">
                    <p class="text-sm font-medium">Failed to load folder</p>
                    <p class="text-xs mt-1 opacity-80">Could not process folder contents: \${error.message || 'Unknown error'}</p>
                  </div>
                </div>
              </div>
            </div>
          \`;
          console.error('Error loading folder details:', error);
        }
      }, 100);
    }

    function renderFileAccordions(files) {
      let html = '<div class="space-y-2 p-4">';

      files.forEach((file, index) => {
        html += \`
          <div class="border border-vscode-border rounded bg-vscode-bg" id="file-accordion-\${index}">
            <div class="flex items-center justify-between p-3 hover:bg-vscode-list-hover-bg transition-colors">
              <button class="flex items-center space-x-3 flex-1" onclick="toggleFileAccordion(\${index})">
                <svg class="w-3 h-3 accordion-chevron transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                </svg>
                <svg class="w-4 h-4 text-vscode-fg opacity-70" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm font-medium text-vscode-fg">\${file.name}</span>
                \${file.changeTypeLabel ? \`<span class="text-xs px-2 py-0.5 rounded font-semibold \${file.changeTypeClass}">\${file.changeTypeLabel}</span>\` : ''}
                <span class="text-xs text-vscode-fg opacity-60 ml-2">\${file.path}</span>
              </button>
              <button class="text-vscode-link text-xs hover:underline px-3 py-1" onclick="event.stopPropagation(); viewFile('\${file.path}', '\${file.name}', '\${file.changeType}')">View</button>
            </div>
            <div class="accordion-content hidden border-t border-vscode-border" id="file-content-\${index}">
              <div class="p-4 flex items-center justify-center text-vscode-fg opacity-60">
                <div class="flex items-center space-x-2">
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="text-sm">Loading diff...</span>
                </div>
              </div>
            </div>
          </div>
        \`;
      });

      html += '</div>';
      return html;
    }

    function toggleFileAccordion(index) {
      const content = document.getElementById('file-content-' + index);
      const chevron = document.querySelector('#file-accordion-' + index + ' .accordion-chevron');

      if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        chevron.style.transform = 'rotate(90deg)';
      } else {
        content.classList.add('hidden');
        chevron.style.transform = 'rotate(0deg)';
      }
    }

    function viewFile(filePath, fileName, changeType) {
      console.log('vieeewwwwing');
      console.log('File path:', filePath);
      console.log('File name:', fileName);
      console.log('Change type:', changeType);

      // Show loading state in the right panel
      const emptyState = document.getElementById('emptyState');
      const folderView = document.getElementById('folderView');
      const diffView = document.getElementById('diffView');

      emptyState.classList.add('hidden');
      folderView.classList.add('hidden');
      folderView.classList.remove('flex');
      diffView.classList.remove('hidden');

      document.getElementById('fileName').textContent = fileName;

      // Show loading indicator with spinner
      const diffContent = diffView.querySelector('.flex-1.overflow-y-auto');
      diffContent.innerHTML = \`
        <div class="flex items-center justify-center h-full text-vscode-fg opacity-60">
          <div class="flex items-center space-x-3">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm">Loading side-by-side diff...</span>
          </div>
        </div>
      \`;

      // Request diff from extension
      vscode.postMessage({
        command: 'getFileDiff',
        filePath: filePath,
        changeType: changeType,
        fileName: fileName,
        viewMode: 'side-by-side'
      });
    }

    function loadFolderDiffs(files) {
      files.forEach((file, index) => {
        // Request diff for this file
        vscode.postMessage({
          command: 'getFileDiff',
          filePath: file.path,
          changeType: file.changeType,
          fileIndex: index,
          fileName: file.name
        });
      });

      // Listen for responses
      const messageHandler = (event) => {
        const message = event.data;

        if (message.command === 'fileDiffResponse') {
          const fileIndex = message.fileIndex;

          if (fileIndex !== undefined) {
            // Update the specific accordion with the diff
            updateFileAccordion(fileIndex, message);
          }
        }
      };

      window.addEventListener('message', messageHandler);
    }

    function updateFileAccordion(index, diffData) {
      const contentElement = document.getElementById('file-content-' + index);
      if (!contentElement) return;

      // Check if there was an error
      if (diffData.error) {
        contentElement.innerHTML = \`
          <div class="p-4">
            <div class="flex items-start space-x-3 text-vscode-error bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded p-3">
              <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <p class="text-sm font-medium">Failed to load diff</p>
                <p class="text-xs mt-1 opacity-80">\${escapeHtml(diffData.errorMessage || 'An unknown error occurred')}</p>
              </div>
            </div>
          </div>
        \`;
        return;
      }

      // Generate the diff HTML
      const diffHtml = generateDiffHtml(diffData.oldContent, diffData.newContent, diffData.changeType);

      // Update the content
      contentElement.innerHTML = '<div class="p-2">' + diffHtml + '</div>';

      // Auto-expand the first file
      if (index === 0) {
        contentElement.classList.remove('hidden');
        const chevron = document.querySelector('#file-accordion-' + index + ' .accordion-chevron');
        if (chevron) {
          chevron.style.transform = 'rotate(90deg)';
        }
      }
    }

    function viewFileDiff(filePath, changeType, fileName) {
      console.log('Requesting diff for:', filePath);

      // Show loading state
      const folderView = document.getElementById('folderView');
      const diffView = document.getElementById('diffView');
      const emptyState = document.getElementById('emptyState');

      emptyState.classList.add('hidden');
      folderView.classList.add('hidden');
      folderView.classList.remove('flex');
      diffView.classList.remove('hidden');

      document.getElementById('fileName').textContent = fileName;

      // Show loading indicator with spinner
      const diffContent = diffView.querySelector('.flex-1.overflow-y-auto');
      diffContent.innerHTML = \`
        <div class="flex items-center justify-center h-full text-vscode-fg opacity-60">
          <div class="flex items-center space-x-3">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm">Loading diff...</span>
          </div>
        </div>
      \`;

      // Request diff from extension
      vscode.postMessage({
        command: 'getFileDiff',
        filePath: filePath,
        changeType: changeType
      });
    }

    // Listen for diff response from extension
    window.addEventListener('message', event => {
      const message = event.data;

      if (message.command === 'fileDiffResponse' && message.fileIndex === undefined) {
        // This is for single file view (not accordion)
        displayFileDiff(message);
      }
    });

    function displayFileDiff(message) {
      const diffView = document.getElementById('diffView');
      const diffContent = diffView.querySelector('.flex-1.overflow-y-auto');

      // Check if there was an error
      if (message.error) {
        diffContent.innerHTML = \`
          <div class="flex items-center justify-center h-full p-8">
            <div class="max-w-md w-full">
              <div class="flex items-start space-x-3 text-vscode-error bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded p-4">
                <svg class="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <div class="flex-1">
                  <p class="text-sm font-medium">Failed to load diff</p>
                  <p class="text-xs mt-1 opacity-80">\${escapeHtml(message.errorMessage || 'An unknown error occurred')}</p>
                </div>
              </div>
            </div>
          </div>
        \`;
        return;
      }

      // Check if side-by-side view was requested
      if (message.viewMode === 'side-by-side') {
        const sideBySideDiffHtml = generateSideBySideDiffHtml(message.oldContent, message.newContent, message.changeType, message.filePath);
        diffContent.innerHTML = sideBySideDiffHtml;

        // Set up synchronized scrolling after DOM is ready
        setTimeout(() => {
          setupSynchronizedScrolling();
        }, 0);
      } else {
        // Generate unified diff
        const diffHtml = generateDiffHtml(message.oldContent, message.newContent, message.changeType);
        diffContent.innerHTML = diffHtml;
      }
    }

    function setupSynchronizedScrolling() {
      const baseScroll = document.getElementById('diff-base-scroll');
      const prScroll = document.getElementById('diff-pr-scroll');

      if (!baseScroll || !prScroll) {
        return;
      }

      let isSyncing = false;

      // Synchronize PR scroll when base is scrolled (both vertical and horizontal)
      baseScroll.addEventListener('scroll', function() {
        if (isSyncing) {
          return;
        }

        isSyncing = true;
        prScroll.scrollTop = baseScroll.scrollTop;
        prScroll.scrollLeft = baseScroll.scrollLeft;

        // Reset flag after scroll event completes
        requestAnimationFrame(() => {
          isSyncing = false;
        });
      });

      // Synchronize base scroll when PR is scrolled (both vertical and horizontal)
      prScroll.addEventListener('scroll', function() {
        if (isSyncing) {
          return;
        }

        isSyncing = true;
        baseScroll.scrollTop = prScroll.scrollTop;
        baseScroll.scrollLeft = prScroll.scrollLeft;

        // Reset flag after scroll event completes
        requestAnimationFrame(() => {
          isSyncing = false;
        });
      });
    }

    function detectLanguage(filePath) {
      if (!filePath) return 'plaintext';

      const extension = filePath.split('.').pop().toLowerCase();
      const languageMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'json': 'json',
        'py': 'python',
        'java': 'java',
        'cs': 'csharp',
        'css': 'css',
        'scss': 'scss',
        'sass': 'scss',
        'yml': 'yaml',
        'yaml': 'yaml',
        'md': 'markdown',
        'sh': 'bash',
        'bash': 'bash',
        'sql': 'sql',
        'dockerfile': 'dockerfile',
        'go': 'go',
        'rs': 'rust',
        'php': 'php',
        'rb': 'ruby',
        'html': 'xml',
        'xml': 'xml',
        'svg': 'xml'
      };

      return languageMap[extension] || 'plaintext';
    }

    function highlightCode(code, language) {
      if (!code) return '';
      if (!window.hljs) return escapeHtml(code);

      try {
        // Try to highlight with the specified language
        if (window.hljs.getLanguage(language)) {
          const result = window.hljs.highlight(code, { language: language, ignoreIllegals: true });
          return result.value;
        } else {
          // Fallback to auto-detection
          const result = window.hljs.highlightAuto(code);
          return result.value;
        }
      } catch (e) {
        console.error('Highlight.js error:', e);
      }

      return escapeHtml(code);
    }

    function generateSideBySideDiffHtml(oldContent, newContent, changeType, filePath) {
      const oldLines = oldContent ? oldContent.split('\\n') : [];
      const newLines = newContent ? newContent.split('\\n') : [];
      const maxLines = Math.max(oldLines.length, newLines.length);
      const language = detectLanguage(filePath);

      let html = \`
        <div class="flex h-full overflow-hidden">
          <!-- Old Version (Base) -->
          <div class="flex-1 border-r border-vscode-border flex flex-col min-w-0">
            <div class="bg-vscode-input-bg border-b border-vscode-border px-4 py-2">
              <span class="text-sm font-medium text-vscode-fg">Base Version</span>
            </div>
            <div id="diff-base-scroll" class="flex-1 overflow-auto font-mono text-xs">
              <div style="min-width: max-content;">
      \`;

      for (let i = 0; i < maxLines; i++) {
        const oldLine = oldLines[i];
        const newLine = newLines[i];
        const isChanged = oldLine !== newLine;
        const isDeleted = oldLine !== undefined && (newLine === undefined || isChanged);

        if (oldLine !== undefined) {
          const bgClass = isDeleted ? 'bg-red-500 bg-opacity-10' : '';
          const highlightedLine = highlightCode(oldLine, language);
          html += \`
            <div class="diff-line flex \${bgClass}">
              <span class="w-12 text-right px-2 bg-vscode-input-bg opacity-50 text-vscode-fg opacity-60 select-none flex-shrink-0">\${i + 1}</span>
              <pre class="px-4 py-1 m-0 flex-shrink-0"><code class="hljs">\${highlightedLine}</code></pre>
            </div>
          \`;
        } else {
          html += \`
            <div class="diff-line flex bg-vscode-input-bg opacity-20">
              <span class="w-12 text-right px-2 text-vscode-fg opacity-30 select-none flex-shrink-0"></span>
              <span class="px-4 py-1 flex-shrink-0"></span>
            </div>
          \`;
        }
      }

      html += \`
              </div>
            </div>
          </div>

          <!-- New Version (PR) -->
          <div class="flex-1 flex flex-col min-w-0">
            <div class="bg-vscode-input-bg border-b border-vscode-border px-4 py-2">
              <span class="text-sm font-medium text-vscode-fg">PR Version</span>
            </div>
            <div id="diff-pr-scroll" class="flex-1 overflow-auto font-mono text-xs">
              <div style="min-width: max-content;">
      \`;

      for (let i = 0; i < maxLines; i++) {
        const oldLine = oldLines[i];
        const newLine = newLines[i];
        const isChanged = oldLine !== newLine;
        const isAdded = newLine !== undefined && (oldLine === undefined || isChanged);

        if (newLine !== undefined) {
          const bgClass = isAdded ? 'bg-green-500 bg-opacity-10' : '';
          const highlightedLine = highlightCode(newLine, language);
          html += \`
            <div class="diff-line flex \${bgClass}">
              <span class="w-12 text-right px-2 bg-vscode-input-bg opacity-50 text-vscode-fg opacity-60 select-none flex-shrink-0">\${i + 1}</span>
              <pre class="px-4 py-1 m-0 flex-shrink-0"><code class="hljs">\${highlightedLine}</code></pre>
            </div>
          \`;
        } else {
          html += \`
            <div class="diff-line flex bg-vscode-input-bg opacity-20">
              <span class="w-12 text-right px-2 text-vscode-fg opacity-30 select-none flex-shrink-0"></span>
              <span class="px-4 py-1 flex-shrink-0"></span>
            </div>
          \`;
        }
      }

      html += \`
              </div>
            </div>
          </div>
        </div>
      \`;

      return html;
    }

    function generateDiffHtml(oldContent, newContent, changeType) {
      const oldLines = oldContent ? oldContent.split('\\n') : [];
      const newLines = newContent ? newContent.split('\\n') : [];

      let html = '<div class="font-mono text-xs">';

      if (changeType === 'add') {
        // File was added - show all lines as additions
        newLines.forEach((line, index) => {
          html += \`
            <div class="diff-line flex bg-green-500 bg-opacity-10">
              <span class="w-12 text-right px-2 bg-vscode-input-bg opacity-50 text-vscode-fg opacity-60 select-none"></span>
              <span class="w-12 text-right px-2 bg-green-500 bg-opacity-20 text-vscode-fg opacity-60 select-none">\${index + 1}</span>
              <span class="flex-1 px-4 py-1 text-green-300">+ \${escapeHtml(line)}</span>
            </div>
          \`;
        });
      } else if (changeType === 'delete') {
        // File was deleted - show all lines as deletions
        oldLines.forEach((line, index) => {
          html += \`
            <div class="diff-line flex bg-red-500 bg-opacity-10">
              <span class="w-12 text-right px-2 bg-red-500 bg-opacity-20 text-vscode-fg opacity-60 select-none">\${index + 1}</span>
              <span class="w-12 text-right px-2 bg-vscode-input-bg opacity-50 text-vscode-fg opacity-60 select-none"></span>
              <span class="flex-1 px-4 py-1 text-red-300">- \${escapeHtml(line)}</span>
            </div>
          \`;
        });
      } else {
        // File was modified - show diff with context (3 lines before/after changes)
        const contextLines = 3;
        const maxLines = Math.max(oldLines.length, newLines.length);

        // Find changed line indices
        const changedIndices = new Set();
        for (let i = 0; i < maxLines; i++) {
          if (oldLines[i] !== newLines[i]) {
            changedIndices.add(i);
          }
        }

        // Expand to include context
        const linesToShow = new Set();
        changedIndices.forEach(idx => {
          for (let j = Math.max(0, idx - contextLines); j <= Math.min(maxLines - 1, idx + contextLines); j++) {
            linesToShow.add(j);
          }
        });

        // Convert to sorted array
        const sortedLines = Array.from(linesToShow).sort((a, b) => a - b);

        let lastLine = -1;
        sortedLines.forEach(i => {
          // Add separator for skipped lines
          if (lastLine !== -1 && i > lastLine + 1) {
            html += \`
              <div class="diff-line flex bg-vscode-input-bg opacity-20">
                <span class="w-12 text-right px-2 text-vscode-fg opacity-40 select-none">...</span>
                <span class="w-12 text-right px-2 text-vscode-fg opacity-40 select-none">...</span>
                <span class="flex-1 px-4 py-1 text-vscode-fg opacity-40 italic text-center">--- skipped \${i - lastLine - 1} lines ---</span>
              </div>
            \`;
          }

          const oldLine = oldLines[i];
          const newLine = newLines[i];
          const isChanged = changedIndices.has(i);

          if (oldLine === newLine) {
            // Unchanged line (context)
            html += \`
              <div class="diff-line flex">
                <span class="w-12 text-right px-2 bg-vscode-input-bg opacity-50 text-vscode-fg opacity-60 select-none">\${i + 1}</span>
                <span class="w-12 text-right px-2 bg-vscode-input-bg opacity-50 text-vscode-fg opacity-60 select-none">\${i + 1}</span>
                <span class="flex-1 px-4 py-1 text-vscode-fg opacity-70">\${escapeHtml(oldLine || '')}</span>
              </div>
            \`;
          } else if (oldLine && !newLine) {
            // Line deleted
            html += \`
              <div class="diff-line flex bg-red-500 bg-opacity-10">
                <span class="w-12 text-right px-2 bg-red-500 bg-opacity-20 text-vscode-fg opacity-60 select-none">\${i + 1}</span>
                <span class="w-12 text-right px-2 bg-vscode-input-bg opacity-50 text-vscode-fg opacity-60 select-none"></span>
                <span class="flex-1 px-4 py-1 text-red-300">- \${escapeHtml(oldLine)}</span>
              </div>
            \`;
          } else if (!oldLine && newLine) {
            // Line added
            html += \`
              <div class="diff-line flex bg-green-500 bg-opacity-10">
                <span class="w-12 text-right px-2 bg-vscode-input-bg opacity-50 text-vscode-fg opacity-60 select-none"></span>
                <span class="w-12 text-right px-2 bg-green-500 bg-opacity-20 text-vscode-fg opacity-60 select-none">\${i + 1}</span>
                <span class="flex-1 px-4 py-1 text-green-300">+ \${escapeHtml(newLine)}</span>
              </div>
            \`;
          } else {
            // Line changed
            html += \`
              <div class="diff-line flex bg-red-500 bg-opacity-10">
                <span class="w-12 text-right px-2 bg-red-500 bg-opacity-20 text-vscode-fg opacity-60 select-none">\${i + 1}</span>
                <span class="w-12 text-right px-2 bg-vscode-input-bg opacity-50 text-vscode-fg opacity-60 select-none"></span>
                <span class="flex-1 px-4 py-1 text-red-300">- \${escapeHtml(oldLine)}</span>
              </div>
              <div class="diff-line flex bg-green-500 bg-opacity-10">
                <span class="w-12 text-right px-2 bg-vscode-input-bg opacity-50 text-vscode-fg opacity-60 select-none"></span>
                <span class="w-12 text-right px-2 bg-green-500 bg-opacity-20 text-vscode-fg opacity-60 select-none">\${i + 1}</span>
                <span class="flex-1 px-4 py-1 text-green-300">+ \${escapeHtml(newLine)}</span>
              </div>
            \`;
          }

          lastLine = i;
        });
      }

      html += '</div>';
      return html;
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Commit Functions
    function copyCommitHash(commitId) {
      navigator.clipboard.writeText(commitId).then(() => {
        // Visual feedback: briefly change the icon
        const btn = event.target.closest('button');
        if (btn) {
          const originalHTML = btn.innerHTML;
          btn.innerHTML = '<svg class="w-4 h-4 text-vscode-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
          setTimeout(() => {
            btn.innerHTML = originalHTML;
          }, 1000);
        }
      }).catch(err => {
        console.error('Failed to copy commit hash:', err);
      });
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
