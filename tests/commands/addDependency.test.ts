import { expect, test } from "vitest";
import AddDependencyCommand from "../../src/commands/addDependency";
import {
  FakeInputRequester,
  FakeLogger,
  FakeSubcommandExecutor,
} from "../fixtures";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";

function withTempDir(fn: (dir: string) => Promise<void>) {
  const dir = mkdtempSync(join(tmpdir(), "vitest-"));
  return fn(dir).finally(() => rmSync(dir, { recursive: true, force: true }));
}

test("Basic AddDependency", async () => {
  const inputRequester = new FakeInputRequester(["dependency-name"]);
  const subcommandExecutor = new FakeSubcommandExecutor();
  const logger = new FakeLogger();
  const command = new AddDependencyCommand({
    inputRequester: inputRequester,
    subcommandExecutor: subcommandExecutor,
    projectRoot: "/path",
    uvBinaryPath: "/uv",
    logger,
  });

  await command.run();

  expect(subcommandExecutor.inputs).toMatchInlineSnapshot(`
    [
      "/uv add --directory /path dependency-name",
      "/uv sync --directory /path --inexact --all-extras --all-groups",
    ]
  `);
  expect(logger.collectedLogs).toMatchInlineSnapshot(`
    [
      "Checking if the active file undefined is a script",
      "Adding dependency with command: /uv add --directory /path dependency-name",
      "Syncing dependencies with command: /uv sync --directory /path --inexact --all-extras --all-groups",
    ]
  `);
});

test("AddDependency without input", async () => {
  const inputRequester = new FakeInputRequester([]);
  const subcommandExecutor = new FakeSubcommandExecutor();
  const logger = new FakeLogger();
  const command = new AddDependencyCommand({
    inputRequester: inputRequester,
    subcommandExecutor: subcommandExecutor,
    projectRoot: "/path",
    uvBinaryPath: "/uv",
    logger,
  });

  await expect(command.run()).rejects.toThrowError(
    "No input provided for the dependency.",
  );
  expect(logger.collectedLogs).toMatchInlineSnapshot(`[]`);
});

test("AddDependency with active script file", async () => {
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
    const command = new AddDependencyCommand({
      inputRequester: inputRequester,
      subcommandExecutor: subcommandExecutor,
      projectRoot: "/path",
      uvBinaryPath: "/uv",
      activeFilePath: join(dir, "script.py"),
      logger,
    });

    await command.run();

    expect(subcommandExecutor.inputs[0]).includes(`--script`);
    expect(subcommandExecutor.inputs[1]).includes(`--script`);
  });
});
