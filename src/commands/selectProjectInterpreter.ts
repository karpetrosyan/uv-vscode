import * as fs from "fs-extra";
import path from "path";
import Command from "./base";
import type InterpreterManager from "../dependencies/interpreterManager";
import type SubcommandExecutor from "../dependencies/subcommandExecutor";

/**
 * Walks up from the file's directory looking for the closest pyproject.toml,
 * never leaving the workspace root.
 */
export async function findProjectDir(
  filePath: string,
  workspaceRoot: string,
): Promise<string | undefined> {
  let dir = path.dirname(filePath);

  while (true) {
    const relative = path.relative(workspaceRoot, dir);
    if (
      relative === ".." ||
      relative.startsWith(".." + path.sep) ||
      path.isAbsolute(relative)
    ) {
      return undefined;
    }
    if (await fs.pathExists(path.join(dir, "pyproject.toml"))) {
      return dir;
    }
    if (relative === "") {
      return undefined;
    }
    dir = path.dirname(dir);
  }
}

/**
 * Selects the interpreter of the closest project (pyproject.toml) to the file.
 */
export default class SelectProjectInterpreterCommand extends Command<boolean> {
  constructor(
    public activeFilePath: string,
    public workspaceRoot: string,
    public uvBinaryPath: string,
    public interpreterManager: InterpreterManager,
    public subcommandExecutor: SubcommandExecutor,
  ) {
    super();
  }

  public async run(): Promise<boolean> {
    const projectDir = await findProjectDir(
      this.activeFilePath,
      this.workspaceRoot,
    );
    if (!projectDir) {
      return false;
    }

    const findArgs = ["python", "find", "--directory", projectDir];
    const projectInterpreterPath = (
      await this.subcommandExecutor.execute(this.uvBinaryPath, findArgs)
    ).trim();

    await this.interpreterManager.select(projectInterpreterPath);
    return true;
  }
}
