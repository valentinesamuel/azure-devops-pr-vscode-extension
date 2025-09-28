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
<body class="bg-azure-dark text-azure-text font-sans h-screen overflow-hidden">
  <!-- Main Content -->
  <div class="h-full bg-azure-dark p-6 flex flex-col">
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
  </script>
</body>
</html>`;
  }
}
