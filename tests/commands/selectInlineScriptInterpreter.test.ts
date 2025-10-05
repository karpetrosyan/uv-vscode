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
import { SCRIPTS_ENV_DIR } from "../../src/constants";

const getScriptPath = (fileName: string) => join(SCRIPTS_ENV_DIR, fileName);

test("SelectScriptInterpreter with non-script file", async () => {
  const subcommandExecutor = new FakeSubcommandExecutor();
  const interpreterManager = new FakeInterpreterManager();

  withTempDir(async (dir) => {
    writeFileSync(join(dir, "script.py"), "print(10");
    const logger = new FakeLogger();
    const command = new SelectScriptInterpreterCommand(
      join(dir, "script.py"),
      "/uv",
      "/project",
      interpreterManager,
      subcommandExecutor,
    );

    await expect(command.run()).resolves.toStrictEqual(false);
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
    const command = new SelectScriptInterpreterCommand(
      join(dir, "script.py"),
      "/uv",
      "/project",
      interpreterManager,
      subcommandExecutor,
    );
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
    getScriptPath("script1.py"),
    "sync-ok",
    getScriptPath("script2.py"),
  ]);
  const interpreterManager = new FakeInterpreterManager();
  interpreterManager.currentInterpreterPath = "some/path";

  await withTempDir(async (dir) => {
    const pythonInline = `
# /// script
# dependencies = []
# ///
`;
    writeFileSync(join(dir, "script.py"), pythonInline);
    const command = new SelectScriptInterpreterCommand(
      join(dir, "script.py"),
      "/uv",
      "/project",
      interpreterManager,
      subcommandExecutor,
    );

    await command.run();
    await command.run();
  });

  expect(
    interpreterManager.currentInterpreterPath?.endsWith("script2.py"),
  ).toBe(true);
  expect(interpreterManager.previousInterpreterPath).toMatchInlineSnapshot(
    `"some/path"`,
  );
});
