import { expect, test } from "vitest";
import RemoveDependencyCommand from "../../src/commands/removeDependency";
import {
  FakeInputRequester,
  FakeLogger,
  FakeSubcommandExecutor,
  withTempDir,
} from "../fixtures";
import { join } from "node:path";
import { writeFileSync } from "node:fs";

test("Basic RemoveDependency", async () => {
  const inputRequester = new FakeInputRequester(["dependency-name"]);
  const subcommandExecutor = new FakeSubcommandExecutor();
  const logger = new FakeLogger();
  const config = {
    noConfigForScripts: true,
    autoSelectInterpreterForScripts: true,
  };
  const command = new RemoveDependencyCommand(
    inputRequester,
    subcommandExecutor,
    "/path",
    "/uv",
    logger,
    config,
  );

  await command.run();

  expect(subcommandExecutor.inputs).toMatchInlineSnapshot(`
    [
      "/uv remove --directory /path dependency-name",
      "/uv sync --directory /path --inexact",
    ]
  `);
  expect(logger.collectedLogs).toMatchInlineSnapshot(`
    [
      "Checking if the active file undefined is a script",
      "Removing dependency with command: /uv remove --directory /path dependency-name",
      "Syncing dependencies with command: /uv sync --directory /path --inexact",
    ]
  `);
});

test("RemoveDependency without input", async () => {
  const inputRequester = new FakeInputRequester([]);
  const subcommandExecutor = new FakeSubcommandExecutor();
  const logger = new FakeLogger();
  const config = {
    noConfigForScripts: true,
    autoSelectInterpreterForScripts: true,
  };
  const command = new RemoveDependencyCommand(
    inputRequester,
    subcommandExecutor,
    "/path",
    "/uv",
    logger,
    config,
  );

  await expect(command.run()).rejects.toThrowError(
    "No input provided for the dependency.",
  );
  expect(logger.collectedLogs).toMatchInlineSnapshot(`[]`);
});

test("RemoveDependency with active script file", async () => {
  const inputRequester = new FakeInputRequester(["hishel"]);
  const subcommandExecutor = new FakeSubcommandExecutor();

  await withTempDir(async (dir) => {
    const pythonInline = `
# /// script
# dependencies = []
# ///
`;
    writeFileSync(join(dir, "script.py"), pythonInline);
    const logger = new FakeLogger();
    const config = {
      noConfigForScripts: true,
      autoSelectInterpreterForScripts: true,
    };
    const command = new RemoveDependencyCommand(
      inputRequester,
      subcommandExecutor,
      "/path",
      "/uv",
      logger,
      config,
      join(dir, "script.py"),
    );

    await command.run();

    expect(subcommandExecutor.inputs[0]).includes(`--script`);
    expect(subcommandExecutor.inputs[1]).includes(`--script`);
  });
});
