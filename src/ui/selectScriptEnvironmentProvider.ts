import {
  CodeLens,
  type CodeLensProvider,
  EventEmitter,
  Range,
  type TextDocument,
} from "vscode";
import { type State, IdleState } from "../utils/inlineMetadata";
import { assertNever } from "../utils/typing";

export default class ScriptEnvironmentCodeLensProvider
  implements CodeLensProvider
{
  private _onDidChangeCodeLenses = new EventEmitter<void>();
  readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

  refresh(): void {
    this._onDidChangeCodeLenses.fire();
  }
  provideCodeLenses(document: TextDocument): CodeLens[] {
    const codeLenses: CodeLens[] = [];
    let state = IdleState({
      inlineMetadataFromScript: true,
    }) as State;
    let lineNumber = 0;

    outerloop: while (true) {
      switch (state.type) {
        case "idle":
          state = state.feedEvent(state, {
            line: {
              lineNumber: lineNumber,
              text: document.lineAt(lineNumber).text,
            },
          });
          break;

        case "processing":
          state = state.feedEvent(state, {
            line: {
              lineNumber: lineNumber,
              text: document.lineAt(lineNumber).text,
            },
          });
          lineNumber++;
          break;

        case "error":
          console.error(`Error processing document: ${state.message}`);
          break outerloop;

        case "parsed": {
          if (!state.dependenciesLine) {
            break outerloop;
          }
          const range = new Range(
            0,
            0,
            0,
            document.lineAt(lineNumber - 1).text.length,
          );

          codeLenses.unshift(
            ...[
              new CodeLens(range, {
                title: "$(edit) Select Script Environment",
                command: "uv-vscode.selectScriptInterpreter",
              }),
              new CodeLens(range, {
                title: "$(edit) Exit Script Environment",
                command: "uv-vscode.exitScriptEnvironment",
              }),
            ],
          );
          break outerloop;
        }
        default:
          assertNever(state);
      }
    }
    return codeLenses;
  }
}
