import { createReadStream } from "fs";
import { createInterface } from "readline";
import { assertNever } from "./typing";

export interface ParseSettings {
  // Indicates if the file is PEP 723 compatible file
  inlineMetadataFromScript: boolean;
}

export type ParserEvent = IdleEvent | ProcessingEvent;
export type State = IdleState | ProcessingState | ParsedState | ErrorState;

export type makeState<Type extends string, Props> = Props & {
  type: Type;
  settings: ParseSettings;
};

export interface CodeLine {
  lineNumber: number;
  text: string;
}

export interface IdleEvent {
  line: CodeLine;
}

export interface ProcessingEvent {
  line: CodeLine;
}

export type IdleState = makeState<
  "idle",
  { feedEvent: (state: IdleState, event: IdleEvent) => IdleStateNext }
>;
export type IdleStateNext = ProcessingState | ProcessingNextState;
export const IdleState = (settings: ParseSettings): IdleState => ({
  type: "idle",
  feedEvent: (state: IdleState, event: IdleEvent) => {
    const processingState = ProcessingState(settings);
    const nextState = processingState.feedEvent(
      processingState,
      event as ProcessingEvent,
    ) as ProcessingState;
    return nextState;
  },
  settings,
});

export type ProcessingNextState = ParsedState | ProcessingState | ErrorState;
export type ProcessingState = makeState<
  "processing",
  {
    type: "processing";
    processedLines: CodeLine[];
    dependenciesLine?: number; // line number where dependencies are defined

    // pyproject.toml specific properties
    projectScopeFound: boolean;

    // inline metadata specific properties
    inlineMetadataStartLine?: number;

    feedEvent: (
      state: ProcessingState,
      event: ProcessingEvent,
    ) => ProcessingNextState;
  }
>;
const ProcessingState = (settings: ParseSettings): ProcessingState => ({
  type: "processing",
  feedEvent: (state: ProcessingState, event: ProcessingEvent) => {
    if (state.settings.inlineMetadataFromScript) {
      return processLineForInlineMetadataFromScript(state, event);
    }
    return processLineForToml(state, event);
  },
  settings,
  projectScopeFound: false,
  processedLines: [],
});

export type ParsedState = makeState<
  "parsed",
  {
    type: "parsed";
    processedLines: CodeLine[];
    projectScopeFound: boolean;
    dependenciesLine?: number;
  }
>;
const ParsedState = (
  settings: ParseSettings,
  processedState: ProcessingState,
): ParsedState => ({
  type: "parsed",
  settings,
  processedLines: processedState.processedLines,
  projectScopeFound: processedState.projectScopeFound,
  dependenciesLine: processedState.dependenciesLine,
});

export type ErrorState = makeState<
  "error",
  {
    type: "error";
    message: string;
  }
>;
export const ErrorState = (
  settings: ParseSettings,
  message: string,
): ErrorState => ({
  type: "error",
  settings,
  message,
});

const processLineForInlineMetadataFromScript = (
  state: ProcessingState,
  event: ProcessingEvent,
): ProcessingNextState => {
  const { line } = event;

  if (state.inlineMetadataStartLine === undefined) {
    if (line.text.trim().startsWith("# /// script")) {
      state.inlineMetadataStartLine = line.lineNumber;
    }
    return state;
  }

  if (line.text.startsWith("# ///") && line.text.length === 5) {
    return ParsedState(state.settings, state);
  }

  let content = line.text.slice();

  if (!content.startsWith("#")) {
    return ErrorState(
      state.settings,
      "Inline metadata line must start with '#'.",
    );
  }

  if (content.length === 2 && content[1] !== " ") {
    return ErrorState(
      state.settings,
      "Inline metadata line must start with '# '.",
    );
  }

  content = content.slice(2).trim();

  state.processedLines.push({
    lineNumber: line.lineNumber,
    text: content,
  });

  // Unlike TOML, we won't change the state to success until we find the end of the inline metadata
  if (content.startsWith("dependencies = [")) {
    state.dependenciesLine = line.lineNumber;
  }

  return state;
};

const processLineForToml = (
  state: ProcessingState,
  event: ProcessingEvent,
): ProcessingNextState => {
  const { line } = event;
  state.processedLines.push(line);

  // If the project scope is not found yet, we check if the line contains the project scope
  if (!state.projectScopeFound) {
    if (line.text.trim().startsWith("[project]")) {
      state.projectScopeFound = true;
    }
    return state;
  }

  if (line.text.trim().startsWith("dependencies = [")) {
    state.dependenciesLine = line.lineNumber;
    return ParsedState(state.settings, state);
  }

  return state;
};

export async function isScriptPath(filePath: string): Promise<boolean> {
  if (filePath.endsWith(".toml")) {
    return false;
  }

  const fileStream = createReadStream(filePath, { encoding: "utf8" });

  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let state = IdleState({
    inlineMetadataFromScript: !filePath.endsWith(".toml"),
  }) as State;

  let index = 0;
  for await (const line of rl) {
    switch (state.type) {
      case "idle":
        state = state.feedEvent(state, {
          line: {
            lineNumber: index,
            text: line,
          },
        });
        break;

      case "processing":
        state = state.feedEvent(state, {
          line: {
            lineNumber: index,
            text: line,
          },
        });
        break;

      case "parsed":
        return true;

      case "error":
        console.error(`Error processing file ${filePath}: ${state.message}`);
        return false;
      default:
        assertNever(state);
    }
    index++;
  }
  return state.type === "parsed";
}
