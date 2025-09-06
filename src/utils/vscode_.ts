import * as fs from "fs-extra";
import path from "path";
import { Uri, window, workspace, type WorkspaceFolder } from "vscode";

export function getActiveTextEditorFilePath(): string | undefined {
  const editor = window.activeTextEditor;
  if (!editor) {
    window.showErrorMessage("No active editor");
    return;
  }
  return editor.document.uri.fsPath;
}
export async function getProjectRoot(): Promise<WorkspaceFolder> {
  const workspaces: readonly WorkspaceFolder[] =
    workspace.workspaceFolders ?? [];
  if (workspaces.length === 0) {
    return {
      uri: Uri.file(process.cwd()),
      name: path.basename(process.cwd()),
      index: 0,
    };
  } else if (workspaces.length === 1) {
    // @ts-expect-error TS2322
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
      if (
        root &&
        root.length > w.uri.fsPath.length &&
        (await fs.pathExists(w.uri.fsPath))
      ) {
        root = w.uri.fsPath;
        rootWorkspace = w;
      }
    }
    // @ts-expect-error TS2322
    return rootWorkspace;
  }
}
