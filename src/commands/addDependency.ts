import type InputRequester from "../dependencies/inputRequester";
import type Logger from "../dependencies/logger";
import type SubcommandExecutor from "../dependencies/subcommandExecutor";
import { isScriptPath } from "../utils/inlineMetadata";
import Command from "./base";

/**
 * Adds a dependency to the project, optionally specifying a script file.
 */
export default class AddDependencyCommand extends Command {
  activeFilePath?: string;
  uvBinaryPath: string;
  projectRoot: string;
  inputRequester: InputRequester;
  subcommandExecutor: SubcommandExecutor;
  optional?: string;
  logger: Logger;

  constructor({
    inputRequester,
    subcommandExecutor,
    projectRoot,
    uvBinaryPath,
    activeFilePath,
    logger,
  }: {
    inputRequester: InputRequester;
    subcommandExecutor: SubcommandExecutor;
    projectRoot: string;
    uvBinaryPath: string;
    activeFilePath?: string;
    logger: Logger;
  }) {
    super();
    this.activeFilePath = activeFilePath;
    this.uvBinaryPath = uvBinaryPath;
    this.projectRoot = projectRoot;
    this.inputRequester = inputRequester;
    this.subcommandExecutor = subcommandExecutor;
    this.logger = logger;
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

    if (this.activeFilePath && isScript) {
      this.logger.debug(`Active file ${this.activeFilePath} is a script`);
      fileOption = ["--script", this.activeFilePath];
    }

    const addArgs = [
      "add",
      "--directory",
      this.projectRoot,
      ...fileOption,
      ...input.split(" ").map((dep) => dep.trim()),
    ];
    this.logger.debug(
      `Adding dependency with command: ${this.uvBinaryPath} ${addArgs.join(" ")}`,
    );
    await this.subcommandExecutor.execute(this.uvBinaryPath, addArgs, isScript);

    const syncArgs = [
      "sync",
      "--directory",
      this.projectRoot,
      "--inexact",
      ...fileOption,
      ...(isScript ? [] : ["--all-extras", "--all-groups"]),
    ];
    this.logger.debug(
      `Syncing dependencies with command: ${this.uvBinaryPath} ${syncArgs.join(" ")}`,
    );
    await this.subcommandExecutor.execute(
      this.uvBinaryPath,
      syncArgs,
      isScript,
    );
  }
}
