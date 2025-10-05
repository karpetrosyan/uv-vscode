import type InputRequester from "../dependencies/inputRequester";
import type Logger from "../dependencies/logger";
import type SubcommandExecutor from "../dependencies/subcommandExecutor";
import type { UvVscodeSettings } from "../settings";
import { isScriptPath } from "../utils/inlineMetadata";
import { isOptionPresent } from "../utils/subprocess";
import Command from "./base";

export default class RemoveDependencyCommand extends Command {
  constructor(
    public inputRequester: InputRequester,
    public subcommandExecutor: SubcommandExecutor,
    public projectRoot: string,
    public uvBinaryPath: string,
    public logger: Logger,
    public config: UvVscodeSettings,
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

    const removeArgs = [
      "remove",
      ...(input !== undefined && isOptionPresent(input, "--directory")
        ? []
        : ["--directory", this.projectRoot]),
      ...fileOption,
      ...input.split(" ").map((dep) => dep.trim()),
    ];
    await this.subcommandExecutor.execute(
      String(this.uvBinaryPath),
      removeArgs
    );

    const syncArgs = [
      "sync",
      "--directory",
      this.projectRoot,
      "--inexact",
      ...fileOption,
    ];
    await this.subcommandExecutor.execute(String(this.uvBinaryPath), syncArgs);
  }
}
