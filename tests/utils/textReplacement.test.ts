import { expect, test } from "vitest";
import { getTextReplacement } from "../../src/utils/textReplacement";

const script = (dependencies: string) => `#!/usr/bin/env python
# /// script
# dependencies = ${dependencies}
# ///

print("hello")
`;

test("getTextReplacement returns undefined for the same text", () => {
  expect(getTextReplacement(script("[]"), script("[]"))).toBeUndefined();
});

test("getTextReplacement only replaces the changed part", () => {
  const oldText = script("[]");
  const newText = script('[\n#     "requests",\n# ]');

  expect(getTextReplacement(oldText, newText)).toMatchInlineSnapshot(`
    {
      "end": {
        "character": 18,
        "line": 2,
      },
      "start": {
        "character": 18,
        "line": 2,
      },
      "text": "
    #     "requests",
    # ",
    }
  `);
});

test("getTextReplacement handles removed text", () => {
  const oldText = script('[\n#     "requests",\n# ]');
  const newText = script("[]");

  expect(getTextReplacement(oldText, newText)).toStrictEqual({
    start: { line: 2, character: 18 },
    end: { line: 4, character: 2 },
    text: "",
  });
});

test("getTextReplacement handles text added to an empty file", () => {
  expect(getTextReplacement("", "# /// script\n# ///\n")).toStrictEqual({
    start: { line: 0, character: 0 },
    end: { line: 0, character: 0 },
    text: "# /// script\n# ///\n",
  });
});
