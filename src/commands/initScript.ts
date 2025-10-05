import type { UvCommand } from "../dependencies/uvCli";
import type UvCli from "../dependencies/uvCli";
import Command from "./base";
import type SelectScriptInterpreterCommand from "./selectInlineScriptInterpreter";

/**
 * Initializes a script using uv init --script
 */
export default class InitScriptCommand<
  T extends UvCommand = "init",
> extends Command {
  constructor(
    public uvCli: UvCli<T>,
    public selectScriptInterpreter: SelectScriptInterpreterCommand,
  ) {
    super();
  }

  public async run(): Promise<void> {
    await this.uvCli.run();
    // After initializing the script, we should also select the interpreter
    await this.selectScriptInterpreter.run();
  }
}
