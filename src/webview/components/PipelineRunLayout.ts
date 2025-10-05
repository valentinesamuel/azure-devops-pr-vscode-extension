import { PipelineRunStage } from '../../services/azureDevOpsApiClient';
import { PipelineRunDetails } from '../../pipelineRunDetailsWebview';

export class PipelineRunLayout {
  static render(pipelineRun: PipelineRunDetails, stages: PipelineRunStage[]): string {
    const duration = this.calculateDuration(pipelineRun);
    const formattedDate = this.formatDate(pipelineRun.queueTime);
    const triggerText = this.getTriggerText(pipelineRun);

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pipeline Run #${pipelineRun.buildNumber}</title>
        <style>
          ${this.getStyles()}
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="header-left">
              <span class="status-icon ${this.getStatusClass(pipelineRun)}">${this.getStatusIcon(pipelineRun)}</span>
              <h1 class="title">#${pipelineRun.buildNumber} • ${pipelineRun.pipelineName}</h1>
            </div>
            <button class="run-new-btn" onclick="handleRunNew()">Run new</button>
          </div>

          <!-- Retention Notice -->
          <div class="retention-notice">
            <span class="info-icon">ℹ️</span>
            <span>This run is being retained as one of 3 recent runs by ${pipelineRun.sourceBranch} (Branch).</span>
            <a href="#" class="link">View retention leases</a>
          </div>

          <!-- Summary Section -->
          <div class="summary-section">
            <div class="trigger-info">
              <div class="user-info">
                <span class="user-avatar">${this.getUserInitials(pipelineRun.requestedFor)}</span>
                <span class="trigger-text">${triggerText}</span>
              </div>
              <button class="view-change-btn">View change</button>
            </div>

            <!-- Details Grid -->
            <div class="details-grid">
              <div class="detail-section">
                <h3 class="section-title">Repository and version</h3>
                <div class="detail-item">
                  <span class="icon">📦</span>
                  <span>${pipelineRun.repository.repository}</span>
                </div>
                <div class="detail-item">
                  <span class="icon">🌿</span>
                  <span>${pipelineRun.sourceBranch}</span>
                  <span class="commit-hash">${pipelineRun.sourceVersion}</span>
                </div>
              </div>

              <div class="detail-section">
                <h3 class="section-title">Time started and elapsed</h3>
                <div class="detail-item">
                  <span class="icon">📅</span>
                  <span>${formattedDate}</span>
                </div>
                <div class="detail-item">
                  <span class="icon">⏱️</span>
                  <span>${duration}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Stages Section -->
          <div class="stages-section">
            <h2 class="stages-title">Stages</h2>

            <div class="stages-list">
              ${this.renderStages(stages)}
            </div>
          </div>
        </div>

        <script>
          const vscode = acquireVsCodeApi();

          function handleRunNew() {
            vscode.postMessage({
              command: 'openInBrowser'
            });
          }
        </script>
      </body>
      </html>
    `;
  }

  private static renderStages(stages: PipelineRunStage[]): string {
    if (!stages || stages.length === 0) {
      // Dummy data for demonstration
      return `
        <div class="stage-wrapper">
          <div class="stage-card succeeded">
            <div class="stage-header">
              <span class="stage-icon">✓</span>
              <span class="stage-name">DEV</span>
            </div>
            <div class="stage-info">
              <span>1 job completed</span>
              <span class="stage-duration">2m 59s</span>
            </div>
            <div class="stage-artifacts">
              <span class="icon">📦</span>
              <span>1 artifact</span>
            </div>
          </div>
          <div class="stage-connector"></div>
        </div>

        <div class="stage-wrapper">
          <div class="stage-card skipped">
            <div class="stage-header">
              <span class="stage-icon">○</span>
              <span class="stage-name">QA</span>
            </div>
            <div class="stage-info">
              <span>Skipped</span>
            </div>
          </div>
          <div class="stage-connector"></div>
        </div>

        <div class="stage-wrapper">
          <div class="stage-card skipped">
            <div class="stage-header">
              <span class="stage-icon">○</span>
              <span class="stage-name">PROD</span>
            </div>
            <div class="stage-info">
              <span>Skipped</span>
            </div>
          </div>
        </div>
      `;
    }

    return stages
      .map(
        (stage, index) => `
      <div class="stage-wrapper">
        <div class="stage-card ${this.getStageClass(stage)}">
          <div class="stage-header">
            <span class="stage-icon">${this.getStageIcon(stage)}</span>
            <span class="stage-name">${stage.name}</span>
          </div>
          <div class="stage-info">
            <span>${this.getStageStatusText(stage)}</span>
            ${stage.finishTime && stage.startTime ? `<span class="stage-duration">${this.calculateStageDuration(stage)}</span>` : ''}
          </div>
        </div>
        ${index < stages.length - 1 ? '<div class="stage-connector"></div>' : ''}
      </div>
    `,
      )
      .join('');
  }

  private static getStageClass(stage: PipelineRunStage): string {
    if (stage.result === 'succeeded') {
      return 'succeeded';
    }
    if (stage.result === 'failed') {
      return 'failed';
    }
    if (stage.state === 'inProgress') {
      return 'in-progress';
    }
    if (stage.result === 'skipped' || stage.state === 'skipped') {
      return 'skipped';
    }
    return 'pending';
  }

  private static getStageIcon(stage: PipelineRunStage): string {
    if (stage.state === 'inProgress') {
      return '⟳';
    }
    if (stage.result === 'succeeded') {
      return '✓';
    }
    if (stage.result === 'failed') {
      return '✗';
    }
    if (stage.result === 'skipped' || stage.state === 'skipped') {
      return '○';
    }
    return '○';
  }

  private static getStageStatusText(stage: PipelineRunStage): string {
    if (stage.state === 'inProgress') {
      return 'Running';
    }
    if (stage.result === 'succeeded') {
      return 'Completed';
    }
    if (stage.result === 'failed') {
      return 'Failed';
    }
    if (stage.result === 'skipped' || stage.state === 'skipped') {
      return 'Skipped';
    }
    return 'Pending';
  }

  private static calculateStageDuration(stage: PipelineRunStage): string {
    if (!stage.startTime || !stage.finishTime) {
      return '';
    }

    const durationMs = stage.finishTime.getTime() - stage.startTime.getTime();
    const minutes = Math.floor(durationMs / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

    if (minutes === 0) {
      return `${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  }

  private static getTriggerText(pipelineRun: PipelineRunDetails): string {
    if (pipelineRun.reason === 'individualCI') {
      return `Individual CI by ${pipelineRun.requestedFor}`;
    }
    if (pipelineRun.reason === 'manual') {
      return `Manually run by ${pipelineRun.requestedFor}`;
    }
    return `Triggered by ${pipelineRun.requestedFor}`;
  }

  private static getUserInitials(name: string): string {
    if (!name) {
      return 'U';
    }
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  private static getStatusClass(pipelineRun: PipelineRunDetails): string {
    if (pipelineRun.status === 'inProgress') {
      return 'status-running';
    }
    if (pipelineRun.result === 'succeeded') {
      return 'status-success';
    }
    if (pipelineRun.result === 'failed') {
      return 'status-failed';
    }
    if (pipelineRun.result === 'canceled') {
      return 'status-canceled';
    }
    return 'status-pending';
  }

  private static getStatusIcon(pipelineRun: PipelineRunDetails): string {
    if (pipelineRun.status === 'inProgress') {
      return '⟳';
    }
    if (pipelineRun.result === 'succeeded') {
      return '✓';
    }
    if (pipelineRun.result === 'failed') {
      return '✗';
    }
    if (pipelineRun.result === 'canceled') {
      return '⊘';
    }
    return '○';
  }

  private static calculateDuration(pipelineRun: PipelineRunDetails): string {
    if (!pipelineRun.startTime) {
      return 'Not started';
    }

    const endTime = pipelineRun.finishTime || new Date();
    const durationMs = endTime.getTime() - pipelineRun.startTime.getTime();
    const minutes = Math.floor(durationMs / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

    if (minutes === 0) {
      return `${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  }

  private static formatDate(date: Date): string {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year} at ${hours}:${minutes}`;
  }

  private static getStyles(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background-color: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
        padding: 24px;
        line-height: 1.6;
      }

      .container {
        max-width: 1400px;
        margin: 0 auto;
      }

      /* Header */
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--vscode-panel-border);
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .status-icon {
        font-size: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: 12px;
        backdrop-filter: blur(10px);
      }

      .status-success {
        color: #16c60c;
        background: linear-gradient(135deg, rgba(22, 198, 12, 0.15), rgba(22, 198, 12, 0.05));
        box-shadow: 0 2px 8px rgba(22, 198, 12, 0.2);
      }

      .status-failed {
        color: #e81123;
        background: linear-gradient(135deg, rgba(232, 17, 35, 0.15), rgba(232, 17, 35, 0.05));
        box-shadow: 0 2px 8px rgba(232, 17, 35, 0.2);
      }

      .status-running {
        color: #0078d4;
        background: linear-gradient(135deg, rgba(0, 120, 212, 0.15), rgba(0, 120, 212, 0.05));
        box-shadow: 0 2px 8px rgba(0, 120, 212, 0.2);
      }

      .status-canceled {
        color: #797979;
        background: linear-gradient(135deg, rgba(121, 121, 121, 0.15), rgba(121, 121, 121, 0.05));
        box-shadow: 0 2px 8px rgba(121, 121, 121, 0.2);
      }

      .title {
        font-size: 26px;
        font-weight: 600;
        letter-spacing: -0.5px;
      }

      .run-new-btn {
        background: linear-gradient(135deg, #0078d4, #106ebe);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0, 120, 212, 0.3);
      }

      .run-new-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 120, 212, 0.4);
      }

      .run-new-btn:active {
        transform: translateY(0);
      }

      /* Retention Notice */
      .retention-notice {
        background: linear-gradient(135deg, rgba(0, 120, 212, 0.08), rgba(0, 120, 212, 0.03));
        color: var(--vscode-editorInfo-foreground);
        padding: 14px 18px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;
        border-left: 3px solid #0078d4;
        backdrop-filter: blur(10px);
      }

      .info-icon {
        font-size: 18px;
      }

      /* Tabs */
      .tabs {
        display: flex;
        gap: 20px;
        border-bottom: 1px solid var(--vscode-panel-border);
        margin-bottom: 20px;
      }

      .tab {
        background: none;
        border: none;
        color: var(--vscode-foreground);
        padding: 8px 0;
        cursor: pointer;
        font-size: 14px;
        border-bottom: 2px solid transparent;
        opacity: 0.7;
      }

      .tab.active {
        opacity: 1;
        border-bottom-color: #0078d4;
      }

      .tab:hover {
        opacity: 1;
      }

      /* Summary Section */
      .summary-section {
        background-color: var(--vscode-editor-background);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .trigger-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #d13438, #a02830);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(209, 52, 56, 0.3);
      }

      .trigger-text {
        font-size: 15px;
        font-weight: 500;
      }

      .view-change-btn {
        background: none;
        border: 1px solid var(--vscode-button-border);
        color: var(--vscode-button-foreground);
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .view-change-btn:hover {
        background-color: var(--vscode-button-hoverBackground);
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      }

      /* Details Grid */
      .details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 24px;
      }

      .detail-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .section-title {
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 8px;
        opacity: 0.8;
      }

      .detail-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
      }

      .icon {
        font-size: 14px;
        opacity: 0.7;
      }

      .commit-hash {
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
        background-color: var(--vscode-textCodeBlock-background);
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        border: 1px solid var(--vscode-panel-border);
      }

      .link {
        color: #0078d4;
        text-decoration: none;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .link:hover {
        text-decoration: underline;
        color: #106ebe;
      }

      /* Stages Section */
      .stages-section {
        background-color: var(--vscode-editor-background);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .stages-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 24px;
        letter-spacing: -0.5px;
        color: var(--vscode-foreground);
      }

      .stages-list {
        display: flex;
        align-items: center;
        gap: 0;
        flex-wrap: wrap;
      }

      .stage-wrapper {
        display: flex;
        align-items: center;
        gap: 0;
      }

      .stage-connector {
        width: 40px;
        height: 2px;
        background-color: var(--vscode-panel-border);
        position: relative;
        margin: 0;
      }

      .stage-connector::before {
        content: '';
        position: absolute;
        right: -4px;
        top: -3px;
        width: 0;
        height: 0;
        border-left: 8px solid var(--vscode-panel-border);
        border-top: 4px solid transparent;
        border-bottom: 4px solid transparent;
      }

      .stage-card {
        background-color: var(--vscode-editor-background);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 10px;
        padding: 18px;
        min-width: 280px;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
      }

      .stage-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .stage-card.succeeded {
        border-left: 4px solid #16c60c;
        background: linear-gradient(135deg, rgba(22, 198, 12, 0.05), transparent);
      }

      .stage-card.failed {
        border-left: 4px solid #e81123;
        background: linear-gradient(135deg, rgba(232, 17, 35, 0.05), transparent);
      }

      .stage-card.in-progress {
        border-left: 4px solid #0078d4;
        background: linear-gradient(135deg, rgba(0, 120, 212, 0.05), transparent);
      }

      .stage-card.skipped {
        border-left: 4px solid #797979;
        background: linear-gradient(135deg, rgba(121, 121, 121, 0.05), transparent);
      }

      .stage-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
      }

      .stage-icon {
        font-size: 24px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
      }

      .stage-card.succeeded .stage-icon {
        color: #16c60c;
        background-color: rgba(22, 198, 12, 0.1);
      }

      .stage-card.failed .stage-icon {
        color: #e81123;
        background-color: rgba(232, 17, 35, 0.1);
      }

      .stage-card.in-progress .stage-icon {
        color: #0078d4;
        background-color: rgba(0, 120, 212, 0.1);
      }

      .stage-card.skipped .stage-icon {
        color: #797979;
        background-color: rgba(121, 121, 121, 0.1);
      }

      .stage-name {
        font-weight: 600;
        font-size: 16px;
        letter-spacing: -0.3px;
      }

      .stage-info {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        opacity: 0.8;
        margin-bottom: 8px;
      }

      .stage-duration {
        font-weight: 500;
      }

      .stage-artifacts {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        opacity: 0.7;
      }
    `;
  }
}
