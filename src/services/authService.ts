import * as vscode from 'vscode';
import { UserProfileService } from './userProfileService';
import { GitService } from './gitService';

export class AuthService {
  private static readonly SECRET_KEY = 'azureDevOpsPat';
  private userProfileService: UserProfileService;
  private gitService: GitService;

  constructor(private context: vscode.ExtensionContext) {
    this.userProfileService = new UserProfileService(context);
    this.gitService = new GitService();
  }

  /**
   * Prompts user to enter their Azure DevOps Personal Access Token
   * and securely stores it in VS Code's secret storage.
   * Organization and project information will be automatically detected from git remotes.
   * Fetches and stores user profile after successful authentication.
   */
  async promptForCredentials(): Promise<boolean> {
    try {
      // Get PAT
      const pat = await vscode.window.showInputBox({
        prompt: 'Enter your Azure DevOps Personal Access Token',
        placeHolder: 'Paste your PAT here (with Code: Read and User Profile: Read permissions)',
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

      // Detect organization from git remotes
      const repositories = await this.gitService.detectAzureDevOpsRepositories();

      if (repositories.length === 0) {
        vscode.window.showWarningMessage(
          'No Azure DevOps repositories detected in workspace. Profile will be fetched when you open a repository.',
        );
        return true;
      }

      // Use the first repository's organization to fetch profile
      const organization = repositories[0].organization;

      // Fetch and store user profile
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Fetching Azure DevOps user profile...',
          cancellable: false,
        },
        async (progress) => {
          try {
            const profile = await this.userProfileService.fetchAndStoreProfile(organization, pat);
            vscode.window.showInformationMessage(
              `Successfully authenticated as ${profile.displayName}! Organization and project information detected from git remotes.`,
            );
            console.log('🚀🚀🚀 AZDO Authentication successful 🚀🚀🚀');
            console.log('=========================');
            console.table(profile);
          } catch (error) {
            vscode.window.showWarningMessage(
              `Authentication successful but failed to fetch profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
          }
        },
      );

      return true;
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to authenticate: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
   * Signs out the user by removing stored credentials and profile
   */
  async signOut(): Promise<void> {
    await this.context.secrets.delete(AuthService.SECRET_KEY);
    await this.userProfileService.clearProfile();
    vscode.window.showInformationMessage('Successfully signed out from Azure DevOps');
  }

  /**
   * Gets the user profile service
   */
  getUserProfileService(): UserProfileService {
    return this.userProfileService;
  }
}
