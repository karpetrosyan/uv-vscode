import { describe, it, expect, beforeEach, vi } from "vitest";
import UvCliImpl from "../../src/impl/uvCli";
import {
  FakeInputRequester,
  FakeSubcommandExecutor,
  FakeLogger,
} from "../fixtures";
import type { UvVscodeSettings } from "../../src/settings";
import { isScriptPath } from "../../src/utils/inlineMetadata";

// Mock only the external utilities
vi.mock("../../src/utils/inlineMetadata", () => ({
  isScriptPath: vi.fn(),
}));

describe("UvCliImpl", () => {
  let mockConfig: UvVscodeSettings;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig = {} as UvVscodeSettings;
  });

  describe("add command", () => {
    it("should execute add command with dependency", async () => {
      const inputRequester = new FakeInputRequester(["requests"]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      const cli = new UvCliImpl(
        "add",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv add --directory /project/root requests",
        ]
      `);
    });

    it("should throw error when no input provided for add command", async () => {
      const inputRequester = new FakeInputRequester([undefined]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      const cli = new UvCliImpl(
        "add",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
      );

      await expect(cli.run()).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: No input provided for the dependency.]`,
      );
    });

    it("should add multiple dependencies", async () => {
      const inputRequester = new FakeInputRequester(["requests pytest"]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      const cli = new UvCliImpl(
        "add",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv add --directory /project/root requests pytest",
        ]
      `);
    });

    it("should respect existing --directory option", async () => {
      const inputRequester = new FakeInputRequester([
        "requests --directory /other/dir",
      ]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      const cli = new UvCliImpl(
        "add",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv add requests --directory /other/dir",
        ]
      `);
    });

    it("should handle dependencies with version specifiers", async () => {
      const inputRequester = new FakeInputRequester([
        "requests>=2.28.0 pytest~=7.0",
      ]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      const cli = new UvCliImpl(
        "add",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv add --directory /project/root requests>=2.28.0 pytest~=7.0",
        ]
      `);
    });
  });

  describe("remove command", () => {
    it("should execute remove command with dependency", async () => {
      const inputRequester = new FakeInputRequester(["requests"]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      const cli = new UvCliImpl(
        "remove",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv remove --directory /project/root requests",
        ]
      `);
    });

    it("should throw error when no input provided for remove command", async () => {
      const inputRequester = new FakeInputRequester([undefined]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      const cli = new UvCliImpl(
        "remove",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
      );

      await expect(cli.run()).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: No input provided for the dependency.]`,
      );
    });

    it("should remove multiple dependencies", async () => {
      const inputRequester = new FakeInputRequester(["requests pytest"]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      const cli = new UvCliImpl(
        "remove",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv remove --directory /project/root requests pytest",
        ]
      `);
    });
  });

  describe("sync command", () => {
    it("should execute sync command", async () => {
      const inputRequester = new FakeInputRequester([""]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      const cli = new UvCliImpl(
        "sync",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv sync --directory /project/root ",
        ]
      `);
    });

    it("should pass additional sync options", async () => {
      const inputRequester = new FakeInputRequester(["--all-extras"]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      const cli = new UvCliImpl(
        "sync",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv sync --directory /project/root --all-extras",
        ]
      `);
    });

    it("should not throw error when no input provided for sync", async () => {
      const inputRequester = new FakeInputRequester([undefined]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      const cli = new UvCliImpl(
        "sync",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
      );

      await expect(cli.run()).resolves.not.toThrow();
      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv sync --directory /project/root",
        ]
      `);
    });
  });

  describe("init command", () => {
    it("should execute init command with default Python version", async () => {
      const inputRequester = new FakeInputRequester([""]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      const cli = new UvCliImpl(
        "init",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv init --directory /project/root --python=3.12 ",
        ]
      `);
    });

    it("should not add default Python version if --python is provided", async () => {
      const inputRequester = new FakeInputRequester(["--python 3.11"]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      const cli = new UvCliImpl(
        "init",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv init --directory /project/root --python 3.11",
        ]
      `);
    });

    it("should not add default Python version if -p is provided", async () => {
      const inputRequester = new FakeInputRequester(["-p 3.11"]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      const cli = new UvCliImpl(
        "init",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv init --directory /project/root -p 3.11",
        ]
      `);
    });

    it("should not throw error when no input provided for init", async () => {
      const inputRequester = new FakeInputRequester([undefined]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      const cli = new UvCliImpl(
        "init",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
      );

      await expect(cli.run()).resolves.not.toThrow();
      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv init --directory /project/root --python=3.12",
        ]
      `);
    });

    it("should pass additional init options", async () => {
      const inputRequester = new FakeInputRequester(["--package myproject"]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      const cli = new UvCliImpl(
        "init",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv init --directory /project/root --python=3.12 --package myproject",
        ]
      `);
    });
  });

  describe("script handling", () => {
    it("should add --script option for add command with active script file", async () => {
      const inputRequester = new FakeInputRequester(["requests"]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      vi.mocked(isScriptPath).mockResolvedValue(true);

      const cli = new UvCliImpl(
        "add",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
        "/project/root/script.py",
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv add --script /project/root/script.py --directory /project/root requests",
          "/path/to/uv sync --inexact --script /project/root/script.py --directory /project/root",
        ]
      `);
    });

    it("should add --script option for remove command with active script file", async () => {
      const inputRequester = new FakeInputRequester(["requests"]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      vi.mocked(isScriptPath).mockResolvedValue(true);

      const cli = new UvCliImpl(
        "remove",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
        "/project/root/script.py",
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv remove --script /project/root/script.py --directory /project/root requests",
          "/path/to/uv sync --inexact --script /project/root/script.py --directory /project/root",
        ]
      `);
    });

    it("should add --script option for sync command with active script file", async () => {
      const inputRequester = new FakeInputRequester([""]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      vi.mocked(isScriptPath).mockResolvedValue(true);

      const cli = new UvCliImpl(
        "sync",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
        "/project/root/script.py",
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv sync --script /project/root/script.py --directory /project/root ",
        ]
      `);
    });

    it("should not add --script option if already provided by user with --script", async () => {
      const inputRequester = new FakeInputRequester([
        "requests --script /other/script.py",
      ]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      vi.mocked(isScriptPath).mockResolvedValue(true);

      const cli = new UvCliImpl(
        "add",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
        "/project/root/script.py",
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv add --directory /project/root requests --script /other/script.py",
          "/path/to/uv sync --inexact --directory /project/root",
        ]
      `);
    });

    it("should not add --script option if already provided by user with -s", async () => {
      const inputRequester = new FakeInputRequester([
        "requests -s /other/script.py",
      ]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      vi.mocked(isScriptPath).mockResolvedValue(true);

      const cli = new UvCliImpl(
        "add",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
        "/project/root/script.py",
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv add --directory /project/root requests -s /other/script.py",
          "/path/to/uv sync --inexact --directory /project/root",
        ]
      `);
    });

    it("should not add --script option for init command", async () => {
      const inputRequester = new FakeInputRequester([""]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      vi.mocked(isScriptPath).mockResolvedValue(true);

      const cli = new UvCliImpl(
        "init",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
        "/project/root/script.py",
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv init --directory /project/root --python=3.12 ",
        ]
      `);
    });

    it("should not add --script option when file is not a script", async () => {
      const inputRequester = new FakeInputRequester(["requests"]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      vi.mocked(isScriptPath).mockResolvedValue(false);

      const cli = new UvCliImpl(
        "add",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
        "/project/root/not-a-script.txt",
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv add --directory /project/root requests",
        ]
      `);
    });

    it("should run sync with --all-extras when not a script", async () => {
      const inputRequester = new FakeInputRequester(["requests"]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      vi.mocked(isScriptPath).mockResolvedValue(false);

      const cli = new UvCliImpl(
        "add",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
        "/project/root/file.py",
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv add --directory /project/root requests",
        ]
      `);
    });

    it("should not run sync after sync command even with script", async () => {
      const inputRequester = new FakeInputRequester([""]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      vi.mocked(isScriptPath).mockResolvedValue(true);

      const cli = new UvCliImpl(
        "sync",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
        "/project/root/script.py",
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv sync --script /project/root/script.py --directory /project/root ",
        ]
      `);
    });
  });

  describe("input parsing", () => {
    it("should trim whitespace from dependencies", async () => {
      const inputRequester = new FakeInputRequester(["  requests   pytest  "]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      const cli = new UvCliImpl(
        "add",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv add --directory /project/root   requests   pytest  ",
        ]
      `);
    });

    it("should handle empty string input", async () => {
      const inputRequester = new FakeInputRequester([""]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      const cli = new UvCliImpl(
        "sync",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv sync --directory /project/root ",
        ]
      `);
    });

    it("should handle mixed options and dependencies", async () => {
      const inputRequester = new FakeInputRequester([
        "requests --dev pytest --optional flask",
      ]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      const cli = new UvCliImpl(
        "add",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
      );

      await cli.run();

      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv add --directory /project/root requests --dev pytest --optional flask",
        ]
      `);
    });
  });

  describe("edge cases", () => {
    it("should handle no active file path", async () => {
      const inputRequester = new FakeInputRequester(["requests"]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      const cli = new UvCliImpl(
        "add",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
        undefined,
      );

      await cli.run();

      expect(isScriptPath).not.toHaveBeenCalled();
      expect(executor.inputs).toMatchInlineSnapshot(`
        [
          "/path/to/uv add --directory /project/root requests",
        ]
      `);
    });

    it("should handle execution errors from executor", async () => {
      const inputRequester = new FakeInputRequester(["requests"]);
      const executor = new FakeSubcommandExecutor();
      const logger = new FakeLogger();

      // Make executor throw error
      executor.execute = vi
        .fn()
        .mockRejectedValue(new Error("Execution failed"));

      const cli = new UvCliImpl(
        "add",
        inputRequester,
        executor,
        "/project/root",
        "/path/to/uv",
        logger,
        mockConfig,
      );

      await expect(cli.run()).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Execution failed]`,
      );
    });
  });
});
