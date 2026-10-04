import type { Terminal } from "vscode";
import * as vscode from "vscode";
import type TerminalSender from "../dependencies/terminalSender";

let UvTerminal: Terminal | undefined = undefined;

export default class VsCodeTerminalSender implements TerminalSender {
  sendText(text: string, execute: boolean): void {
    // The terminal might have been closed since the last command
    if (UvTerminal?.exitStatus !== undefined) {
      UvTerminal = undefined;
    }
    UvTerminal ??=
      vscode.window.terminals.find((t) => t.name === "Uv") ??
      vscode.window.createTerminal("Uv");

    UvTerminal.show(true);
    UvTerminal.sendText(text, execute);
  }
}
