export interface TextPosition {
  line: number;
  character: number;
}

export interface TextReplacement {
  start: TextPosition;
  end: TextPosition;
  text: string;
}

const positionAt = (text: string, offset: number): TextPosition => {
  const before = text.slice(0, offset);
  return {
    line: before.split("\n").length - 1,
    character: offset - (before.lastIndexOf("\n") + 1),
  };
};

/**
 * Finds the smallest replacement that turns oldText into newText,
 * or undefined if they are the same. Both texts must use \n line endings.
 */
export function getTextReplacement(
  oldText: string,
  newText: string,
): TextReplacement | undefined {
  if (oldText === newText) {
    return undefined;
  }

  let start = 0;
  while (
    start < oldText.length &&
    start < newText.length &&
    oldText[start] === newText[start]
  ) {
    start++;
  }

  let oldEnd = oldText.length;
  let newEnd = newText.length;
  while (
    oldEnd > start &&
    newEnd > start &&
    oldText[oldEnd - 1] === newText[newEnd - 1]
  ) {
    oldEnd--;
    newEnd--;
  }

  return {
    start: positionAt(oldText, start),
    end: positionAt(oldText, oldEnd),
    text: newText.slice(start, newEnd),
  };
}
