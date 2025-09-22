import { expect, test } from "vitest";
import { FakeLogger, FakeSubcommandExecutor } from "../fixtures";
import InitScriptCommand from "../../src/commands/initScript";

test("Basic InitScript", async () => {
  const logger = new FakeLogger();
  const subcommandExecutor = new FakeSubcommandExecutor();
  const command = new InitScriptCommand({
    subcommandExecutor: subcommandExecutor,
    uvBinaryPath: "/uv",
    activeFilePath: "/path/to/active/file.py",
    logger,
  });

  await command.run();

  expect(subcommandExecutor.inputs).toMatchInlineSnapshot(`
    [
      "/uv init --script /path/to/active/file.py",
    ]
  `);
});
