// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import path from "path";
import { findUvBinaryPath } from "./uv_binary";
import { PythonExtension } from "@vscode/python-extension";
import SelectScriptInterpreterCommand from "./commands/selectInlineScriptInterpreter";
import VscodeApiInterpreterManager from "./impl/selectInterpreterCallback";
import VscodeApiInputRequest, {
  PredefinedInputRequester,
} from "./impl/inputRequester";
import DependencyCodeLensProvider from "./ui/dependencyCodeLensProvider";
import SelectProjectInterpreterCommand from "./commands/selectProjectInterpreter";
import ShellSubcommandExecutor from "./impl/subcommandExecutor";
import {
  copyUntitledDocument,
  getActiveTextEditorFilePath,
  getProjectRoot,
} from "./utils/vscode_";
import ExtensionLogger from "./impl/logger";
import InitScriptCommand from "./commands/initScript";
import { getUvVscodeSettings } from "./settings";
import UvCliImpl from "./impl/uvCli";
import VsCodeTerminalSender from "./impl/terminalSender";
import type { UvCommand } from "./dependencies/uvCli";
import { getScriptMetadata } from "./utils/inlineMetadata";

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

  // Untitled files have no file on disk, so uv works on copies of them stored here
  const untitledScriptsDir = path.join(
    context.globalStorageUri.fsPath,
    "untitled",
  );

  const dependencyProvider = new DependencyCodeLensProvider();

  vscode.languages.registerCodeLensProvider(
    [
      { scheme: "file", pattern: "**/*.py" },
      { scheme: "file", pattern: "**/*.toml" },
      { scheme: "untitled", language: "python" },
    ],
    dependencyProvider,
  );
  logger.info("DependencyCodeLensProvider registered");

  setTimeout(() => {
    dependencyProvider.refresh();
  }, 1000);

  const onFileChangeHandler = async (
    document: vscode.TextDocument | undefined,
  ) => {
    if (!document) {
      return;
    }
    const interpreterManager = new VscodeApiInterpreterManager(pythonExtension);
    const subcommandExecutor = new ShellSubcommandExecutor(logger);

    try {
      let filePath: string;
      if (document.isUntitled) {
        if (getScriptMetadata(document.getText()) === undefined) {
          return;
        }
        filePath = (await copyUntitledDocument(untitledScriptsDir, document))
          .filePath;
      } else if (document.uri.scheme === "file") {
        filePath = document.uri.fsPath;
      } else {
        // Diffs, output channels, etc. have no file on disk
        return;
      }

      // A script uses its own environment instead of the project's one
      const wasScript =
        (document.isUntitled || document.languageId === "python") &&
        (await new SelectScriptInterpreterCommand(
          filePath,
          uvBinaryPath,
          projectRoot.uri.fsPath,
          interpreterManager,
          subcommandExecutor,
        ).run());
      if (wasScript) {
        return;
      }

      const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
      if (!workspaceFolder) {
        return;
      }
      await new SelectProjectInterpreterCommand(
        filePath,
        workspaceFolder.uri.fsPath,
        uvBinaryPath,
        interpreterManager,
        subcommandExecutor,
      ).run();
    } catch (error) {
      vscode.window.showErrorMessage(
        `Error selecting interpreter: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  };

  const getTextDocumentSaveDisposable = () => {
    return vscode.workspace.onDidSaveTextDocument((document) => {
      // Check if the saved document is the active one
      if (document !== vscode.window.activeTextEditor?.document) {
        return;
      }
      onFileChangeHandler(document);
    });
  };

  const getUntitledDocumentChangeDisposable = () => {
    // Untitled files are never saved, so we enter their environment
    // when their inline metadata changes instead
    const lastMetadata = new Map<string, string | undefined>();
    let timeout: NodeJS.Timeout | undefined;

    return vscode.workspace.onDidChangeTextDocument(({ document }) => {
      if (
        !document.isUntitled ||
        document !== vscode.window.activeTextEditor?.document
      ) {
        return;
      }

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const key = document.uri.toString();
        const metadata = getScriptMetadata(document.getText());
        if (metadata === lastMetadata.get(key)) {
          return;
        }
        lastMetadata.set(key, metadata);
        onFileChangeHandler(document);
      }, 1000);
    });
  };

  const getActiveTextEditorChangeDisposable = () => {
    return vscode.window.onDidChangeActiveTextEditor((editor) =>
      onFileChangeHandler(editor?.document),
    );
  };
  let activeTextEditorChangeDisposable: undefined | vscode.Disposable =
    config.autoSelectInterpreterForScripts
      ? getActiveTextEditorChangeDisposable()
      : undefined;
  let textDocumentSaveDisposable: undefined | vscode.Disposable =
    config.autoSelectInterpreterForScripts
      ? getTextDocumentSaveDisposable()
      : undefined;
  let untitledDocumentChangeDisposable: undefined | vscode.Disposable =
    config.autoSelectInterpreterForScripts
      ? getUntitledDocumentChangeDisposable()
      : undefined;

  if (activeTextEditorChangeDisposable !== undefined) {
    context.subscriptions.push(activeTextEditorChangeDisposable);
  }

  const runUvCli = async (command: UvCommand) => {
    const document = vscode.window.activeTextEditor?.document;
    const untitledScript =
      document?.isUntitled &&
      getScriptMetadata(document.getText()) !== undefined
        ? await copyUntitledDocument(untitledScriptsDir, document)
        : undefined;

    await new UvCliImpl(
      command,
      new VscodeApiInputRequest(),
      new ShellSubcommandExecutor(logger),
      projectRoot.uri.fsPath,
      uvBinaryPath,
      logger,
      // We can't know when a command sent to the terminal has finished,
      // so the changes couldn't be applied back to the untitled file
      untitledScript ? { ...config, sendUvCommandToTerminal: false } : config,
      new VsCodeTerminalSender(),
      document?.isUntitled
        ? untitledScript?.filePath
        : getActiveTextEditorFilePath(),
    ).run();

    await untitledScript?.applyChanges();
  };

  // UV Commands
  const uvCommands: UvCommand[] = [
    "add",
    "remove",
    "init",
    "sync",
    "lock",
    "venv",
  ];
  context.subscriptions.push(
    ...uvCommands.map((command) =>
      vscode.commands.registerCommand(`uv-vscode.${command}`, () =>
        runUvCli(command),
      ),
    ),
  );

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
              textDocumentSaveDisposable?.dispose();
              untitledDocumentChangeDisposable?.dispose();
              activeTextEditorChangeDisposable = undefined;
              logger.info(
                "Auto select interpreter for scripts disabled, listener removed",
              );
            } else {
              if (activeTextEditorChangeDisposable === undefined) {
                activeTextEditorChangeDisposable =
                  getActiveTextEditorChangeDisposable();
                textDocumentSaveDisposable = getTextDocumentSaveDisposable();
                untitledDocumentChangeDisposable =
                  getUntitledDocumentChangeDisposable();
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

    // initScript
    vscode.commands.registerCommand("uv-vscode.initScript", async () => {
      const document = vscode.window.activeTextEditor?.document;
      const untitledScript = document?.isUntitled
        ? await copyUntitledDocument(untitledScriptsDir, document)
        : undefined;
      const activeFilePath =
        untitledScript?.filePath ?? getActiveTextEditorFilePath();

      if (!activeFilePath) {
        vscode.window.showErrorMessage("No active text editor found.");
        return;
      }
      const command = new InitScriptCommand(
        new UvCliImpl(
          "init",
          new PredefinedInputRequester(""),
          new ShellSubcommandExecutor(logger),
          projectRoot.uri.fsPath,
          uvBinaryPath,
          logger,
          untitledScript
            ? { ...config, sendUvCommandToTerminal: false }
            : config,
          new VsCodeTerminalSender(),
          activeFilePath,
          ["--script", activeFilePath],
        ),
        new SelectScriptInterpreterCommand(
          activeFilePath,
          uvBinaryPath,
          projectRoot.uri.fsPath,
          new VscodeApiInterpreterManager(pythonExtension),
          new ShellSubcommandExecutor(logger),
        ),
      );
      await command.run();
      await untitledScript?.applyChanges();
    }),
    // run
    vscode.commands.registerCommand("uv-vscode.run", async () => {
      const document = vscode.window.activeTextEditor?.document;
      if (!document) {
        vscode.window.showErrorMessage("No active text editor found.");
        return;
      }

      let filePath: string;
      if (document.isUntitled) {
        filePath = (await copyUntitledDocument(untitledScriptsDir, document))
          .filePath;
      } else {
        await document.save();
        filePath = document.uri.fsPath;
      }

      new VsCodeTerminalSender().sendText(
        `${uvBinaryPath} run --script "${filePath}"`,
        true,
      );
    }),
    // show logs
    vscode.commands.registerCommand("uv-vscode.showLogs", async () => {
      validateRepoOutputChannel.show();
    }),
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
