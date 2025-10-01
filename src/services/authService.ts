import * as vscode from 'vscode';

export class AuthService {
  private static readonly SECRET_KEY = 'azureDevOpsPat';
  private static readonly ORG_KEY = 'azureDevOpsOrg';
  private static readonly PROJECT_KEY = 'azureDevOpsProject';

  constructor(private context: vscode.ExtensionContext) {}

  /**
   * Prompts user to enter their Azure DevOps Personal Access Token
   * and securely stores it in VS Code's secret storage
   */
  async promptForCredentials(): Promise<boolean> {
    try {
      // Get organization URL
      const orgUrl = await vscode.window.showInputBox({
        prompt: 'Enter your Azure DevOps organization URL',
        placeHolder: 'e.g., https://dev.azure.com/your-organization',
        ignoreFocusOut: true,
        validateInput: (value) => {
          if (!value) {
            return 'Organization URL is required';
          }
          if (!value.startsWith('https://dev.azure.com/') && !value.startsWith('https://')) {
            return 'Please enter a valid Azure DevOps URL';
          }
          return null;
        },
      });

      if (!orgUrl) {
        return false;
      }

      // Get project name
      const project = await vscode.window.showInputBox({
        prompt: 'Enter your Azure DevOps project name',
        placeHolder: 'e.g., MyProject',
        ignoreFocusOut: true,
        validateInput: (value) => {
          if (!value) {
            return 'Project name is required';
          }
          return null;
        },
      });

      if (!project) {
        return false;
      }

      // Get PAT
      const pat = await vscode.window.showInputBox({
        prompt: 'Enter your Azure DevOps Personal Access Token',
        placeHolder: 'Paste your PAT here',
        password: true,
        ignoreFocusOut: true,
        validateInput: (value) => {
          if (!value) {
            return 'Personal Access Token is required';
          }
          if (value.length < 20) {
            return 'PAT seems too short. Please enter a valid token';
          }
          return null;
        },
      });

      if (!pat) {
        return false;
      }

      // Store credentials securely
      await this.storeCredentials(orgUrl, project, pat);

      vscode.window.showInformationMessage('Successfully authenticated with Azure DevOps!');

      console.log('🚀🚀🚀 AZDO CRED 🚀🚀🚀');
      console.table({
        orgUrl: orgUrl,
        project: project,
        pat: pat,
      });

      return true;
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to store credentials: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return false;
    }
  }

  /**
   * Stores credentials securely in VS Code's secret storage
   */
  private async storeCredentials(orgUrl: string, project: string, pat: string): Promise<void> {
    await this.context.secrets.store(AuthService.SECRET_KEY, pat);
    await this.context.globalState.update(AuthService.ORG_KEY, orgUrl);
    await this.context.globalState.update(AuthService.PROJECT_KEY, project);
  }

  /**
   * Retrieves the stored PAT from secret storage
   */
  async getPersonalAccessToken(): Promise<string | undefined> {
    return await this.context.secrets.get(AuthService.SECRET_KEY);
  }

  /**
   * Retrieves the stored organization URL
   */
  getOrganizationUrl(): string | undefined {
    return this.context.globalState.get<string>(AuthService.ORG_KEY);
  }

  /**
   * Retrieves the stored project name
   */
  getProject(): string | undefined {
    return this.context.globalState.get<string>(AuthService.PROJECT_KEY);
  }

  /**
   * Checks if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const pat = await this.getPersonalAccessToken();
    const orgUrl = this.getOrganizationUrl();
    const project = this.getProject();
    return !!(pat && orgUrl && project);
  }

  /**
   * Signs out the user by removing stored credentials
   */
  async signOut(): Promise<void> {
    await this.context.secrets.delete(AuthService.SECRET_KEY);
    await this.context.globalState.update(AuthService.ORG_KEY, undefined);
    await this.context.globalState.update(AuthService.PROJECT_KEY, undefined);
    vscode.window.showInformationMessage('Successfully signed out from Azure DevOps');
  }

  /**
   * Gets the full configuration for making API requests
   */
  async getConfiguration(): Promise<
    | {
        pat: string;
        orgUrl: string;
        project: string;
      }
    | undefined
  > {
    const pat = await this.getPersonalAccessToken();
    const orgUrl = this.getOrganizationUrl();
    const project = this.getProject();

    if (!pat || !orgUrl || !project) {
      return undefined;
    }

    return { pat, orgUrl, project };
  }
}
