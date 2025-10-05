import type InputRequester from "../dependencies/inputRequester";
import type SubcommandExecutor from "../dependencies/subcommandExecutor";
import { isScriptPath } from "../utils/inlineMetadata";
import { isOptionPresent } from "../utils/subprocess";
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
    public activeFilePath?: string
  ) {
    super();
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
      fileOption =
        input !== undefined &&
        (isOptionPresent(input, "--script") || isOptionPresent(input, "-s"))
          ? []
          : ["--script", this.activeFilePath];
    }

    const addArgs = [
      "add",
      "--directory",
      this.projectRoot,
      ...fileOption,
      ...input.split(" ").map((dep) => dep.trim()),
    ];
    await this.subcommandExecutor.execute(this.uvBinaryPath, addArgs);

    const syncArgs = [
      "sync",
      "--directory",
      this.projectRoot,
      "--inexact",
      ...fileOption,
      ...(isScript ? [] : ["--all-extras"]),
    ];
    await this.subcommandExecutor.execute(this.uvBinaryPath, syncArgs);
  }
}
