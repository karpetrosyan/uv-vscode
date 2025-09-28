import vscode from "vscode";

export type UvVscodeSettings = {
  autoSelectInterpreterForScripts: boolean;
  noConfigForScripts: boolean;
};

export function getUvVscodeSettings(): UvVscodeSettings {
  const config = vscode.workspace.getConfiguration("uv");
  return {
    autoSelectInterpreterForScripts: config.get<boolean>(
      "autoSelectInterpreterForScripts"!,
    )!,
    noConfigForScripts: config.get<boolean>("noConfigForScripts")!,
  };
}
