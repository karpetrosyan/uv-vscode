import { PythonExtension } from "@vscode/python-extension";
import type InterpreterManager from "../dependencies/interpreterManager";

export default class VscodeApiInterpreterManager implements InterpreterManager {
  public pythonApi: PythonExtension;

  constructor(pythonApi: PythonExtension) {
    this.pythonApi = pythonApi;
  }

  async select(interpreterPath: string): Promise<void> {
    await this.pythonApi.environments.updateActiveEnvironmentPath(
      interpreterPath,
    );
  }
}
