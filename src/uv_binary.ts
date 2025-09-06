import * as vscode from "vscode";
import { BUNDLED_UV_EXECUTABLE } from "./constants";
import * as fsapi from "fs-extra";
import { platform } from "os";
import { type UvVscodeSettings } from "./settings";

export function execFileShellModeRequired(file: string) {
  file = file.toLowerCase();
  return (
    platform() === "win32" && (file.endsWith(".cmd") || file.endsWith(".bat"))
  );
}

export async function findUvBinaryPath({
  settings,
}: {
  settings: UvVscodeSettings;
}) {
  if (!vscode.workspace.isTrusted) {
    return BUNDLED_UV_EXECUTABLE;
  }

  if (Array.isArray(settings.path) && settings.path.length > 0) {
    for (const path of settings.path) {
      if (await fsapi.pathExists(path)) {
        return path;
      }
    }
  }

  return BUNDLED_UV_EXECUTABLE;
}
