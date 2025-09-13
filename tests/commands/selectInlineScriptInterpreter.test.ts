import { expect, test } from "vitest";
import {
  FakeInterpreterManager,
  FakeLogger,
  FakeSubcommandExecutor,
  withTempDir,
} from "../fixtures";
import SelectScriptInterpreterCommand from "../../src/commands/selectInlineScriptInterpreter";
import { join } from "node:path";
import { writeFileSync } from "node:fs";

test("SelectScriptInterpreter with non-script file", async () => {
  const subcommandExecutor = new FakeSubcommandExecutor();
  const interpreterManager = new FakeInterpreterManager();

  withTempDir(async (dir) => {
    writeFileSync(join(dir, "script.py"), "print(10");
    const logger = new FakeLogger();
    const command = new SelectScriptInterpreterCommand({
      activeFilePath: join(dir, "script.py"),
      uvBinaryPath: "/uv",
      projectRoot: "/project",
      interpreterManager: interpreterManager,
      subcommandExecutor: subcommandExecutor,
      logger: logger,
    });

    await expect(command.run()).rejects.toThrowError(
      "The script has not a valid inline metadata.",
    );
    expect(logger.collectedLogs).toMatchInlineSnapshot(`[]`);
  });
});

test("SelectScriptInterpreter with script file", async () => {
  const subcommandExecutor = new FakeSubcommandExecutor(["ok", "some/path"]);
  const interpreterManager = new FakeInterpreterManager();

  await withTempDir(async (dir) => {
    const pythonInline = `
# /// script
# dependencies = []
# ///
`;
    writeFileSync(join(dir, "script.py"), pythonInline);
    const logger = new FakeLogger();
    const command = new SelectScriptInterpreterCommand({
      activeFilePath: join(dir, "script.py"),
      uvBinaryPath: "/uv",
      projectRoot: "/project",
      interpreterManager: interpreterManager,
      subcommandExecutor: subcommandExecutor,
      logger,
    });
    await command.run();
  });

  expect(interpreterManager.currentInterpreterPath).toMatchInlineSnapshot(
    `"some/path"`,
  );
  expect(interpreterManager.previousInterpreterPath).toMatchInlineSnapshot(
    `undefined`,
  );
});

test("SelectScriptInterpreter multiple times", async () => {
  const subcommandExecutor = new FakeSubcommandExecutor([
    "sync-ok",
    "some/path",
    "sync-ok",
    "some/path",
  ]);
  const interpreterManager = new FakeInterpreterManager();

  await withTempDir(async (dir) => {
    const pythonInline = `
# /// script
# dependencies = []
# ///
`;
    writeFileSync(join(dir, "script.py"), pythonInline);
    const logger = new FakeLogger();
    const command = new SelectScriptInterpreterCommand({
      activeFilePath: join(dir, "script.py"),
      uvBinaryPath: "/uv",
      projectRoot: "/project",
      interpreterManager: interpreterManager,
      subcommandExecutor: subcommandExecutor,
      logger,
    });

    await command.run();
    await command.run();
  });

  expect(interpreterManager.currentInterpreterPath).toMatchInlineSnapshot(
    `"some/path"`,
  );
  expect(interpreterManager.previousInterpreterPath).toMatchInlineSnapshot(
    `undefined`,
  );
});
