import vscode from "vscode";

export type UvVscodeSettings = {
  autoSelectInterpreterForScripts: boolean;
};

export function getUvVscodeSettings(): UvVscodeSettings {
  const config = vscode.workspace.getConfiguration("uv");
  return {
    autoSelectInterpreterForScripts: config.get<boolean>(
      "autoSelectInterpreterForScripts"!,
    )!,
  };
}
