import Command from "./base";
import type InterpreterManager from "../dependencies/interpreterManager";
import type SubcommandExecutor from "../dependencies/subcommandExecutor";
import { isScriptPath } from "../utils/inlineMetadata";

export default class SelectScriptInterpreterCommand extends Command<boolean> {
  constructor(
    public activeFilePath: string,
    public uvBinaryPath: string,
    public projectRoot: string,
    public interpreterManager: InterpreterManager,
    public subcommandExecutor: SubcommandExecutor,
  ) {
    super();
  }

  public async run(): Promise<boolean> {
    const isScript = this.activeFilePath
      ? await isScriptPath(this.activeFilePath)
      : false;
    if (!isScript) {
      return false;
    }

    const syncArgs = [
      "sync",
      "--directory",
      this.projectRoot,
      "--inexact",
      "--script",
      String(this.activeFilePath),
    ];
    await this.subcommandExecutor.execute(this.uvBinaryPath, syncArgs);

    const findArgs = [
      "python",
      "find",
      "--script",
      String(this.activeFilePath),
    ];
    const inlineScriptInterpreterPath = (
      await this.subcommandExecutor.execute(this.uvBinaryPath, findArgs)
    ).trim();

    await this.interpreterManager.select(inlineScriptInterpreterPath);
    return true;
  }
}
