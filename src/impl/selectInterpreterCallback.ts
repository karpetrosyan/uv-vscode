import { PythonExtension } from "@vscode/python-extension";
import type InterpreterManager from "../dependencies/interpreterManager";
import { SCRIPTS_ENV_DIR as SCRIPTS_ENV_DIR } from "../constants";

let previousInterpreterPath: string | undefined = undefined;

export default class VscodeApiInterpreterManager implements InterpreterManager {
  public pythonApi: PythonExtension;

  constructor(pythonApi: PythonExtension) {
    this.pythonApi = pythonApi;
  }

  async select(interpreterPath: string): Promise<void> {
    const currentInterpreterPath =
      this.pythonApi.environments.getActiveEnvironmentPath();

    if (!currentInterpreterPath.path.startsWith(SCRIPTS_ENV_DIR)) {
      previousInterpreterPath = currentInterpreterPath.path;
    }

    await this.pythonApi.environments.updateActiveEnvironmentPath(
      interpreterPath,
    );
  }

  async previous(): Promise<string | undefined> {
    return previousInterpreterPath;
  }
}
