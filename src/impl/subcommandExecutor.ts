import type Logger from "../dependencies/logger";
import type SubcommandExecutor from "../dependencies/subcommandExecutor";
import { executeFile } from "../utils/subprocess";

export default class ShellSubcommandExecutor implements SubcommandExecutor {
  constructor(private readonly logger: Logger) {}

  async execute(command: string, args: string[]): Promise<string> {
    try {
      this.logger.info(`Executing command: ${command} ${args.join(" ")}`);
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
