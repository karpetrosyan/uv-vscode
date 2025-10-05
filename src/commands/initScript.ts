import type SubcommandExecutor from "../dependencies/subcommandExecutor";
import Command from "./base";
import type SelectScriptInterpreterCommand from "./selectInlineScriptInterpreter";

/**
 * Initializes a script using uv init --script
 */
export default class InitScriptCommand extends Command {
  constructor(
    public subcommandExecutor: SubcommandExecutor,
    public uvBinaryPath: string,
    public activeFilePath: string,
    public selectScriptInterpreter: SelectScriptInterpreterCommand
  ) {
    super();
  }

  public async run(): Promise<void> {
    const args = ["init", "--python=3.12", "--script", this.activeFilePath];
    await this.subcommandExecutor.execute(this.uvBinaryPath, args);
    // After initializing the script, we should also select the interpreter
    await this.selectScriptInterpreter.run();
  }
}
