import * as vscode from 'vscode';

export class AuthService {
  private static readonly SECRET_KEY = 'azureDevOpsPat';

  constructor(private context: vscode.ExtensionContext) {}

  /**
   * Prompts user to enter their Azure DevOps Personal Access Token
   * and securely stores it in VS Code's secret storage.
   * Organization and project information will be automatically detected from git remotes.
   */
  async promptForCredentials(): Promise<boolean> {
    try {
      // Get PAT
      const pat = await vscode.window.showInputBox({
        prompt: 'Enter your Azure DevOps Personal Access Token',
        placeHolder: 'Paste your PAT here (with Code: Read permissions)',
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

      // Store PAT securely
      await this.context.secrets.store(AuthService.SECRET_KEY, pat);

      vscode.window.showInformationMessage(
        'Successfully authenticated with Azure DevOps! Organization and project information will be detected from your git remotes.',
      );

      console.log('🚀🚀🚀 AZDO PAT stored successfully 🚀🚀🚀');

      return true;
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to store credentials: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return false;
    }
  }

  /**
   * Retrieves the stored PAT from secret storage
   */
  async getPersonalAccessToken(): Promise<string | undefined> {
    return await this.context.secrets.get(AuthService.SECRET_KEY);
  }

  /**
   * Checks if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const pat = await this.getPersonalAccessToken();
    return !!pat;
  }

  /**
   * Signs out the user by removing stored credentials
   */
  async signOut(): Promise<void> {
    await this.context.secrets.delete(AuthService.SECRET_KEY);
    vscode.window.showInformationMessage('Successfully signed out from Azure DevOps');
  }
}
