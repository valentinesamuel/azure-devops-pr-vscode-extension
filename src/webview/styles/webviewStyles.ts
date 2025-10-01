export class WebviewStyles {
  static getTailwindConfig(): string {
    return `
      <script>
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                'vscode-bg': 'var(--vscode-editor-background)',
                'vscode-fg': 'var(--vscode-editor-foreground)',
                'vscode-border': 'var(--vscode-panel-border)',
                'vscode-input-bg': 'var(--vscode-input-background)',
                'vscode-input-fg': 'var(--vscode-input-foreground)',
                'vscode-input-border': 'var(--vscode-input-border)',
                'vscode-button-bg': 'var(--vscode-button-background)',
                'vscode-button-hover': 'var(--vscode-button-hoverBackground)',
                'vscode-button-fg': 'var(--vscode-button-foreground)',
                'vscode-link': 'var(--vscode-textLink-foreground)',
                'vscode-link-hover': 'var(--vscode-textLink-activeForeground)',
                'vscode-badge-bg': 'var(--vscode-badge-background)',
                'vscode-badge-fg': 'var(--vscode-badge-foreground)',
                'vscode-success': 'var(--vscode-testing-iconPassed)',
                'vscode-error': 'var(--vscode-testing-iconFailed)',
                'vscode-warning': 'var(--vscode-testing-iconQueued)',
                'vscode-info': 'var(--vscode-notificationsInfoIcon-foreground)',
              }
            }
          }
        }
      </script>`;
  }

  static getCustomStyles(): string {
    return `
      <style>
        :root {
          color-scheme: light dark;
        }

        body {
          background-color: var(--vscode-editor-background);
          color: var(--vscode-editor-foreground);
        }

        .nav-indicator::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--vscode-textLink-foreground);
        }

        .timeline-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--vscode-testing-iconPassed);
          margin-right: 8px;
          margin-top: 6px;
          flex-shrink: 0;
        }

        .check-circle {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: var(--vscode-testing-iconPassed);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--vscode-button-foreground);
          font-size: 10px;
        }

        .icon-check {
          width: 12px;
          height: 12px;
        }

        .icon-user {
          width: 16px;
          height: 16px;
        }

        .icon-merge {
          width: 16px;
          height: 16px;
        }

        .content-card {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
          background-color: var(--vscode-editor-background);
          border-color: var(--vscode-panel-border);
        }

        .sidebar-card {
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
          background-color: var(--vscode-sideBar-background);
          border-color: var(--vscode-panel-border);
        }

        .merge-info-card {
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
          background-color: var(--vscode-input-background);
          border-color: var(--vscode-input-border);
        }
      </style>`;
  }

  static getHtmlHead(): string {
    return `
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pull Request Details</title>
        <script src="https://cdn.tailwindcss.com"></script>
        ${this.getTailwindConfig()}
        ${this.getCustomStyles()}
      </head>`;
  }
}
