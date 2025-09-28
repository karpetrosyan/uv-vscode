import type InputRequester from "../dependencies/inputRequester";
import type Logger from "../dependencies/logger";
import type SubcommandExecutor from "../dependencies/subcommandExecutor";
import type { UvVscodeSettings } from "../settings";
import { isScriptPath } from "../utils/inlineMetadata";
import Command from "./base";

/**
 * Adds a dependency to the project, optionally specifying a script file.
 */
export default class AddDependencyCommand extends Command {
  constructor(
    public inputRequester: InputRequester,
    public subcommandExecutor: SubcommandExecutor,
    public projectRoot: string,
    public uvBinaryPath: string,
    public logger: Logger,
    public config: UvVscodeSettings,
    public activeFilePath?: string,
  ) {
    super();
  }

  public async run(): Promise<void> {
    const input = await this.inputRequester.askForInput();

    if (!input) {
      throw new Error("No input provided for the dependency.");
    }

    let fileOption: string[] = [];

    this.logger.debug(
      `Checking if the active file ${this.activeFilePath} is a script`,
    );
    const isScript = this.activeFilePath
      ? await isScriptPath(this.activeFilePath)
      : false;
    const noConfigOptions =
      isScript && this.config.noConfigForScripts ? ["--no-config"] : [];

    if (this.activeFilePath && isScript) {
      this.logger.debug(`Active file ${this.activeFilePath} is a script`);
      fileOption = ["--script", this.activeFilePath];
    }

    const addArgs = [
      "add",
      "--directory",
      this.projectRoot,
      ...noConfigOptions,
      ...fileOption,
      ...input.split(" ").map((dep) => dep.trim()),
    ];
    this.logger.debug(
      `Adding dependency with command: ${this.uvBinaryPath} ${addArgs.join(" ")}`,
    );
    await this.subcommandExecutor.execute(this.uvBinaryPath, addArgs);

    const syncArgs = [
      "sync",
      "--directory",
      this.projectRoot,
      "--inexact",
      ...noConfigOptions,
      ...fileOption,
      ...(isScript ? [] : ["--all-extras"]),
    ];
    this.logger.debug(
      `Syncing dependencies with command: ${this.uvBinaryPath} ${syncArgs.join(" ")}`,
    );
    await this.subcommandExecutor.execute(this.uvBinaryPath, syncArgs);
  }
}
