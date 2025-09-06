// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { workspace } from "vscode";
import { findUvBinaryPath } from "./uv_binary";
import { type UvVscodeSettings } from "./settings";
import { PythonExtension } from "@vscode/python-extension";
import SelectScriptInterpreterCommand from "./commands/selectInlineScriptInterpreter";
import VscodeApiInterpreterManager from "./impl/selectInterpreterCallback";
import AddDependencyCommand from "./commands/addDependency";
import VscodeApiInputRequest from "./impl/inputRequester";
import DependencyCodeLensProvider from "./ui/dependencyCodeLensProvider";
import RemoveDependencyCommand from "./commands/removeDependency";
import ScriptEnvironmentCodeLensProvider from "./ui/selectScriptEnvironmentProvider";
import ExitScriptEnvironment from "./commands/exitScriptEnvironment";
import ShellSubcommandExecutor from "./impl/subcommandExecutor";
import { getActiveTextEditorFilePath, getProjectRoot } from "./utils/vscode_";

export async function activate(context: vscode.ExtensionContext) {
  const projectRoot = await getProjectRoot();
  const config: UvVscodeSettings = workspace.getConfiguration(
    "uv-vscode",
    projectRoot,
  ) as UvVscodeSettings;
  const uvBinaryPath = await findUvBinaryPath({ settings: config });
  const pythonExtension = await PythonExtension.api();
  await pythonExtension.ready;

  const dependencyProvider = new DependencyCodeLensProvider();
  vscode.languages.registerCodeLensProvider(
    [
      { scheme: "file", pattern: "**/*.py" },
      { scheme: "file", pattern: "**/*.toml" },
    ],
    dependencyProvider,
  );

  const scriptProvider = new ScriptEnvironmentCodeLensProvider();
  vscode.languages.registerCodeLensProvider(
    { scheme: "file", language: "python" },
    scriptProvider,
  );

  // To trigger the initial rendering of code lenses
  setTimeout(() => {
    scriptProvider.refresh();
    dependencyProvider.refresh();
  }, 1000);

  const selectScriptInterpreterDisposable = vscode.commands.registerCommand(
    "uv-vscode.selectScriptInterpreter",
    async () => {
      // TODO: move to the command
      const activeEditorFilePath = getActiveTextEditorFilePath();
      if (!activeEditorFilePath) {
        vscode.window.showErrorMessage("No active text editor found.");
        return;
      }

      const selectScriptInterpreterCommand = new SelectScriptInterpreterCommand(
        {
          activeFilePath: activeEditorFilePath,
          uvBinaryPath,
          projectRoot: projectRoot.uri.fsPath,
          interpreterManager: new VscodeApiInterpreterManager(pythonExtension),
          subcommandExecutor: new ShellSubcommandExecutor(),
        },
      );
      await selectScriptInterpreterCommand.run();
    },
  );

  const exitScriptEnvironmentDisposable = vscode.commands.registerCommand(
    "uv-vscode.exitScriptEnvironment",
    async () => {
      const command = new ExitScriptEnvironment(
        new VscodeApiInterpreterManager(pythonExtension),
      );
      await command.run();
    },
  );

  const addDependencyDisposable = vscode.commands.registerCommand(
    "uv-vscode.addDependency",
    async () => {
      const command = new AddDependencyCommand({
        inputRequester: new VscodeApiInputRequest(),
        subcommandExecutor: new ShellSubcommandExecutor(),
        projectRoot: projectRoot.uri.fsPath,
        uvBinaryPath,
        activeFilePath: getActiveTextEditorFilePath(),
      });
      await command.run();
    },
  );
  const removeDependencyDisposable = vscode.commands.registerCommand(
    "uv-vscode.removeDependency",
    async () => {
      const command = new RemoveDependencyCommand({
        inputRequester: new VscodeApiInputRequest(),
        subcommandExecutor: new ShellSubcommandExecutor(),
        projectRoot: projectRoot.uri.fsPath,
        uvBinaryPath,
        activeFilePath: getActiveTextEditorFilePath(),
      });
      await command.run();
    },
  );

  context.subscriptions.push(selectScriptInterpreterDisposable);
  context.subscriptions.push(exitScriptEnvironmentDisposable);
  context.subscriptions.push(addDependencyDisposable);
  context.subscriptions.push(removeDependencyDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
