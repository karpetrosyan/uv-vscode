import type Logger from "../dependencies/logger";
import type SubcommandExecutor from "../dependencies/subcommandExecutor";
import type { UvVscodeSettings } from "../settings";
import Command from "./base";

/**
 * Initializes a script using uv init --script
 */
export default class InitScriptCommand extends Command {
  constructor(
    public subcommandExecutor: SubcommandExecutor,
    public uvBinaryPath: string,
    public activeFilePath: string,
    public logger: Logger,
    public config: UvVscodeSettings,
  ) {
    super();
  }

  public async run(): Promise<void> {
    const noConfigOptions = this.config.noConfigForScripts
      ? ["--no-config"]
      : [];
    const args = [
      "init",
      ...noConfigOptions,
      "--python=3.12",
      "--script",
      this.activeFilePath,
    ];

    this.logger.debug(
      `Initializing script with command: ${this.uvBinaryPath} ${args.join(" ")}`,
    );

    await this.subcommandExecutor.execute(this.uvBinaryPath, args);
  }
}
