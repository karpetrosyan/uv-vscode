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

/**
 * Extracts the value of a specific option from input string
 * Returns the value if found, undefined if not present
 * Handles: --option=value, --option value, --option="value", --option 'value'
 */
export function getOptionValue(
  input: string,
  option: string,
): string | undefined {
  const patterns = [
    // --script="value with spaces"
    { regex: new RegExp(`${option}="([^"]*)"`, "g"), captureGroup: 1 },
    // --script='value with spaces'
    { regex: new RegExp(`${option}='([^']*)'`, "g"), captureGroup: 1 },
    // --script=value
    { regex: new RegExp(`${option}=(\\S+)`, "g"), captureGroup: 1 },
    // --script "value with spaces"
    { regex: new RegExp(`${option}\\s+"([^"]*)"`, "g"), captureGroup: 1 },
    // --script 'value with spaces'
    { regex: new RegExp(`${option}\\s+'([^']*)'`, "g"), captureGroup: 1 },
    // --script value
    { regex: new RegExp(`${option}\\s+(?!-)(\\S+)`, "g"), captureGroup: 1 },
  ];

  for (const { regex, captureGroup } of patterns) {
    const match = regex.exec(input);
    if (match) {
      return match[captureGroup];
    }
  }

  return undefined;
}

/**
 * Checks if a specific option is present in the input string
 * Returns true if found, false otherwise
 */
export function isOptionPresent(input: string, option: string): boolean {
  // Match the option with or without a value
  const patterns = [
    // --script=value or --script="value" or --script='value'
    new RegExp(`${option}=[\\S"']`, "g"),
    // --script followed by space and value/quote, or end of string, or another option
    new RegExp(`${option}(?:\\s|$)`, "g"),
  ];

  return patterns.some((pattern) => pattern.test(input));
}
