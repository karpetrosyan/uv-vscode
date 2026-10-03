import * as fs from "fs-extra";
import path from "path";
import {
  Range,
  Uri,
  window,
  workspace,
  WorkspaceEdit,
  type TextDocument,
  type WorkspaceFolder,
} from "vscode";
import { getTextReplacement } from "./textReplacement";

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

const toLf = (text: string) => text.replace(/\r\n/g, "\n");

/**
 * Untitled documents have no file on disk, so uv works on a copy of them.
 * `applyChanges` brings the changes that uv made to the copy back to the document.
 */
export async function copyUntitledDocument(
  directory: string,
  document: TextDocument,
): Promise<{ filePath: string; applyChanges: () => Promise<void> }> {
  const filePath = path.join(directory, path.basename(document.uri.fsPath));
  const text = toLf(document.getText());
  await fs.outputFile(filePath, text);

  const applyChanges = async () => {
    const replacement = getTextReplacement(
      text,
      toLf(await fs.readFile(filePath, "utf8")),
    );
    if (!replacement) {
      return;
    }
    if (toLf(document.getText()) !== text) {
      window.showWarningMessage(
        "The file was edited while uv was running, so the changes made by uv were not applied to it.",
      );
      return;
    }

    const edit = new WorkspaceEdit();
    edit.replace(
      document.uri,
      new Range(
        replacement.start.line,
        replacement.start.character,
        replacement.end.line,
        replacement.end.character,
      ),
      replacement.text,
    );
    await workspace.applyEdit(edit);
  };

  return { filePath, applyChanges };
}
