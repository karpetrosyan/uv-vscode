import vscode from "vscode";

export type UvVscodeSettings = {
  noConfigForScripts: boolean;
};

export function getUvVscodeSettings(): UvVscodeSettings {
  const config = vscode.workspace.getConfiguration("uv");
  return {
    noConfigForScripts: config.get<boolean>("noConfigForScripts")!,
  };
}
