import {
  PipelineRunStage,
  PipelineRunJob,
  PipelineRunTask,
} from '../../services/azureDevOpsApiClient';

export interface StageJob extends PipelineRunJob {
  tasks: StageTask[];
}

export interface StageTask extends PipelineRunTask {
  logs?: string[];
}

export interface StageDetailsData {
  pipelineName: string;
  buildNumber: string;
  buildId: number;
  project: string;
  stage: PipelineRunStage;
  jobs: StageJob[];
  isLoading?: boolean;
}

export class StageDetailsLayout {
  static render(data: StageDetailsData): string {
    const { pipelineName, buildNumber, stage, jobs } = data;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${stage.name} - ${pipelineName}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            darkMode: 'class',
            theme: {
              extend: {
                colors: {
                  vscode: {
                    bg: 'var(--vscode-editor-background)',
                    fg: 'var(--vscode-editor-foreground)',
                    border: 'var(--vscode-panel-border)',
                    success: '#16c60c',
                    error: '#e81123',
                    warning: '#ffb900',
                    info: '#0078d4',
                  }
                }
              }
            }
          }
        </script>
        <style>
          body {
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
          }

          .task-item:hover {
            background-color: var(--vscode-list-hoverBackground);
          }

          .task-item.selected {
            background-color: var(--vscode-list-activeSelectionBackground);
          }

