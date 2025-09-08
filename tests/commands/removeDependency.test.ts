import { expect, test } from "vitest";
import RemoveDependencyCommand from "../../src/commands/removeDependency";
import {
  FakeInputRequester,
  FakeSubcommandExecutor,
  withTempDir,
} from "../fixtures";
import { join } from "node:path";
import { writeFileSync } from "node:fs";

test("Basic RemoveDependency", async () => {
  const inputRequester = new FakeInputRequester(["dependency-name"]);
  const subcommandExecutor = new FakeSubcommandExecutor();
  const command = new RemoveDependencyCommand({
    inputRequester: inputRequester,
    subcommandExecutor: subcommandExecutor,
    projectRoot: "/path",
    uvBinaryPath: "/uv",
  });

  await command.run();

  expect(subcommandExecutor.inputs).toMatchInlineSnapshot(`
    [
      "/uv remove --directory /path dependency-name",
      "/uv sync --directory /path --inexact",
    ]
  `);
});

test("RemoveDependency without input", async () => {
  const inputRequester = new FakeInputRequester([]);
  const subcommandExecutor = new FakeSubcommandExecutor();
  const command = new RemoveDependencyCommand({
    inputRequester: inputRequester,
    subcommandExecutor: subcommandExecutor,
    projectRoot: "/path",
    uvBinaryPath: "/uv",
  });

  await expect(command.run()).rejects.toThrowError(
    "No input provided for the dependency.",
  );
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
    const command = new RemoveDependencyCommand({
      inputRequester: inputRequester,
      subcommandExecutor: subcommandExecutor,
      projectRoot: "/path",
      uvBinaryPath: "/uv",
      activeFilePath: join(dir, "script.py"),
    });

    await command.run();

    expect(subcommandExecutor.inputs[0]).includes(`--script`);
    expect(subcommandExecutor.inputs[1]).includes(`--script`);
  });
});
