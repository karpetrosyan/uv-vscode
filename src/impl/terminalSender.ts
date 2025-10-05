import type { Terminal } from "vscode";
import * as vscode from "vscode";
import type TerminalSender from "../dependencies/terminalSender";

let UvTerminal: Terminal | undefined = undefined;

export default class VsCodeTerminalSender implements TerminalSender {
  sendText(text: string, execute: boolean): void {
    UvTerminal ??=
      vscode.window.terminals.find((t) => t.name === "Uv") ??
      vscode.window.createTerminal("Uv");

    UvTerminal.sendText(text, execute);
  }
}
