import type SubcommandExecutor from "../dependencies/subcommandExecutor";
import { executeFile } from "../utils/subprocess";

export default class ShellSubcommandExecutor implements SubcommandExecutor {
  async execute(command: string, args: string[]): Promise<string> {
    try {
      return executeFile(command, args);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to execute command: ${error.message}`);
      } else {
        throw new Error(
          "An unknown error occurred while executing the command.",
        );
      }
    }
  }
}
