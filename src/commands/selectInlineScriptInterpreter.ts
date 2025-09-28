import Command from "./base";
import type InterpreterManager from "../dependencies/interpreterManager";
import type SubcommandExecutor from "../dependencies/subcommandExecutor";
import { isScriptPath } from "../utils/inlineMetadata";
import type Logger from "../dependencies/logger";
import type { UvVscodeSettings } from "../settings";

export default class SelectScriptInterpreterCommand extends Command<boolean> {
  constructor(
    public activeFilePath: string,
    public uvBinaryPath: string,
    public projectRoot: string,
    public interpreterManager: InterpreterManager,
    public subcommandExecutor: SubcommandExecutor,
    public logger: Logger,
    public config: UvVscodeSettings,
  ) {
    super();
  }

  public async run(): Promise<boolean> {
    const isScript = this.activeFilePath
      ? await isScriptPath(this.activeFilePath)
      : false;
    const noConfigOptions =
      isScript && this.config.noConfigForScripts ? ["--no-config"] : [];

    if (!isScript) {
      return false;
    }

    const syncArgs = [
      "sync",
      "--directory",
      this.projectRoot,
      "--inexact",
      ...noConfigOptions,
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
      ...noConfigOptions,
      "--script",
      String(this.activeFilePath),
    ];
    this.logger.debug(
      `Finding script interpreter with command: ${this.uvBinaryPath} ${findArgs.join(" ")}`,
    );
    let inlineScriptInterpreterPath = (
      await this.subcommandExecutor.execute(this.uvBinaryPath, findArgs)
    ).trim();

    if (process.platform === "win32") {
      // On Windows, the returned path might include a newline character at the end.
      // We need to trim it to get the correct path.
      inlineScriptInterpreterPath = inlineScriptInterpreterPath.trim();
    }

    this.logger.debug(`Selecting interpreter: ${inlineScriptInterpreterPath}`);
    await this.interpreterManager.select(inlineScriptInterpreterPath);
    return true;
  }
}
