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
                'vscode-hover': 'var(--vscode-list-hoverBackground)',
                'vscode-list-hover-bg': 'var(--vscode-list-hoverBackground)',
                'vscode-list-active-bg': 'var(--vscode-list-activeSelectionBackground)',
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
                'azure': '#0078d4',
                'success-green': '#16c60c',
              },
              borderWidth: {
                '1.5': '1.5px',
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

        .view-web-icon {
          transition: transform 0.2s ease;
        }

        button:hover .view-web-icon {
          transform: translate(2px, -2px);
        }

        .modern-card {
          animation: fadeInUp 0.4s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .content-card {
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }

        /* File tree selected state - ensure text remains readable */
        .file-item.selected-file,
        .folder-item.selected-folder {
          background-color: var(--vscode-list-activeSelectionBackground) !important;
        }

        .file-item.selected-file span,
        .folder-item.selected-folder span {
          color: var(--vscode-list-activeSelectionForeground) !important;
        }

        .file-item.selected-file svg,
        .folder-item.selected-folder svg {
          color: var(--vscode-list-activeSelectionForeground) !important;
          opacity: 1 !important;
        }

        .content-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        /* Spinner animation for loading states */
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        .sidebar-card {
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }

        .sidebar-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        /* Syntax highlighting adjustments */
        pre, code {
          margin: 0;
          padding: 0;
          background: transparent !important;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: inherit;
          line-height: 1.5;
        }

        pre code {
          display: inline;
          white-space: pre;
        }

        /* File tree collapse transition */
        #fileTreePanel {
          transition: width 0.3s ease, opacity 0.3s ease;
          overflow: hidden;
        }

        #fileTreePanel.collapsed {
          width: 0 !important;
          opacity: 0 !important;
          border: none;
          padding: 0;
          margin: 0;
        }

        #expandFileTreeBtn {
          transition: opacity 0.3s ease;
        }
      </style>`;
  }

  static getPrismStyles(): string {
    return `
      <!-- Highlight.js for syntax highlighting -->
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs2015.min.css">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/javascript.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/typescript.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/python.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/java.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/csharp.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/css.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/scss.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/yaml.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/markdown.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/bash.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/sql.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/dockerfile.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/go.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/rust.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/php.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/ruby.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/json.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/xml.min.js"></script>
      <style>
        /* Custom Highlight.js theme adjustments for VS Code integration */
        .hljs {
          background: transparent !important;
          padding: 0 !important;
        }

        .hljs-comment,
        .hljs-quote {
          color: #6A9955;
          font-style: italic;
        }

        .hljs-keyword,
        .hljs-selector-tag,
        .hljs-literal,
        .hljs-type {
          color: #569CD6;
        }

        .hljs-string,
        .hljs-doctag {
          color: #CE9178;
        }

        .hljs-title,
        .hljs-section,
        .hljs-selector-id {
          color: #DCDCAA;
        }

        .hljs-subst,
        .hljs-type,
        .hljs-class .hljs-title,
        .hljs-tag {
          color: #4EC9B0;
        }

        .hljs-number,
        .hljs-literal,
        .hljs-variable,
        .hljs-template-variable,
        .hljs-attribute {
          color: #B5CEA8;
        }

        .hljs-symbol,
        .hljs-bullet,
        .hljs-link {
          color: #4FC1FF;
        }

        .hljs-meta,
        .hljs-selector-attr,
        .hljs-selector-pseudo {
          color: #9CDCFE;
        }

        .hljs-built_in,
        .hljs-builtin-name {
          color: #4EC9B0;
        }

        .hljs-attr {
          color: #9CDCFE;
        }

        .hljs-function .hljs-title {
          color: #DCDCAA;
        }

        .hljs-name {
          color: #4EC9B0;
        }

        .hljs-tag .hljs-name {
          color: #569CD6;
        }

        .hljs-tag .hljs-attr {
          color: #9CDCFE;
        }

        .hljs-params {
          color: var(--vscode-editor-foreground);
        }
      </style>
    `;
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
        ${this.getPrismStyles()}
      </head>`;
  }
}
