import { expect, test } from "vitest";
import {
  FakeInterpreterManager,
  FakeLogger,
  FakeSubcommandExecutor,
  withTempDir,
} from "../fixtures";
import InitScriptCommand from "../../src/commands/initScript";
import SelectScriptInterpreterCommand from "../../src/commands/selectInlineScriptInterpreter";
import { writeFileSync } from "fs";
import { join } from "path";

test("Basic InitScript", async () => {
  const logger = new FakeLogger();
  const subcommandExecutor = new FakeSubcommandExecutor();
  const config = {
    noConfigForScripts: true,
    autoSelectInterpreterForScripts: true,
  };
  const interpreterManager = new FakeInterpreterManager();
  await withTempDir(async (dir) => {
    const pythonInline = `# /// script
# dependencies = []
# ///
  `;
    writeFileSync(join(dir, "script.py"), pythonInline);
    const command = new InitScriptCommand(
      subcommandExecutor,
      "/uv",
      join(dir, "script.py"),
      logger,
      config,
      new SelectScriptInterpreterCommand(
        join(dir, "script.py"),
        "/uv",
        "/path/to/project",
        interpreterManager,
        subcommandExecutor,
        logger,
        config,
      ),
    );
    await command.run();
  });

  expect(
    subcommandExecutor.inputs[0]
      ?.split(" ")
      .slice(0, subcommandExecutor.inputs[0]?.split(" ")?.length - 2),
  ).toMatchInlineSnapshot(
    `
    [
      "/uv",
      "init",
      "--no-config",
      "--python=3.12",
    ]
  `,
  );
  expect(interpreterManager.currentInterpreterPath).toMatchInlineSnapshot(
    `"ok"`,
  );
  expect(interpreterManager.previousInterpreterPath).toMatchInlineSnapshot(
    `undefined`,
  );
});
