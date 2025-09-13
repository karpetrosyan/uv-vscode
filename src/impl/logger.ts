import { LogLevel, type LogOutputChannel } from "vscode";
import type Logger from "../dependencies/logger";
import { assertNever } from "../utils/typing";

export default class ExtensionLogger implements Logger {
  constructor(private readonly channel: LogOutputChannel) {}

  debug(message: string): void {
    this.channel.debug(message);
  }

  error(message: string | Error): void {
    this.channel.error(message);
  }
  info(message: string): void {
    this.channel.info(message);
  }

  isEnabledFor(level: "debug" | "error" | "info"): boolean {
    let logLevel: LogLevel;
    if (level === "debug") {
      logLevel = LogLevel.Debug;
    } else if (level === "error") {
      logLevel = LogLevel.Error;
    } else if (level === "info") {
      logLevel = LogLevel.Info;
    } else {
      assertNever(level);
    }

    return logLevel.valueOf() >= this.channel.logLevel.valueOf();
  }
}
