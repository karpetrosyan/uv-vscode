import Command from "./base";
import type InterpreterManager from "../dependencies/interpreterManager";
import type Logger from "../dependencies/logger";

/**
 * Exits the current virtual environment by restoring the last known interpreter.
 */
export default class ExitScriptEnvironment extends Command {
  interpreterManager: InterpreterManager;
  logger: Logger;

  constructor(interpreterManager: InterpreterManager, logger: Logger) {
    super();
    this.interpreterManager = interpreterManager;
    this.logger = logger;
  }

  public async run(): Promise<void> {
    const previous = await this.interpreterManager.previous();
    this.logger.debug(
      `Exiting script environment. Previous interpreter: ${previous ?? "none"}`,
    );

    if (previous) {
      await this.interpreterManager.select(previous);
    }
  }
}
