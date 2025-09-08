import { PythonExtension } from "@vscode/python-extension";
import type InterpreterManager from "../dependencies/interpreterManager";

let previousInterpreterPath: string | undefined = undefined;

export default class VscodeApiInterpreterManager implements InterpreterManager {
  public pythonApi: PythonExtension;

  constructor(pythonApi: PythonExtension) {
    this.pythonApi = pythonApi;
  }

  async select(interpreterPath: string): Promise<void> {
    if (
      interpreterPath !==
      this.pythonApi.environments.getActiveEnvironmentPath().path
    ) {
      previousInterpreterPath =
        this.pythonApi.environments.getActiveEnvironmentPath().path;
    }
    await this.pythonApi.environments.updateActiveEnvironmentPath(
      interpreterPath,
    );
  }

  async previous(): Promise<string | undefined> {
    return previousInterpreterPath;
  }
}
