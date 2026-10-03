import type InputRequester from "../dependencies/inputRequester";
import type Logger from "../dependencies/logger";
import type SubcommandExecutor from "../dependencies/subcommandExecutor";
import type TerminalSender from "../dependencies/terminalSender";
import type { UvCommand } from "../dependencies/uvCli";
import type UvCli from "../dependencies/uvCli";
import type { UvVscodeSettings } from "../settings";
import { isScriptPath } from "../utils/inlineMetadata";
import { isOptionPresent } from "../utils/subprocess";

type SupportsScriptOption = Extract<UvCommand, "add" | "remove" | "sync">;
function supportsScriptOption(
  command: UvCommand,
): command is SupportsScriptOption {
  return command === "add" || command === "remove" || command === "sync";
}

function isUvOptionPresent(
  input: string,
  option: "script" | "directory" | "python",
): boolean {
  switch (option) {
    case "script":
      return isOptionPresent(input, "--script") || isOptionPresent(input, "-s");
    case "directory":
      return isOptionPresent(input, "--directory");
    case "python":
      return isOptionPresent(input, "--python") || isOptionPresent(input, "-p");
    default:
      return false;
  }
}

export default class UvCliImpl<T extends UvCommand> implements UvCli<T> {
  constructor(
    public command: T,
    public inputRequester: InputRequester,
    public subcommandExecutor: SubcommandExecutor,
    public projectRoot: string,
    public uvBinaryPath: string,
    public logger: Logger,
    public config: UvVscodeSettings,
    public terminalSender: TerminalSender,
    public activeFilePath?: string,
    public extraArgs: string[] = [],
  ) {}

  async run(): Promise<void> {
    const input = await this.inputRequester.askForInput();

    // The input request was cancelled
    if (input === undefined) {
      return;
    }

    const isScript =
      this.activeFilePath !== undefined
        ? await isScriptPath(this.activeFilePath)
        : false;

    let scriptOption: string[] = [];

    if (this.activeFilePath && isScript) {
      scriptOption = isUvOptionPresent(input, "script")
        ? []
        : ["--script", this.activeFilePath];
    }

    const directoryOption: string[] = isUvOptionPresent(input, "directory")
      ? []
      : ["--directory", this.projectRoot];

    const splitedInput = input.split(/\s+/).filter((arg) => arg !== "");

    const args = [
      this.command,
      ...(supportsScriptOption(this.command) ? scriptOption : []),
      ...directoryOption,
      ...this.extraArgs,
      ...splitedInput,
    ];

    const commandsToExecute: [string, string[]][] = [];

    switch (this.command) {
      case "add":
      case "remove":
      case "sync":
      case "lock":
      case "venv":
      case "init": {
        commandsToExecute.push([this.uvBinaryPath, args]);
        break;
      }
    }

    if ((this.command === "add" || this.command === "remove") && isScript) {
      const syncArgs = [
        "sync",
        "--inexact",
        ...scriptOption,
        ...directoryOption,
        ...(isScript ? [] : ["--all-extras"]),
      ];
      commandsToExecute.push([this.uvBinaryPath, syncArgs]);
    }

    if (this.config.sendUvCommandToTerminal) {
      const commandsString = commandsToExecute
        .map(([cmd, cmdArgs]) => [cmd, ...cmdArgs].join(" "))
        .join("\n");
      this.terminalSender.sendText(commandsString, true);
    } else {
      for (const [cmd, cmdArgs] of commandsToExecute) {
        await this.subcommandExecutor.execute(cmd, cmdArgs);
      }
    }
  }
}
