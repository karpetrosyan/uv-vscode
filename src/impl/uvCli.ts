import type InputRequester from "../dependencies/inputRequester";
import type Logger from "../dependencies/logger";
import type SubcommandExecutor from "../dependencies/subcommandExecutor";
import type { UvCommand } from "../dependencies/uvCli";
import type UvCli from "../dependencies/uvCli";
import type { UvVscodeSettings } from "../settings";
import { isScriptPath } from "../utils/inlineMetadata";
import { isOptionPresent } from "../utils/subprocess";

type ThrowOnMissingInputCommands = Extract<UvCommand, "add" | "remove">;
function isThrowOnMissingInputCommand(
  command: UvCommand,
): command is ThrowOnMissingInputCommands {
  return command === "add" || command === "remove";
}

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

function getCommandDefaults(command: UvCommand, input: string): string[] {
  switch (command) {
    case "init":
      return [...(isUvOptionPresent(input, "python") ? [] : ["--python=3.12"])];
    case "add":
    case "remove":
    case "sync":
      return [];
    default:
      return [];
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
    public activeFilePath?: string,
  ) {}

  async run(): Promise<void> {
    const input = await this.inputRequester.askForInput();

    const isScript =
      this.activeFilePath !== undefined
        ? await isScriptPath(this.activeFilePath)
        : false;

    let scriptOption: string[] = [];

    if (this.activeFilePath && isScript) {
      scriptOption =
        input !== undefined && isUvOptionPresent(input, "script")
          ? []
          : ["--script", this.activeFilePath];
    }

    const directoryOption: string[] =
      input !== undefined && isUvOptionPresent(input, "directory")
        ? []
        : ["--directory", this.projectRoot];

    if (isThrowOnMissingInputCommand(this.command) && input === undefined) {
      throw new Error("No input provided for the dependency.");
    }

    const splitedInput = input?.split(" ").map((dep) => dep.trim()) ?? [];

    const args = [
      this.command,
      ...(supportsScriptOption(this.command) ? scriptOption : []),
      ...directoryOption,
      ...getCommandDefaults(this.command, input ?? ""),
      ...(input === "" ? [] : splitedInput),
    ];

    switch (this.command) {
      case "add":
      case "remove":
      case "sync":
      case "lock":
      case "venv":
      case "init": {
        await this.subcommandExecutor.execute(this.uvBinaryPath, args);
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
      await this.subcommandExecutor.execute(this.uvBinaryPath, syncArgs);
    }
  }
}
