# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VS Code extension called "Azure DevOps PR" that provides Azure DevOps integration for managing pull requests and pipeline runs. The extension is built with TypeScript and creates an activity bar view with two main panels: Pull Requests and Pipeline Runs.

## Development Commands

### Building and Compilation
- `npm run compile` - Compile TypeScript to JavaScript (outputs to `out/` directory)
- `npm run watch` - Compile in watch mode for development
- `npm run vscode:prepublish` - Production build (runs compile)

### Code Quality
- `npm run lint` - Format code with Prettier (writes changes to files)
- `npm run pretest` - Runs compile and lint before testing
- ESLint configuration uses TypeScript parser with naming conventions and basic rules

### Testing
- `npm test` - Run VS Code extension tests using `vscode-test`
- Tests are located in `src/test/` directory
- Use F5 in VS Code to launch extension development host

## Architecture

### Extension Structure
- **Main entry**: `src/extension.ts` - Contains `activate()` and `deactivate()` functions
- **Command registration**: Extension registers `azureDevOpsPr.helloWorld` command
- **Views**: Defines activity bar container with Pull Requests and Pipeline Runs views
- **Webview integration**: Creates webview panels for displaying PR information

### Key Components
- Activity bar integration with custom icon (`src/resources/azureDevOpsPr.svg`)
- Welcome views that prompt user login to Azure DevOps
- Webview panels for displaying PR details with bidirectional communication
- Command system for triggering extension functionality

### VS Code Integration
- Extension activates on demand (no specific activation events defined)
- Contributes views to activity bar under "azureDevOpsPr" container
- Uses VS Code's webview API for rich UI components
- Implements message passing between webview and extension

## Git Hooks and Code Quality

The project uses Husky for git hooks:
- `pre-commit`: Runs lint-staged (ESLint + Prettier on staged TypeScript/JavaScript files)
- `pre-push`: Additional validation before pushing
- `commit-msg`: Validates commit messages using conventional commits

## Development Workflow

1. Use `npm run watch` during development for automatic compilation
2. Press F5 in VS Code to test extension in development host
3. Code formatting is handled automatically by lint-staged on commit
4. All code must pass ESLint rules and Prettier formatting