          .scrollbar-thin::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          .scrollbar-thin::-webkit-scrollbar-track {
            background: var(--vscode-scrollbarSlider-background);
          }

          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: var(--vscode-scrollbarSlider-hoverBackground);
            border-radius: 4px;
          }

          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: var(--vscode-scrollbarSlider-activeBackground);
          }
        </style>
      </head>
      <body class="h-screen flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b" style="border-color: var(--vscode-panel-border)">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <button onclick="goBack()" class="p-2 hover:bg-opacity-10 hover:bg-white rounded">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <div>
                <h1 class="text-lg font-semibold">Jobs in run #${buildNumber}</h1>
                <p class="text-sm opacity-70">${pipelineName}</p>
              </div>
            </div>
            <button class="px-4 py-2 text-sm font-medium rounded hover:bg-opacity-10 hover:bg-white">
              View raw log
            </button>
          </div>
        </div>

        <!-- Main Content - Two Column Layout -->
        <div class="flex flex-1 overflow-hidden">
          <!-- Left Sidebar - Stages and Jobs Tree -->
          <div class="w-[25%] border-r overflow-y-auto scrollbar-thin" style="border-color: var(--vscode-panel-border)">
            ${this.renderStagesTree(data)}
          </div>

          <!-- Right Panel - Job Details and Logs -->
          <div id="task-details-panel" class="flex-1 flex flex-col overflow-hidden">
            ${this.renderJobDetails(data)}
          </div>
        </div>

        <script>
          const vscode = acquireVsCodeApi();
          let selectedTask = null;

          // Store task data for dynamic display
          const tasksData = ${JSON.stringify(
            jobs.flatMap((job) =>
              job.tasks.map((task) => ({
                id: task.id,
                jobId: job.id,
                name: task.name,
                state: task.state,
                result: task.result,
                startTime: task.startTime,
                finishTime: task.finishTime,
                logs: task.logs || [],
              })),
            ),
          )};

          function goBack() {
            vscode.postMessage({ command: 'goBack' });
          }

          function selectTask(taskId, jobId) {
            console.log('Task clicked:', taskId, 'in job:', jobId);

            // Remove previous selection
            document.querySelectorAll('.task-item').forEach(el => {
              el.classList.remove('selected');
            });

            // Add selection to clicked task
            const taskElement = document.querySelector(\`[data-task-id="\${taskId}"]\`);
            if (taskElement) {
              taskElement.classList.add('selected');
            }

            selectedTask = taskId;

            // Find task data and update right panel
            const task = tasksData.find(t => t.id === taskId);
            if (task) {
              updateTaskDisplay(task);
            }
          }

          function updateTaskDisplay(task) {
            const rightPanel = document.getElementById('task-details-panel');
            if (!rightPanel) return;

            const statusIcon = getTaskStatusIcon(task);
            const startTime = formatDateTime(task.startTime);
            const duration = calculateDuration(task);

            const logsHtml = task.logs && task.logs.length > 0
              ? formatLogsWithJson(task.logs)
              : \`<div class="flex"><span class="opacity-30 select-none w-12 text-right flex-shrink-0 text-xs pr-3">1</span><span class="opacity-50">No logs available for this task</span></div>\`;

            rightPanel.innerHTML = \`
              <div class="flex-1 flex flex-col overflow-hidden">
                <!-- Job Header -->
                <div class="px-6 py-4 border-b" style="border-color: var(--vscode-panel-border)">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-2xl">\${statusIcon}</span>
                    <h2 class="text-xl font-semibold">\${escapeHtml(task.name)}</h2>
                  </div>
                  <div class="flex items-center gap-6 text-sm opacity-70">
                    <div>
                      <span class="font-medium">Started:</span> \${startTime}
                    </div>
                    <div>
                      <span class="font-medium">Duration:</span> \${duration}
                    </div>
                  </div>
                </div>

                <!-- Log Content -->
                <div class="flex-1 overflow-auto scrollbar-thin font-mono text-sm px-4 py-2" style="background-color: var(--vscode-terminal-background, #0e1117); line-height: 1.5;">
                  \${logsHtml}
                </div>
              </div>
            \`;
          }

          function getTaskStatusIcon(task) {
            if (task.state === 'inProgress') return '⟳';
            if (task.result === 'succeeded') return '✓';
            if (task.result === 'failed') return '✗';
            if (task.result === 'skipped') return '○';
            return '○';
          }

          function formatDateTime(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayName = days[date.getDay()];
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return \`\${dayName} at \${hours}:\${minutes}\`;
          }

          function calculateDuration(task) {
            if (!task.startTime) return '';
            const start = new Date(task.startTime);
            const end = task.finishTime ? new Date(task.finishTime) : new Date();
            const durationMs = end.getTime() - start.getTime();
            if (durationMs < 1000) return '<1s';
            const minutes = Math.floor(durationMs / (1000 * 60));
            const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
            if (minutes === 0) return \`\${seconds}s\`;
            return \`\${minutes}m \${seconds}s\`;
          }

          function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
          }

          function formatLogsWithJson(logs) {
            console.log('formatLogsWithJson called with', logs.length, 'logs');
            console.log('First 5 log lines:', logs.slice(0, 5));
            let result = '';
            let inJson = false;
            let depth = 0;

            for (let i = 0; i < logs.length; i++) {
              const logLine = logs[i];
              // Remove ANSI codes and timestamp, but preserve leading whitespace
              let cleanLine = logLine.replace(/\\[([0-9;]+)m/g, '');
              cleanLine = cleanLine.replace(/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d+Z\\s/, '');
              // Only trim trailing whitespace, not leading
              cleanLine = cleanLine.trimEnd();

              // Check if we're starting a JSON block (trim for detection only)
              const trimmedLine = cleanLine.trim();
              if (!inJson && (trimmedLine.startsWith('{') || trimmedLine.startsWith('['))) {
                console.log('Starting JSON block at line', i, ':', trimmedLine.substring(0, 50));
                inJson = true;
                depth = 0;
              }

              if (inJson) {
                // Use formatJsonLine which preserves Azure DevOps indentation
                const formatted = formatJsonLine(logLine);
                result += \`<div class="flex hover:bg-white hover:bg-opacity-5"><span class="opacity-30 select-none w-12 text-right flex-shrink-0 text-xs pr-3">\${i + 1}</span><span class="whitespace-nowrap">\${formatted}</span></div>\`;

                // Track depth to know when JSON ends
                const openBraces = (trimmedLine.match(/{/g) || []).length;
                const openBrackets = (trimmedLine.match(/\\[/g) || []).length;
                const closeBraces = (trimmedLine.match(/}/g) || []).length;
                const closeBrackets = (trimmedLine.match(/\\]/g) || []).length;

                depth += (openBraces + openBrackets) - (closeBraces + closeBrackets);

                // Exit JSON mode if we're back at depth 0 and line ends with closing bracket/brace
                if (depth <= 0 && (trimmedLine.endsWith('}') || trimmedLine.endsWith(']'))) {
                  inJson = false;
                  depth = 0;
                }
              } else {
                // Regular line - use normal formatting
                const formatted = formatLogLine(logLine);
                result += \`<div class="flex hover:bg-white hover:bg-opacity-5"><span class="opacity-30 select-none w-12 text-right flex-shrink-0 text-xs pr-3">\${i + 1}</span><span class="whitespace-nowrap">\${formatted}</span></div>\`;
              }
            }

            return result;
          }

          function formatJsonLine(logLine) {
            // Special formatting for JSON lines - preserve leading whitespace
            let line = logLine.replace(/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d+Z\\s/, '');
            // Remove ANSI codes
            line = line.replace(/\\[([0-9;]+)m/g, '');
            // Only trim trailing whitespace
            line = line.trimEnd();

            // Convert leading spaces to non-breaking spaces before escaping
            const leadingSpaces = line.match(/^\\s*/)[0];
            const content = line.substring(leadingSpaces.length);
            const nbspIndent = leadingSpaces.replace(/ /g, '&nbsp;');

            line = escapeHtml(content);

            // Syntax highlighting for JSON
            // Highlight property names (keys)
            line = line.replace(/"([^"]+)":/g, '<span style="color: #79c0ff;">"$1"</span>:');

            // Highlight string values
            line = line.replace(/: "([^"]*)"/g, ': <span style="color: #a5d6ff;">"$1"</span>');

            // Highlight numbers
            line = line.replace(/: (-?\\d+\\.?\\d*),?$/g, ': <span style="color: #79c0ff;">$1</span>');

            // Highlight booleans
            line = line.replace(/: (true|false)/g, ': <span style="color: #ff7b72;">$1</span>');

            // Highlight null
            line = line.replace(/: (null)/g, ': <span style="color: #8b949e;">$1</span>');

            // Return with preserved indentation
            return nbspIndent + line;
          }

          function formatLogLine(logLine) {
            // Remove timestamp prefix if present
            let line = logLine.replace(/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d+Z\\s/, '');

            // Escape HTML first
            line = escapeHtml(line);

            // Parse ANSI color codes
            const ansiColors = {
              '30': '#000000', '31': '#cd3131', '32': '#0dbc79', '33': '#e5e510',
              '34': '#2472c8', '35': '#bc3fbc', '36': '#11a8cd', '37': '#e5e5e5',
              '90': '#666666', '91': '#f14c4c', '92': '#23d18b', '93': '#f5f543',
              '94': '#3b8eea', '95': '#d670d6', '96': '#29b8db', '97': '#e5e5e5'
            };

            line = line.replace(/\\[([0-9;]+)m/g, (match, codes) => {
              const codeList = codes.split(';');
              let html = '';
              for (const code of codeList) {
                if (code === '0' || code === '') {
                  html += '</span>';
                } else if (ansiColors[code]) {
                  html += \`<span style="color: \${ansiColors[code]};">\`;
                } else if (code === '1') {
                  html += '<span style="font-weight: bold;">';
                }
              }
              return html;
            });

            line = line.replace(/^(<\\/span>)+/, '');

            // Format Azure DevOps special markers (after ANSI parsing)
            // ##[section] - heading style
            line = line.replace(/##\\[section\\](.+)/g, '<strong style="color: #00d4aa; font-size: 1.1em;">$1</strong>');

            // ##[command] - code style
            line = line.replace(/##\\[command\\](.+)/g, '<code style="color: #58a6ff; background: rgba(110,118,129,0.1); padding: 2px 4px; border-radius: 3px;">$1</code>');

            // ##[error] - error style
            line = line.replace(/##\\[error\\](.+)/g, '<strong style="color: #f85149;">✗ $1</strong>');

            // ##[warning] - warning style
            line = line.replace(/##\\[warning\\](.+)/g, '<strong style="color: #d29922;">⚠ $1</strong>');

            // ##[debug] - debug style (dimmed)
            line = line.replace(/##\\[debug\\](.+)/g, '<span style="color: #8b949e; opacity: 0.7;">$1</span>');

            return line;
          }

          function toggleJob(jobId) {
            const tasksContainer = document.getElementById(\`tasks-\${jobId}\`);
            const chevron = document.getElementById(\`chevron-\${jobId}\`);

            if (tasksContainer.classList.contains('hidden')) {
              tasksContainer.classList.remove('hidden');
              chevron.style.transform = 'rotate(0deg)';
            } else {
              tasksContainer.classList.add('hidden');
              chevron.style.transform = 'rotate(-90deg)';
            }
          }

          // Auto-select first task on load
          document.addEventListener('DOMContentLoaded', () => {
            const firstTask = document.querySelector('.task-item');
            if (firstTask) {
              firstTask.click();
            }
          });
        </script>
      </body>
      </html>
    `;
  }

  private static renderStagesTree(data: StageDetailsData): string {
    const { stage, jobs } = data;

    if (data.isLoading) {
      return `
        <div class="p-4">
          <div class="flex items-center justify-center py-8">
            <p class="text-sm opacity-70">Loading...</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="p-4">
        <!-- Current Stage -->
        <div class="mb-2">
          <div class="flex items-center gap-2 px-3 py-2 rounded font-medium" style="background-color: var(--vscode-list-activeSelectionBackground)">
            <span class="text-lg">${this.getStageIcon(stage)}</span>
            <span>${stage.name}</span>
          </div>
        </div>

        <!-- Jobs List -->
        ${jobs.length > 0 ? jobs.map((job, index) => this.renderJobTree(job, index === 0)).join('') : '<div class="pl-4 text-sm opacity-50">No jobs found</div>'}

        <script>
          console.log('Stage:', ${JSON.stringify(stage.name)});
          console.log('Jobs count:', ${jobs.length});
          ${jobs.map((job, i) => `console.log('Job ${i}:', ${JSON.stringify(job.name)}, 'Tasks:', ${job.tasks.length});`).join('\n          ')}
        </script>
      </div>
    `;
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
    if (stage.result === 'skipped') {
      return '○';
    }
    return '📦';
  }

  private static renderJobTree(job: StageJob, isExpanded: boolean = true): string {
    const statusIcon = this.getJobStatusIcon(job);
    const duration = this.calculateDuration(job);

    return `
      <div class="pl-4 mb-2">
        <button
          onclick="toggleJob('${job.id}')"
          class="flex items-center justify-between w-full px-3 py-2 rounded hover:bg-opacity-10 hover:bg-white text-left"
        >
          <div class="flex items-center gap-2">
            <svg id="chevron-${job.id}" class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
            <span>${statusIcon}</span>
            <span class="font-medium">${job.name}</span>
          </div>
          <span class="text-xs opacity-70">${duration}</span>
        </button>

        <div id="tasks-${job.id}" class="${isExpanded ? '' : 'hidden'} pl-6 mt-1 space-y-1">
          ${job.tasks.map((task) => this.renderTaskTree(task, job.id)).join('')}
        </div>
      </div>
    `;
  }

  private static renderTaskTree(task: StageTask, jobId: string): string {
    const statusIcon = this.getTaskStatusIcon(task);
    const duration = this.calculateDuration(task);

    return `
      <button
        data-task-id="${task.id}"
        onclick="selectTask('${task.id}', '${jobId}')"
        class="task-item flex items-center justify-between w-full px-3 py-1.5 rounded text-sm hover:bg-opacity-10 hover:bg-white text-left"
      >
        <div class="flex items-center gap-2">
          <span class="text-xs">${statusIcon}</span>
          <span>${task.name}</span>
        </div>
        <span class="text-xs opacity-70">${duration}</span>
      </button>
    `;
  }

  private static renderJobDetails(data: StageDetailsData): string {
    if (data.isLoading) {
      return `
        <div class="flex items-center justify-center h-full">
          <div class="flex flex-col items-center gap-4">
            <svg class="animate-spin h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-lg opacity-70">Loading job details...</p>
          </div>
        </div>
      `;
    }

    const job = data.jobs[0];
    if (!job || !job.tasks || job.tasks.length === 0) {
      return `
        <div class="flex items-center justify-center h-full">
          <p class="text-lg opacity-50">Select a task to view logs</p>
        </div>
      `;
    }

    const firstTask = job.tasks[0];

    return `
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Job Header -->
        <div class="px-6 py-4 border-b" style="border-color: var(--vscode-panel-border)">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-2xl">${this.getTaskStatusIcon(firstTask)}</span>
            <h2 class="text-xl font-semibold">${firstTask.name}</h2>
          </div>
          <div class="flex items-center gap-6 text-sm opacity-70">
            <div>
              <span class="font-medium">Started:</span> ${this.formatDateTime(firstTask.startTime)}
            </div>
            <div>
              <span class="font-medium">Duration:</span> ${this.calculateDuration(firstTask)}
            </div>
          </div>
        </div>

        <!-- Log Content -->
        <div class="flex-1 overflow-y-auto scrollbar-thin font-mono text-sm p-4" style="background-color: var(--vscode-terminal-background, #1e1e1e)">
          ${this.renderLogs(firstTask)}
        </div>
      </div>
    `;
  }

  private static renderLogs(task: StageTask): string {
    // Use real logs if available, otherwise show placeholder
    if (task.logs && task.logs.length > 0) {
      return task.logs
        .map(
          (logLine, index) => `
        <div class="flex gap-4">
          <span class="opacity-50 select-none w-12 text-right">${index + 1}</span>
          <span class="flex-1">${this.escapeHtml(logLine)}</span>
        </div>
      `,
        )
        .join('');
    }

    // Fallback to dummy logs if no real logs available
    const logs = [
      { line: 1, content: '##[section]Starting: ' + task.name },
      {
        line: 2,
        content: '==============================================================================',
      },
      { line: 3, content: 'Waiting for log data...' },
      { line: 4, content: '##[section]Finishing: ' + task.name },
    ];

    return logs
      .map(
        (log) => `
      <div class="flex gap-4">
        <span class="opacity-50 select-none w-12 text-right">${log.line}</span>
        <span class="flex-1">${this.escapeHtml(log.content)}</span>
      </div>
    `,
      )
      .join('');
  }

  private static getJobStatusIcon(job: StageJob): string {
    if (job.state === 'inProgress') {
      return '⟳';
    }
    if (job.result === 'succeeded') {
      return '✓';
    }
    if (job.result === 'failed') {
      return '✗';
    }
    if (job.result === 'skipped') {
      return '○';
    }
    return '○';
  }

  private static getTaskStatusIcon(task: StageTask): string {
    if (task.state === 'inProgress') {
      return '⟳';
    }
    if (task.result === 'succeeded') {
      return '✓';
    }
    if (task.result === 'failed') {
      return '✗';
    }
    if (task.result === 'skipped') {
      return '○';
    }
    return '○';
  }

  private static calculateDuration(item: {
    startTime?: Date;
    finishTime?: Date;
    state?: string;
  }): string {
    if (!item.startTime) {
      return '';
    }

    const endTime = item.finishTime || new Date();
    const durationMs = endTime.getTime() - item.startTime.getTime();

    if (durationMs < 1000) {
      return '<1s';
    }

    const minutes = Math.floor(durationMs / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

    if (minutes === 0) {
      return `${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  }

  private static formatDateTime(date?: Date): string {
    if (!date) {
      return '';
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[date.getDay()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${dayName} at ${hours}:${minutes}`;
  }

  private static escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
