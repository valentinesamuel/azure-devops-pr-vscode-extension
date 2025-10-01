import * as vscode from 'vscode';
import { AzureDevOpsApiClient, AzureDevOpsProfile } from './azureDevOpsApiClient';

export class UserProfileService {
  private static readonly PROFILE_KEY = 'azureDevOpsUserProfile';

  constructor(private context: vscode.ExtensionContext) {}

  /**
   * Fetches the user profile from Azure DevOps and stores it
   */
  async fetchAndStoreProfile(organization: string, pat: string): Promise<AzureDevOpsProfile> {
    try {
      const apiClient = new AzureDevOpsApiClient({ organization, pat });
      const profile = await apiClient.getCurrentUserProfile();

      // Store the profile
      await this.storeProfile(profile);

      console.log('📋 User Profile Fetched:', profile);

      return profile;
    } catch (error) {
      if (error instanceof Error) {
        vscode.window.showErrorMessage(`Failed to fetch user profile: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Stores the user profile in global state
   */
  private async storeProfile(profile: AzureDevOpsProfile): Promise<void> {
    await this.context.globalState.update(UserProfileService.PROFILE_KEY, profile);
  }

  /**
   * Retrieves the stored user profile
   */
  getStoredProfile(): AzureDevOpsProfile | undefined {
    return this.context.globalState.get<AzureDevOpsProfile>(UserProfileService.PROFILE_KEY);
  }

  /**
   * Clears the stored user profile
   */
  async clearProfile(): Promise<void> {
    await this.context.globalState.update(UserProfileService.PROFILE_KEY, undefined);
  }

  /**
   * Checks if a user profile is stored
   */
  hasProfile(): boolean {
    return !!this.getStoredProfile();
  }

  /**
   * Gets the current user's email address
   */
  getUserEmail(): string | undefined {
    const profile = this.getStoredProfile();
    return profile?.emailAddress;
  }

  /**
   * Gets the current user's display name
   */
  getUserDisplayName(): string | undefined {
    const profile = this.getStoredProfile();
    return profile?.displayName;
  }

  /**
   * Gets the current user's public alias
   */
  getUserPublicAlias(): string | undefined {
    const profile = this.getStoredProfile();
    return profile?.publicAlias;
  }
}
