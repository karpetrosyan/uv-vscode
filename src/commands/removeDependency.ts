import type InputRequester from "../dependencies/inputRequester";
import type SubcommandExecutor from "../dependencies/subcommandExecutor";
import { isScriptPath } from "../utils/inlineMetadata";
import Command from "./base";

export default class RemoveDependencyCommand extends Command {
  activeFilePath?: string;
  uvBinaryPath: string;
  projectRoot: string;
  inputRequester: InputRequester;
  subcommandExeuctor: SubcommandExecutor;

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
    this.subcommandExeuctor = subcommandExecutor;
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

    await this.subcommandExeuctor.execute(String(this.uvBinaryPath), [
      "remove",
      "--directory",
      this.projectRoot,
      ...fileOption,
      ...input.split(" ").map((dep) => dep.trim()),
    ]);
    await this.subcommandExeuctor.execute(String(this.uvBinaryPath), [
      "sync",
      "--directory",
      this.projectRoot,
      "--inexact",
      ...fileOption,
    ]);
  }
}
