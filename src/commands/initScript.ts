import type Logger from "../dependencies/logger";
import type SubcommandExecutor from "../dependencies/subcommandExecutor";
import Command from "./base";

/**
 * Initializes a script using uv init --script
 */
export default class InitScriptCommand extends Command {
  activeFilePath: string;
  uvBinaryPath: string;
  subcommandExecutor: SubcommandExecutor;
  logger: Logger;

  constructor({
    subcommandExecutor,
    uvBinaryPath,
    activeFilePath,
    logger,
  }: {
    subcommandExecutor: SubcommandExecutor;
    uvBinaryPath: string;
    activeFilePath: string;
    logger: Logger;
  }) {
    super();
    this.uvBinaryPath = uvBinaryPath;
    this.subcommandExecutor = subcommandExecutor;
    this.activeFilePath = activeFilePath;
    this.logger = logger;
  }

  public async run(): Promise<void> {
    const args = ["init", "--script", this.activeFilePath];

    this.logger.debug(
      `Initializing script with command: ${this.uvBinaryPath} ${args.join(" ")}`,
    );

    await this.subcommandExecutor.execute(this.uvBinaryPath, args, true);
  }
}
