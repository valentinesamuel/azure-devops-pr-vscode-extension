import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface AzureDevOpsRepository {
  workspaceFolder: vscode.WorkspaceFolder;
  organization: string;
  project: string;
  repository: string;
  remoteUrl: string;
}

export class GitService {
  /**
   * Detects all workspace folders with Azure DevOps git remotes
   */
  async detectAzureDevOpsRepositories(): Promise<AzureDevOpsRepository[]> {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders) {
      return [];
    }

    const repositories: AzureDevOpsRepository[] = [];

    for (const folder of workspaceFolders) {
      const remoteUrl = await this.getGitRemoteUrl(folder.uri.fsPath);

      if (remoteUrl) {
        const repoInfo = this.parseAzureDevOpsUrl(remoteUrl);

        if (repoInfo) {
          repositories.push({
            workspaceFolder: folder,
            organization: repoInfo.organization,
            project: repoInfo.project,
            repository: repoInfo.repository,
            remoteUrl,
          });
        }
      }
    }

    return repositories;
  }

  /**
   * Gets the git remote URL for a workspace folder
   */
  private async getGitRemoteUrl(folderPath: string): Promise<string | null> {
    try {
      const { stdout } = await execAsync('git config --get remote.origin.url', {
        cwd: folderPath,
      });

      return stdout.trim();
    } catch (error) {
      // Not a git repository or no remote configured
      return null;
    }
  }

  /**
   * Parses an Azure DevOps URL to extract organization, project, and repository
   * Supports both SSH and HTTPS formats:
   * - https://dev.azure.com/{organization}/{project}/_git/{repository}
   * - https://{organization}@dev.azure.com/{organization}/{project}/_git/{repository}
   * - {organization}@vs-ssh.visualstudio.com:v3/{organization}/{project}/{repository}
   * - git@ssh.dev.azure.com:v3/{organization}/{project}/{repository}
   */
  private parseAzureDevOpsUrl(url: string): {
    organization: string;
    project: string;
    repository: string;
  } | null {
    // HTTPS format with organization prefix: https://{organization}@dev.azure.com/{organization}/{project}/_git/{repository}
    const httpsWithOrgMatch = url.match(
      /https?:\/\/([^@]+)@dev\.azure\.com\/[^/]+\/([^/]+)\/_git\/([^/]+)/,
    );
    if (httpsWithOrgMatch) {
      return {
        organization: httpsWithOrgMatch[1],
        project: httpsWithOrgMatch[2],
        repository: httpsWithOrgMatch[3],
      };
    }

    // HTTPS format standard: https://dev.azure.com/{organization}/{project}/_git/{repository}
    const httpsMatch = url.match(/https?:\/\/dev\.azure\.com\/([^/]+)\/([^/]+)\/_git\/([^/]+)/);
    if (httpsMatch) {
      return {
        organization: httpsMatch[1],
        project: httpsMatch[2],
        repository: httpsMatch[3],
      };
    }

    // SSH format (old): {organization}@vs-ssh.visualstudio.com:v3/{organization}/{project}/{repository}
    const sshOldMatch = url.match(/([^@]+)@vs-ssh\.visualstudio\.com:v3\/[^/]+\/([^/]+)\/([^/]+)/);
    if (sshOldMatch) {
      return {
        organization: sshOldMatch[1],
        project: sshOldMatch[2],
        repository: sshOldMatch[3],
      };
    }

    // SSH format (new): git@ssh.dev.azure.com:v3/{organization}/{project}/{repository}
    const sshNewMatch = url.match(/git@ssh\.dev\.azure\.com:v3\/([^/]+)\/([^/]+)\/([^/]+)/);
    if (sshNewMatch) {
      return {
        organization: sshNewMatch[1],
        project: sshNewMatch[2],
        repository: sshNewMatch[3],
      };
    }

    return null;
  }

  /**
   * Gets the repository information for a specific workspace folder
   */
  async getRepositoryInfo(folderPath: string): Promise<AzureDevOpsRepository | null> {
    const remoteUrl = await this.getGitRemoteUrl(folderPath);

    if (!remoteUrl) {
      return null;
    }

    const repoInfo = this.parseAzureDevOpsUrl(remoteUrl);

    if (!repoInfo) {
      return null;
    }

    // Find the workspace folder
    const workspaceFolder = vscode.workspace.workspaceFolders?.find(
      (folder) => folder.uri.fsPath === folderPath,
    );

    if (!workspaceFolder) {
      return null;
    }

    return {
      workspaceFolder,
      organization: repoInfo.organization,
      project: repoInfo.project,
      repository: repoInfo.repository,
      remoteUrl,
    };
  }
}
