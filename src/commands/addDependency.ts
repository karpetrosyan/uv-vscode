import type InputRequester from "../dependencies/inputRequester";
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

  constructor({
    inputRequester,
    subcommandExecutor,
    projectRoot,
    uvBinaryPath,
    activeFilePath,
  }: {
    inputRequester: InputRequester;
    subcommandExecutor: SubcommandExecutor;
    projectRoot: string;
    uvBinaryPath: string;
    activeFilePath?: string;
  }) {
    super();
    this.activeFilePath = activeFilePath;
    this.uvBinaryPath = uvBinaryPath;
    this.projectRoot = projectRoot;
    this.inputRequester = inputRequester;
    this.subcommandExecutor = subcommandExecutor;
  }

  public async run(): Promise<void> {
    const input = await this.inputRequester.askForInput();

    if (!input) {
      throw new Error("No input provided for the dependency.");
    }

    let fileOption: string[] = [];

    const isScript = this.activeFilePath
      ? await isScriptPath(this.activeFilePath)
      : false;

    if (this.activeFilePath && isScript) {
      fileOption = ["--script", this.activeFilePath];
    }

    await this.subcommandExecutor.execute(String(this.uvBinaryPath), [
      "add",
      "--directory",
      this.projectRoot,
      ...fileOption,
      ...input.split(" ").map((dep) => dep.trim()),
    ]);

    await this.subcommandExecutor.execute(String(this.uvBinaryPath), [
      "sync",
      "--directory",
      this.projectRoot,
      "--inexact",
      ...fileOption,
      ...(isScript ? [] : ["--all-extras", "--all-groups"]),
    ]);
  }
}
