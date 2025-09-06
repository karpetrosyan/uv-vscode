import {
  type CodeLensProvider,
  type TextDocument,
  CodeLens,
  EventEmitter,
  Range,
} from "vscode";
import { type State, IdleState } from "../utils/inlineMetadata";

export default class DependencyCodeLensProvider implements CodeLensProvider {
  private _onDidChangeCodeLenses = new EventEmitter<void>();
  readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

  refresh(): void {
    this._onDidChangeCodeLenses.fire();
  }
  provideCodeLenses(document: TextDocument): CodeLens[] {
    const codeLenses: CodeLens[] = [];
    const isTomlFile = document.languageId === "toml";
    let state = IdleState({
      inlineMetadataFromScript: !isTomlFile,
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
            state.dependenciesLine!,
            0,
            state.dependenciesLine!,
            document.lineAt(lineNumber - 1).text.length,
          );

          codeLenses.unshift(
            ...[
              new CodeLens(range, {
                title: "$(add) Add a dependency",
                command: "uv-vscode.addDependency",
              }),
              new CodeLens(range, {
                title: "$(edit) Remove dependency",
                command: "uv-vscode.removeDependency",
              }),
            ],
          );
          break outerloop;
        }
        default: {
          // 👇 This will trigger a compiler error if a case is missing
          const _exhaustiveCheck: never = state;
          throw new Error(`Unhandled state: ${_exhaustiveCheck}`);
        }
      }
    }
    return codeLenses;
  }
}
