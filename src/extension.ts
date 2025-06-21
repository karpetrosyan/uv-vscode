// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ConfigurationScope, workspace, WorkspaceFolder, Uri,  } from 'vscode';
import { findUvBinaryPath } from './uv_binary';
import path from 'path';
import * as fs from 'fs-extra';
import { UvVscodeSettings } from './settings';

async function getProjectRoot(): Promise<WorkspaceFolder> {
  const workspaces: readonly WorkspaceFolder[] = workspace.workspaceFolders ?? [];
  if (workspaces.length === 0) {
    return {
      uri: Uri.file(process.cwd()),
      name: path.basename(process.cwd()),
      index: 0,
    };
  } else if (workspaces.length === 1) {
    return workspaces[0];
  } else {
    let rootWorkspace = workspaces[0];
    let root = undefined;
    for (const w of workspaces) {
      if (await fs.pathExists(w.uri.fsPath)) {
        root = w.uri.fsPath;
        rootWorkspace = w;
        break;
      }
    }

    for (const w of workspaces) {
      if (root && root.length > w.uri.fsPath.length && (await fs.pathExists(w.uri.fsPath))) {
        root = w.uri.fsPath;
        rootWorkspace = w;
      }
    }
    return rootWorkspace;
  }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "uv-vscode" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('uv-vscode.helloWorld', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
			let projectRoot = await getProjectRoot();
			let config: UvVscodeSettings = workspace.getConfiguration('uv-vscode', projectRoot) as UvVscodeSettings;

			let uvBinaryPath = await findUvBinaryPath({ settings: config });

			vscode.window.showInformationMessage(`Uv path: ${uvBinaryPath}`);

	});
	
	let projectRoot = await getProjectRoot();
	let config = workspace.getConfiguration('uv-vscode', projectRoot);

	vscode.window.showInformationMessage(`Project root: ${projectRoot.uri.fsPath}`);
	vscode.window.showInformationMessage(`Project configuration: ${JSON.stringify(config)}`);

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
