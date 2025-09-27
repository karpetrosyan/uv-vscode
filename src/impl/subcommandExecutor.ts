import { UV_BINARY_NAME } from "../constants";
import type Logger from "../dependencies/logger";
import type SubcommandExecutor from "../dependencies/subcommandExecutor";
import type { UvVscodeSettings } from "../settings";
import { executeFile } from "../utils/subprocess";

export default class ShellSubcommandExecutor implements SubcommandExecutor {
  constructor(
    private readonly logger: Logger,
    private readonly config: UvVscodeSettings,
  ) {}

  async execute(
    command: string,
    args: string[],
    isScript: boolean,
  ): Promise<string> {
    if (
      command.endsWith(UV_BINARY_NAME) &&
      isScript &&
      this.config.noConfigForScripts
    ) {
      args.push("--no-config");
    }

    try {
      return await executeFile(command, args);
    } catch (error) {
      const commandInfo = `${command} ${args.join(" ")}`;
      if (error instanceof Error) {
        this.logger.error(
          `Error executing command [${commandInfo}]: ${error.message}`,
        );
        throw new Error(
          `Failed to execute command [${commandInfo}]: ${error.message}`,
        );
      } else {
        this.logger.error("An unknown error occurred while executing command.");
        throw new Error(
          `An unknown error occurred while executing the command [${commandInfo}].`,
        );
      }
    }
  }
}
