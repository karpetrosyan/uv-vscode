import Command from "./base";
import type InterpreterManager from "../dependencies/interpreterManager";
import type SubcommandExecutor from "../dependencies/subcommandExecutor";
import { isScriptPath } from "../utils/inlineMetadata";

export default class SelectScriptInterpreterCommand extends Command {
  activeFilePath: string;
  uvBinaryPath: string;
  projectRoot: string;
  interpreterManager: InterpreterManager;
  subcommandExecutor: SubcommandExecutor;

  constructor({
    activeFilePath,
    uvBinaryPath,
    projectRoot,
    interpreterManager,
    subcommandExecutor,
  }: {
    activeFilePath: string;
    uvBinaryPath: string;
    projectRoot: string;
    interpreterManager: InterpreterManager;
    subcommandExecutor: SubcommandExecutor;
  }) {
    super();
    this.activeFilePath = activeFilePath;
    this.uvBinaryPath = uvBinaryPath;
    this.projectRoot = projectRoot;
    this.interpreterManager = interpreterManager;
    this.subcommandExecutor = subcommandExecutor;
  }

  public async run(): Promise<void> {
    const isScript = this.activeFilePath
      ? await isScriptPath(this.activeFilePath)
      : false;

    if (!isScript) {
      throw new Error("The script has not a valid inline metadata.");
    }

    await this.subcommandExecutor.execute(String(this.uvBinaryPath), [
      "sync",
      "--directory",
      this.projectRoot,
      "--inexact",
      "--script",
      String(this.activeFilePath),
    ]);

    const inlineScriptInterpreterPath = await this.subcommandExecutor.execute(
      this.uvBinaryPath,
      ["python", "find", "--script", String(this.activeFilePath)],
    );

    await this.interpreterManager.select(inlineScriptInterpreterPath);
  }
}
