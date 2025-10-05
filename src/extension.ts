// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { findUvBinaryPath } from "./uv_binary";
import { PythonExtension } from "@vscode/python-extension";
import SelectScriptInterpreterCommand from "./commands/selectInlineScriptInterpreter";
import VscodeApiInterpreterManager from "./impl/selectInterpreterCallback";
import AddDependencyCommand from "./commands/add";
import VscodeApiInputRequest from "./impl/inputRequester";
import DependencyCodeLensProvider from "./ui/dependencyCodeLensProvider";
import RemoveDependencyCommand from "./commands/remove";
import ExitScriptEnvironment from "./commands/exitScriptEnvironment";
import ShellSubcommandExecutor from "./impl/subcommandExecutor";
import { getActiveTextEditorFilePath, getProjectRoot } from "./utils/vscode_";
import ExtensionLogger from "./impl/logger";
import InitScriptCommand from "./commands/initScript";
import { getUvVscodeSettings } from "./settings";
import InitCommand from "./commands/init";
import SyncCommand from "./commands/sync";

export async function activate(context: vscode.ExtensionContext) {
  const validateRepoOutputChannel = vscode.window.createOutputChannel("UV", {
    log: true,
  });

  const pythonExtension = await PythonExtension.api();

  // We need a wrapper logger to isolate commands from the infrastructure (vscode api)
  const logger = new ExtensionLogger(validateRepoOutputChannel);
  logger.info("Logger initialized");

  const projectRoot = await getProjectRoot();
  logger.info(`Project root: ${projectRoot.uri.fsPath}`);

  let config = getUvVscodeSettings();

  logger.info(`Configuration loaded: ${JSON.stringify(config)}`);

  let uvBinaryPath = await findUvBinaryPath({ settings: config });
  logger.info(`Using uv binary at path: ${uvBinaryPath}`);

  const dependencyProvider = new DependencyCodeLensProvider();

  vscode.languages.registerCodeLensProvider(
    [
      { scheme: "file", pattern: "**/*.py" },
      { scheme: "file", pattern: "**/*.toml" },
    ],
    dependencyProvider,
  );
  logger.info("DependencyCodeLensProvider registered");

  setTimeout(() => {
    dependencyProvider.refresh();
  }, 1000);

  const getActiveTextEditorChangeDisposable = () => {
    return vscode.window.onDidChangeActiveTextEditor(async (e) => {
      if (!e) {
        return;
      }
      const selectCommand = new SelectScriptInterpreterCommand(
        e.document.uri.fsPath ?? "",
        uvBinaryPath,
        projectRoot.uri.fsPath,
        new VscodeApiInterpreterManager(pythonExtension),
        new ShellSubcommandExecutor(logger, config),
      );

      const wasScript = await selectCommand.run();
      if (!wasScript) {
        const exitCommand = new ExitScriptEnvironment(
          new VscodeApiInterpreterManager(pythonExtension),
        );

        await exitCommand.run();
      }
    });
  };
  let activeTextEditorChangeDisposable: undefined | vscode.Disposable =
    config.autoSelectInterpreterForScripts
      ? getActiveTextEditorChangeDisposable()
      : undefined;

  if (activeTextEditorChangeDisposable !== undefined) {
    context.subscriptions.push(activeTextEditorChangeDisposable);
  }

  context.subscriptions.push(
    // Handle configuration changes
    vscode.workspace.onDidChangeConfiguration(
      async (e: vscode.ConfigurationChangeEvent) => {
        if (e.affectsConfiguration("uv")) {
          config = getUvVscodeSettings();
          uvBinaryPath = await findUvBinaryPath({ settings: config });

          if (e.affectsConfiguration("uv.autoSelectInterpreterForScripts")) {
            if (!config.autoSelectInterpreterForScripts) {
              activeTextEditorChangeDisposable?.dispose();
              activeTextEditorChangeDisposable = undefined;
              logger.info(
                "Auto select interpreter for scripts disabled, listener removed",
              );
            } else {
              if (activeTextEditorChangeDisposable === undefined) {
                activeTextEditorChangeDisposable =
                  getActiveTextEditorChangeDisposable();
                context.subscriptions.push(activeTextEditorChangeDisposable);
              }
              logger.info(
                "Auto select interpreter for scripts enabled, but please reload the window to apply the changes",
              );
            }
          }
        }
      },
    ),
    // Register commands
    // add
    vscode.commands.registerCommand("uv-vscode.add", async () => {
      const command = new AddDependencyCommand(
        new VscodeApiInputRequest(),
        new ShellSubcommandExecutor(logger, config),
        projectRoot.uri.fsPath,
        uvBinaryPath,
        getActiveTextEditorFilePath(),
      );
      await command.run();
    }),
    // remove
    vscode.commands.registerCommand("uv-vscode.remove", async () => {
      const command = new RemoveDependencyCommand(
        new VscodeApiInputRequest(),
        new ShellSubcommandExecutor(logger, config),
        projectRoot.uri.fsPath,
        uvBinaryPath,
        logger,
        config,
        getActiveTextEditorFilePath(),
      );
      await command.run();
    }),
    // initScript
    vscode.commands.registerCommand("uv-vscode.initScript", async () => {
      const activeFilePath = getActiveTextEditorFilePath();

      if (!activeFilePath) {
        vscode.window.showErrorMessage("No active text editor found.");
        return;
      }

      const command = new InitScriptCommand(
        new ShellSubcommandExecutor(logger, config),
        uvBinaryPath,
        activeFilePath,
        new SelectScriptInterpreterCommand(
          activeFilePath,
          uvBinaryPath,
          projectRoot.uri.fsPath,
          new VscodeApiInterpreterManager(pythonExtension),
          new ShellSubcommandExecutor(logger, config),
        ),
      );
      await command.run();
    }),

    // init
    vscode.commands.registerCommand("uv-vscode.init", async () => {
      const command = new InitCommand(
        new VscodeApiInputRequest(),
        new ShellSubcommandExecutor(logger, config),
        uvBinaryPath,
        projectRoot.uri.fsPath,
      );
      await command.run();
    }),

    // sync
    vscode.commands.registerCommand("uv-vscode.sync", async () => {
      const command = new SyncCommand(
        new VscodeApiInputRequest(),
        new ShellSubcommandExecutor(logger, config),
        uvBinaryPath,
        projectRoot.uri.fsPath,
      );
      await command.run();
    }),
    // show logs
    vscode.commands.registerCommand("uv-vscode.showLogs", async () => {
      validateRepoOutputChannel.show();
    }),
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
