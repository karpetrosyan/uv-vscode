import Command from "./base";
import type InterpreterManager from "../dependencies/interpreterManager";
import type SubcommandExecutor from "../dependencies/subcommandExecutor";
import { isScriptPath } from "../utils/inlineMetadata";
import type Logger from "../dependencies/logger";

export default class SelectScriptInterpreterCommand extends Command {
  activeFilePath: string;
  uvBinaryPath: string;
  projectRoot: string;
  interpreterManager: InterpreterManager;
  subcommandExecutor: SubcommandExecutor;
  logger: Logger;

  constructor({
    activeFilePath,
    uvBinaryPath,
    projectRoot,
    interpreterManager,
    subcommandExecutor,
    logger,
  }: {
    activeFilePath: string;
    uvBinaryPath: string;
    projectRoot: string;
    interpreterManager: InterpreterManager;
    subcommandExecutor: SubcommandExecutor;
    logger: Logger;
  }) {
    super();
    this.activeFilePath = activeFilePath;
    this.uvBinaryPath = uvBinaryPath;
    this.projectRoot = projectRoot;
    this.interpreterManager = interpreterManager;
    this.subcommandExecutor = subcommandExecutor;
    this.logger = logger;
  }

  public async run(): Promise<void> {
    const isScript = this.activeFilePath
      ? await isScriptPath(this.activeFilePath)
      : false;

    if (!isScript) {
      throw new Error("The script has not a valid inline metadata.");
    }

    const syncArgs = [
      "sync",
      "--directory",
      this.projectRoot,
      "--inexact",
      "--script",
      String(this.activeFilePath),
    ];

    this.logger.debug(
      `Syncing dependencies with command: ${this.uvBinaryPath} ${syncArgs.join(" ")}`,
    );
    await this.subcommandExecutor.execute(this.uvBinaryPath, syncArgs);

    const findArgs = [
      "python",
      "find",
      "--script",
      String(this.activeFilePath),
    ];
    this.logger.debug(
      `Finding script interpreter with command: ${this.uvBinaryPath} ${findArgs.join(" ")}`,
    );
    const inlineScriptInterpreterPath = await this.subcommandExecutor.execute(
      this.uvBinaryPath,
      findArgs,
    );

    this.logger.debug(`Selecting interpreter: ${inlineScriptInterpreterPath}`);
    await this.interpreterManager.select(inlineScriptInterpreterPath);
  }
}
