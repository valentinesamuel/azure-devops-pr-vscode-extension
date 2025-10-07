import * as vscode from 'vscode';

/**
 * Content provider for virtual documents used in diff views
 */
export class DiffContentProvider implements vscode.TextDocumentContentProvider {
  provideTextDocumentContent(uri: vscode.Uri): string {
    try {
      const query = JSON.parse(uri.query);
      return query.content || '';
    } catch (error) {
      console.error('Error parsing diff content:', error);
      return '';
    }
  }
}
