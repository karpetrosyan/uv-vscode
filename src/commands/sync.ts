import type InputRequester from "../dependencies/inputRequester";
import type SubcommandExecutor from "../dependencies/subcommandExecutor";
import { isOptionPresent } from "../utils/subprocess";
import Command from "./base";

export default class SyncCommand extends Command {
  constructor(
    public inputRequester: InputRequester,
    public subcommandExecutor: SubcommandExecutor,
    public uvBinaryPath: string,
    public projectRoot: string
  ) {
    super();
  }

  public async run(): Promise<void> {
    const input = await this.inputRequester.askForInput();
    const args = [
      "sync",
      ...(input !== undefined && isOptionPresent(input, "--directory")
        ? []
        : ["--directory", this.projectRoot]),
      ...(input ? input.split(" ").map((dep) => dep.trim()) : []),
    ];
    await this.subcommandExecutor.execute(this.uvBinaryPath, args);
  }
}
