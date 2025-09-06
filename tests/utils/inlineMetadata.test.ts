import { test, expect } from "vitest";
import {
  type CodeLine,
  IdleState,
  type State,
} from "../../src/utils/inlineMetadata";
import { assertNever } from "../../src/utils/typing";

const feedEventsToState = (lines: CodeLine[], state: State) => {
  for (const line of lines) {
    switch (state.type) {
      case "idle":
        state = state.feedEvent(state, { line });
        break;

      case "processing":
        state = state.feedEvent(state, {
          line,
        });
        break;

      case "error":
        console.error(`Error processing document: ${state.message}`);
        return state;

      case "parsed": {
        return state;
      }
      default:
        assertNever(state);
    }
  }
  return state;
};

test("Processes simple pyproject.toml metadata", () => {
  const lines = [
    {
      lineNumber: 0,
      text: "[project]",
    },
    {
      lineNumber: 1,
      text: "dependencies = []",
    },
  ];

  const finalState = feedEventsToState(
    lines,
    IdleState({ inlineMetadataFromScript: false })
  );

  expect(finalState).toMatchInlineSnapshot(`
    {
      "dependenciesLine": 1,
      "processedLines": [
        {
          "lineNumber": 0,
          "text": "[project]",
        },
        {
          "lineNumber": 1,
          "text": "dependencies = []",
        },
      ],
      "projectScopeFound": true,
      "settings": {
        "inlineMetadataFromScript": false,
      },
      "type": "parsed",
    }
  `);
});

test("Processes simple inline metadata", () => {
  const lines = [
    {
      lineNumber: 0,
      text: "# /// script",
    },
    {
      lineNumber: 1,
      text: "# dependencies = []",
    },
    {
      lineNumber: 2,
      text: "# ///",
    },
  ];

  const finalState = feedEventsToState(
    lines,
    IdleState({ inlineMetadataFromScript: true })
  );

  expect(finalState).toMatchInlineSnapshot(`
    {
      "dependenciesLine": 1,
      "processedLines": [
        {
          "lineNumber": 1,
          "text": "dependencies = []",
        },
      ],
      "projectScopeFound": false,
      "settings": {
        "inlineMetadataFromScript": true,
      },
      "type": "parsed",
    }
  `);
});
test("Processes invalid format", () => {
  const st1: IdleState = IdleState({
    inlineMetadataFromScript: true,
  });

  const lines = [
    {
      lineNumber: 0,
      text: "# /// script",
    },
    {
      lineNumber: 1,
      text: "dependencies = []",
    },
  ];

  const finalState = feedEventsToState(lines, st1);

  expect(finalState).toMatchInlineSnapshot(`
    {
      "message": "Inline metadata line must start with '#'.",
      "settings": {
        "inlineMetadataFromScript": true,
      },
      "type": "error",
    }
  `);
});
