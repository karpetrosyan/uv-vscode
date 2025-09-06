import Command from "./base";
import type InterpreterManager from "../dependencies/interpreterManager";

/**
 * Exits the current virtual environment by restoring the last known interpreter.
 */
export default class ExitScriptEnvironment extends Command {
  interpreterManager: InterpreterManager;

  constructor(interpreterManager: InterpreterManager) {
    super();
    this.interpreterManager = interpreterManager;
  }

  public async run(): Promise<void> {
    const previous = await this.interpreterManager.previous();

    if (previous) {
      await this.interpreterManager.select(previous);
    }
  }
}
