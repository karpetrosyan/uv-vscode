// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { workspace } from "vscode";
import { findUvBinaryPath } from "./uv_binary";
import { DEFAULT_SETTINGS, type UvVscodeSettings } from "./settings";
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
import ExtensionLogger from "./impl/logger";
import InitScriptCommand from "./commands/initScript";

export async function activate(context: vscode.ExtensionContext) {
  const validateRepoOutputChannel = vscode.window.createOutputChannel("UV", {
    log: true,
  });

  // We need a wrapper logger to isolate commands from the infrastructure (vscode api)
  const logger = new ExtensionLogger(validateRepoOutputChannel);
  logger.info("Logger initialized");

  const projectRoot = await getProjectRoot();
  logger.info(`Project root: ${projectRoot.uri.fsPath}`);

  const config: UvVscodeSettings = {
    ...DEFAULT_SETTINGS,
    ...workspace.getConfiguration("uv-vscode", projectRoot),
  } as UvVscodeSettings;
  logger.info(`Configuration loaded: ${JSON.stringify(config)}`);

  const uvBinaryPath = await findUvBinaryPath({ settings: config });
  logger.info(`Using uv binary at path: ${uvBinaryPath}`);

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
  logger.info("DependencyCodeLensProvider registered");

  const scriptProvider = new ScriptEnvironmentCodeLensProvider();
  vscode.languages.registerCodeLensProvider(
    { scheme: "file", language: "python" },
    scriptProvider,
  );
  logger.info("ScriptEnvironmentCodeLensProvider registered");

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
          subcommandExecutor: new ShellSubcommandExecutor(logger, config),
          logger,
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
        logger,
      );
      await command.run();
    },
  );

  const addDependencyDisposable = vscode.commands.registerCommand(
    "uv-vscode.addDependency",
    async () => {
      const command = new AddDependencyCommand({
        inputRequester: new VscodeApiInputRequest(),
        subcommandExecutor: new ShellSubcommandExecutor(logger, config),
        projectRoot: projectRoot.uri.fsPath,
        uvBinaryPath,
        activeFilePath: getActiveTextEditorFilePath(),
        logger,
      });
      await command.run();
    },
  );
  const removeDependencyDisposable = vscode.commands.registerCommand(
    "uv-vscode.removeDependency",
    async () => {
      const command = new RemoveDependencyCommand({
        inputRequester: new VscodeApiInputRequest(),
        subcommandExecutor: new ShellSubcommandExecutor(logger, config),
        projectRoot: projectRoot.uri.fsPath,
        uvBinaryPath,
        activeFilePath: getActiveTextEditorFilePath(),
        logger,
      });
      await command.run();
    },
  );
  const initScriptDisposable = vscode.commands.registerCommand(
    "uv-vscode.initScript",
    async () => {
      const activeFilePath = getActiveTextEditorFilePath();

      if (!activeFilePath) {
        vscode.window.showErrorMessage("No active text editor found.");
        return;
      }

      const command = new InitScriptCommand({
        subcommandExecutor: new ShellSubcommandExecutor(logger, config),
        uvBinaryPath,
        logger,
        activeFilePath,
      });
      await command.run();
    },
  );

  context.subscriptions.push(selectScriptInterpreterDisposable);
  context.subscriptions.push(exitScriptEnvironmentDisposable);
  context.subscriptions.push(addDependencyDisposable);
  context.subscriptions.push(removeDependencyDisposable);
  context.subscriptions.push(initScriptDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
