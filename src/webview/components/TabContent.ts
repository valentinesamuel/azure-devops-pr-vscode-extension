export class TabContent {
  static renderFilesContent(): string {
    return `
      <div id="filesContent" class="tab-content hidden h-full flex gap-4">
        <!-- Left Column - File Tree -->
        <div class="w-80 bg-azure-darker rounded-lg border border-azure-border overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="p-4 border-b border-azure-border">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-medium text-white">All Changes</h3>
              <button class="bg-azure-dark border border-azure-border text-azure-text-dim px-2 py-1 rounded text-xs hover:bg-azure-border transition-colors flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd"/>
                </svg>
                Filter
              </button>
            </div>
            <div class="text-xs text-azure-text-dim">58 changed files</div>
          </div>

          <!-- File Conflict Alert -->
          <div class="mx-4 mt-4 bg-orange-900/20 border border-orange-600/30 rounded p-3">
            <div class="flex items-start">
              <svg class="w-4 h-4 text-orange-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <p class="text-xs text-orange-200">There are some conflict resolutions applied that aren't visible in the Files tab.</p>
                <button class="text-xs text-orange-300 hover:underline mt-1">Review merge commit</button>
              </div>
            </div>
          </div>

          <!-- File Tree -->
          <div class="flex-1 overflow-y-auto p-4">
            <div class="space-y-1">
              <!-- kui_account_ms folder -->
              <div class="file-tree-item">
                <button class="w-full flex items-center p-2 hover:bg-azure-dark rounded text-sm text-azure-text-dim hover:text-white transition-colors" onclick="toggleFolder(this)">
                  <svg class="w-3 h-3 mr-2 folder-chevron transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <svg class="w-4 h-4 mr-2 text-azure-blue" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                  </svg>
                  <span class="flex-1 text-left">kui_account_ms</span>
                  <span class="text-xs bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded">1</span>
                </button>
                <div class="folder-content hidden ml-5">
                  <button class="w-full flex items-center p-2 hover:bg-azure-dark rounded text-sm text-azure-text-dim hover:text-white transition-colors file-item" onclick="selectFile(this, 'account-me-ci.yml')">
                    <svg class="w-4 h-4 mr-2 text-azure-text-dim" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                    </svg>
                    <span class="flex-1 text-left">account-me-ci.yml</span>
                  </button>
                </div>
              </div>

              <!-- azureblobstorage.providers folder -->
              <div class="file-tree-item">
                <button class="w-full flex items-center p-2 hover:bg-azure-dark rounded text-sm text-azure-text-dim hover:text-white transition-colors" onclick="toggleFolder(this)">
                  <svg class="w-3 h-3 mr-2 folder-chevron transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <svg class="w-4 h-4 mr-2 text-azure-blue" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                  </svg>
                  <span class="flex-1 text-left">azureblobstorage.providers</span>
                  <span class="text-xs bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded">1</span>
                </button>
                <div class="folder-content hidden ml-5">
                  <button class="w-full flex items-center p-2 hover:bg-azure-dark rounded text-sm text-azure-text-dim hover:text-white transition-colors file-item" onclick="selectFile(this, 'azureblobstorage.providers.ts')">
                    <svg class="w-4 h-4 mr-2 text-azure-text-dim" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                    </svg>
                    <span class="flex-1 text-left">azureblobstorage.providers.ts</span>
                  </button>
                </div>
              </div>

              <!-- client folder -->
              <div class="file-tree-item">
                <button class="w-full flex items-center p-2 hover:bg-azure-dark rounded text-sm text-azure-text-dim hover:text-white transition-colors" onclick="toggleFolder(this)">
                  <svg class="w-3 h-3 mr-2 folder-chevron transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <svg class="w-4 h-4 mr-2 text-azure-blue" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                  </svg>
                  <span class="flex-1 text-left">client</span>
                  <span class="text-xs bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded">2</span>
                </button>
                <div class="folder-content hidden ml-5">
                  <button class="w-full flex items-center p-2 hover:bg-azure-dark rounded text-sm text-azure-text-dim hover:text-white transition-colors file-item" onclick="selectFile(this, 'baseClient.httpClient.ts')">
                    <svg class="w-4 h-4 mr-2 text-azure-text-dim" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                    </svg>
                    <span class="flex-1 text-left">baseClient.httpClient.ts</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - File Diff Content -->
        <div class="flex-1 bg-azure-darker rounded-lg border border-azure-border overflow-hidden flex flex-col">
          <div id="fileDiffContent" class="h-full">
            <!-- Empty State -->
            <div id="emptyState" class="h-full flex items-center justify-center text-azure-text-dim">
              <div class="text-center">
                <svg class="w-16 h-16 mx-auto mb-4 text-azure-border" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
                </svg>
                <p class="text-sm">Select a file to view diff</p>
              </div>
            </div>

            <!-- File Diff View (Initially Hidden) -->
            <div id="diffView" class="h-full flex flex-col hidden">
              <!-- File Header -->
              <div class="p-4 border-b border-azure-border bg-azure-dark/30">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <span id="fileName" class="text-sm font-medium text-white">account-me-ci.yml</span>
                    <span class="text-xs text-azure-text-dim bg-azure-darker px-2 py-1 rounded">+7</span>
                  </div>
                  <button class="text-azure-blue text-sm hover:underline">View</button>
                </div>
              </div>

              <!-- Diff Content -->
              <div class="flex-1 overflow-y-auto">
                <div class="font-mono text-xs">
                  <!-- Sample diff content -->
                  <div class="diff-line flex">
                    <span class="w-12 text-right px-2 bg-azure-dark/50 text-azure-text-dim select-none">74</span>
                    <span class="w-12 text-right px-2 bg-azure-dark/50 text-azure-text-dim select-none">74</span>
                    <span class="flex-1 px-4 py-1">          --build-arg REDIS_PASSWORD=\${REDIS_PASSWORD} \\</span>
                  </div>
                  <div class="diff-line flex bg-red-900/20">
                    <span class="w-12 text-right px-2 bg-red-900/30 text-azure-text-dim select-none">75</span>
                    <span class="w-12 text-right px-2 bg-red-900/30 text-azure-text-dim select-none"></span>
                    <span class="flex-1 px-4 py-1 bg-red-900/20">          --build-arg REDIS_METAFLOW_CACHE_EXPIRE=\${REDIS_METAFLOW_CACHE_EXPIRE} \\</span>
                  </div>
                  <div class="diff-line flex bg-green-900/20">
                    <span class="w-12 text-right px-2 bg-green-900/30 text-azure-text-dim select-none"></span>
                    <span class="w-12 text-right px-2 bg-green-900/30 text-azure-text-dim select-none">75</span>
                    <span class="flex-1 px-4 py-1 bg-green-900/20">          --build-arg REDIS_METAFLOW_CACHE_EXPIRE=\${REDIS_METAFLOW_CACHE_EXPIRE} \\</span>
                  </div>
                  <div class="diff-line flex">
                    <span class="w-12 text-right px-2 bg-azure-dark/50 text-azure-text-dim select-none">76</span>
                    <span class="w-12 text-right px-2 bg-azure-dark/50 text-azure-text-dim select-none">76</span>
                    <span class="flex-1 px-4 py-1">          --build-arg SENTRY_DSN=\${SENTRY_DSN} \\</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  static renderUpdatesContent(): string {
    return `
      <div id="updatesContent" class="tab-content bg-azure-darker rounded-lg border border-azure-border content-card p-8 hidden">
        <h3 class="text-lg font-medium text-white mb-4">Updates</h3>
        <p class="text-azure-text-dim">Updates content would go here...</p>
      </div>`;
  }

  static renderCommitsContent(): string {
    return `
      <div id="commitsContent" class="tab-content bg-azure-darker rounded-lg border border-azure-border content-card p-8 hidden">
        <h3 class="text-lg font-medium text-white mb-4">Commits</h3>
        <p class="text-azure-text-dim">Commits content would go here...</p>
      </div>`;
  }

  static renderConflictsContent(): string {
    return `
      <div id="conflictsContent" class="tab-content bg-azure-darker rounded-lg border border-azure-border content-card p-8 hidden">
        <h3 class="text-lg font-medium text-white mb-4">Conflicts</h3>
        <p class="text-azure-text-dim">Conflicts content would go here...</p>
      </div>`;
  }
}
