import { expect, test } from "vitest";
import { FakeLogger, FakeSubcommandExecutor } from "../fixtures";
import InitScriptCommand from "../../src/commands/initScript";

test("Basic InitScript", async () => {
  const logger = new FakeLogger();
  const subcommandExecutor = new FakeSubcommandExecutor();
  const config = {
    noConfigForScripts: true,
    autoSelectInterpreterForScripts: true,
  };
  const command = new InitScriptCommand(
    subcommandExecutor,
    "/uv",
    "/path/to/active/file.py",
    logger,
    config,
  );

  await command.run();

  expect(subcommandExecutor.inputs).toMatchInlineSnapshot(`
    [
      "/uv init --no-config --python=3.12 --script /path/to/active/file.py",
    ]
  `);
});
