import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path/posix";
import type InputRequester from "../src/dependencies/inputRequester";
import type InterpreterManager from "../src/dependencies/interpreterManager";
import type SubcommandExecutor from "../src/dependencies/subcommandExecutor";
import type Logger from "../src/dependencies/logger";
import { SCRIPTS_ENV_DIR } from "../src/constants";

export class FakeInputRequester implements InputRequester {
  constructor(public responses: (string | undefined)[]) {}

  askForInput(): Promise<string | undefined> {
    return Promise.resolve(this.responses.shift());
  }
}

export class FakeSubcommandExecutor implements SubcommandExecutor {
  public inputs: string[] = [];

  constructor(public outputs: string[] = []) {}

  async execute(command: string, args: string[]): Promise<string> {
    this.inputs.push(`${command} ${args.join(" ")}`);
    // @ts-expect-error TS2322
    return this.outputs.length > 0 ? this.outputs.shift() : "ok";
  }
}

export class FakeInterpreterManager implements InterpreterManager {
  constructor(
    public previousInterpreterPath?: string,
    public currentInterpreterPath?: string,
  ) {}

  async select(interpreterPath: string): Promise<void> {
    if (!this.currentInterpreterPath?.startsWith(SCRIPTS_ENV_DIR)) {
      this.previousInterpreterPath = this.currentInterpreterPath;
    }
    this.currentInterpreterPath = interpreterPath;
  }

  async previous(): Promise<string | undefined> {
    return this.previousInterpreterPath;
  }
}

export class FakeLogger implements Logger {
  constructor(public collectedLogs: (string | Error)[] = []) {}

  debug(message: string): void {
    this.collectedLogs.push(message);
  }
  error(message: string | Error): void {
    this.collectedLogs.push(message);
  }
  info(message: string): void {
    this.collectedLogs.push(message);
  }

  isEnabledFor(level: "debug" | "error" | "info"): boolean {
    return level ? true : true;
  }
}

export function withTempDir(fn: (dir: string) => Promise<void>) {
  const dir = mkdtempSync(join(tmpdir(), "vitest-"));
  return fn(dir).finally(() => rmSync(dir, { recursive: true, force: true }));
}
