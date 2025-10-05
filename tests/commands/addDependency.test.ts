import { expect, test } from "vitest";
import AddDependencyCommand from "../../src/commands/add";
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

test("Basic Add", async () => {
  const inputRequester = new FakeInputRequester(["dependency-name"]);
  const subcommandExecutor = new FakeSubcommandExecutor();
  const logger = new FakeLogger();
  const command = new AddDependencyCommand(
    inputRequester,
    subcommandExecutor,
    "/path",
    "/uv"
  );

  await command.run();

  expect(subcommandExecutor.inputs).toMatchInlineSnapshot(`
    [
      "/uv add --directory /path dependency-name",
      "/uv sync --directory /path --inexact --all-extras",
    ]
  `);
  expect(logger.collectedLogs).toMatchInlineSnapshot(`[]`);
});

test("Add without input", async () => {
  const inputRequester = new FakeInputRequester([]);
  const subcommandExecutor = new FakeSubcommandExecutor();
  const logger = new FakeLogger();
  const command = new AddDependencyCommand(
    inputRequester,
    subcommandExecutor,
    "/path",
    "/uv"
  );

  await expect(command.run()).rejects.toThrowError(
    "No input provided for the dependency."
  );
  expect(logger.collectedLogs).toMatchInlineSnapshot(`[]`);
});

test("Add with active script file", async () => {
  const inputRequester = new FakeInputRequester(["hishel"]);
  const subcommandExecutor = new FakeSubcommandExecutor();

  await withTempDir(async (dir) => {
    const pythonInline = `
# /// script
# dependencies = []
# ///
`;
    writeFileSync(join(dir, "script.py"), pythonInline);
    const command = new AddDependencyCommand(
      inputRequester,
      subcommandExecutor,
      "/path",
      "/uv",
      join(dir, "script.py")
    );

    await command.run();

    expect(
      subcommandExecutor.inputs[0]?.replace(
        RegExp(`\\s*--script\\s+(?!-)\\S+`, "g"),
        ""
      )
    ).toMatchInlineSnapshot(`"/uv add --directory /path hishel"`);
    expect(
      subcommandExecutor.inputs[1]?.replace(
        RegExp(`\\s*--script\\s+(?!-)\\S+`, "g"),
        ""
      )
    ).toMatchInlineSnapshot(`"/uv sync --directory /path --inexact"`);
  });
});
