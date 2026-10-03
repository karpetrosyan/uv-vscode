import { expect, test } from "vitest";
import {
  FakeInterpreterManager,
  FakeSubcommandExecutor,
  withTempDir,
} from "../fixtures";
import SelectProjectInterpreterCommand from "../../src/commands/selectProjectInterpreter";
import { join } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";

test("SelectProjectInterpreter picks the closest pyproject.toml", async () => {
  const subcommandExecutor = new FakeSubcommandExecutor(["some/path\n"]);
  const interpreterManager = new FakeInterpreterManager();

  await withTempDir(async (dir) => {
    mkdirSync(join(dir, "packages", "a", "src"), { recursive: true });
    writeFileSync(join(dir, "pyproject.toml"), "");
    writeFileSync(join(dir, "packages", "a", "pyproject.toml"), "");

    const command = new SelectProjectInterpreterCommand(
      join(dir, "packages", "a", "src", "main.py"),
      dir,
      "/uv",
      interpreterManager,
      subcommandExecutor,
    );

    await expect(command.run()).resolves.toStrictEqual(true);
    expect(subcommandExecutor.inputs).toStrictEqual([
      `/uv python find --directory ${join(dir, "packages", "a")}`,
    ]);
  });

  expect(interpreterManager.currentInterpreterPath).toMatchInlineSnapshot(
    `"some/path"`,
  );
});

test("SelectProjectInterpreter falls back to the workspace root", async () => {
  const subcommandExecutor = new FakeSubcommandExecutor(["some/path"]);
  const interpreterManager = new FakeInterpreterManager();

  await withTempDir(async (dir) => {
    mkdirSync(join(dir, "src"));
    writeFileSync(join(dir, "pyproject.toml"), "");

    const command = new SelectProjectInterpreterCommand(
      join(dir, "src", "main.py"),
      dir,
      "/uv",
      interpreterManager,
      subcommandExecutor,
    );

    await expect(command.run()).resolves.toStrictEqual(true);
    expect(subcommandExecutor.inputs).toStrictEqual([
      `/uv python find --directory ${dir}`,
    ]);
  });
});

test("SelectProjectInterpreter does not look outside of the workspace", async () => {
  const subcommandExecutor = new FakeSubcommandExecutor();
  const interpreterManager = new FakeInterpreterManager("current/path");

  await withTempDir(async (dir) => {
    mkdirSync(join(dir, "workspace", "src"), { recursive: true });
    writeFileSync(join(dir, "pyproject.toml"), "");

    const command = new SelectProjectInterpreterCommand(
      join(dir, "workspace", "src", "main.py"),
      join(dir, "workspace"),
      "/uv",
      interpreterManager,
      subcommandExecutor,
    );

    await expect(command.run()).resolves.toStrictEqual(false);
  });

  expect(subcommandExecutor.inputs).toStrictEqual([]);
  expect(interpreterManager.currentInterpreterPath).toMatchInlineSnapshot(
    `"current/path"`,
  );
});

test("SelectProjectInterpreter ignores files outside of the workspace", async () => {
  const subcommandExecutor = new FakeSubcommandExecutor();
  const interpreterManager = new FakeInterpreterManager();

  await withTempDir(async (dir) => {
    mkdirSync(join(dir, "workspace"));
    mkdirSync(join(dir, "other"));
    writeFileSync(join(dir, "other", "pyproject.toml"), "");

    const command = new SelectProjectInterpreterCommand(
      join(dir, "other", "main.py"),
      join(dir, "workspace"),
      "/uv",
      interpreterManager,
      subcommandExecutor,
    );

    await expect(command.run()).resolves.toStrictEqual(false);
  });

  expect(subcommandExecutor.inputs).toStrictEqual([]);
});
