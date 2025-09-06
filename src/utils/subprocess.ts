import { execFile } from "child_process";
import { platform } from "os";

export function execFileShellModeRequired(file: string) {
  file = file.toLowerCase();
  return (
    platform() === "win32" && (file.endsWith(".cmd") || file.endsWith(".bat"))
  );
}

export function executeFile(
  file: string,
  args: string[] = [],
): Promise<string> {
  const shell = execFileShellModeRequired(file);
  return new Promise((resolve, reject) => {
    execFile(
      shell ? `"${file}"` : file,
      args,
      { shell },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
        } else {
          resolve(stdout);
        }
      },
    );
  });
}
