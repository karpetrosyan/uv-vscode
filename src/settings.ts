import vscode from "vscode";

export type UvVscodeSettings = {
  autoSelectInterpreterForScripts: boolean;
  sendUvCommandToTerminal: boolean;
};

export function getUvVscodeSettings(): UvVscodeSettings {
  const config = vscode.workspace.getConfiguration("uv");
  return {
    autoSelectInterpreterForScripts: config.get<boolean>(
      "autoSelectInterpreterForScripts"!,
    )!,
    sendUvCommandToTerminal: config.get<boolean>("sendUvCommandToTerminal")!,
  };
}
