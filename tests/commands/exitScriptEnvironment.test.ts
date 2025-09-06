import { expect, test } from "vitest";
import ExitScriptEnvironment from "../../src/commands/exitScriptEnvironment";
import { FakeInterpreterManager } from "../fixtures";

test("Test ExitScriptEnvironmentCommand basic", async () => {
  const interpreterManager = new FakeInterpreterManager();

  await interpreterManager.select("some/path");

  const command = new ExitScriptEnvironment(interpreterManager);

  await command.run();

  expect(interpreterManager.previousInterpreterPath).toMatchInlineSnapshot(`undefined`);
  expect(interpreterManager.currentInterpreterPath).toMatchInlineSnapshot(`"some/path"`);
});
