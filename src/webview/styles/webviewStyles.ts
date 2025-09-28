export class WebviewStyles {
  static getTailwindConfig(): string {
    return `
      <script>
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                'azure-dark': '#1e1e1e',
                'azure-darker': '#252526',
                'azure-border': '#3c3c3c',
                'azure-text': '#cccccc',
                'azure-text-dim': '#969696',
                'azure-blue': '#0078d4',
                'azure-green': '#16a34a',
                'azure-success': '#10b981'
              }
            }
          }
        }
      </script>`;
  }

  static getCustomStyles(): string {
    return `
      <style>
        .nav-indicator::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background-color: #0078d4;
        }
        .timeline-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #16a34a;
          margin-right: 8px;
          margin-top: 6px;
          flex-shrink: 0;
        }
        .check-circle {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: #16a34a;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
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
        }
        .sidebar-card {
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }
        .merge-info-card {
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
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
