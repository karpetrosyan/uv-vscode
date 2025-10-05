import { describe, it, expect } from "vitest";
import { getOptionValue, isOptionPresent } from "../../src/utils/subprocess";

describe("getOptionValue", () => {
  describe("basic functionality", () => {
    it("should return value with --option=value syntax", () => {
      expect(getOptionValue("uv run --script=test.py", "--script")).toBe(
        "test.py",
      );
    });

    it("should return value with --option value syntax", () => {
      expect(getOptionValue("uv run --script test.py", "--script")).toBe(
        "test.py",
      );
    });

    it("should return undefined when option is not present", () => {
      expect(getOptionValue("uv run arg1 arg2", "--script")).toBeUndefined();
    });
  });

  describe("quoted values", () => {
    it('should handle double quotes with --option="value"', () => {
      expect(getOptionValue('uv run --script="test file.py"', "--script")).toBe(
        "test file.py",
      );
    });

    it("should handle single quotes with --option='value'", () => {
      expect(getOptionValue("uv run --script='test file.py'", "--script")).toBe(
        "test file.py",
      );
    });

    it('should handle double quotes with --option "value"', () => {
      expect(getOptionValue('uv run --script "test file.py"', "--script")).toBe(
        "test file.py",
      );
    });

    it("should handle single quotes with --option 'value'", () => {
      expect(getOptionValue("uv run --script 'test file.py'", "--script")).toBe(
        "test file.py",
      );
    });

    it("should handle empty quoted values", () => {
      expect(getOptionValue('uv run --script=""', "--script")).toBe("");
      expect(getOptionValue("uv run --script=''", "--script")).toBe("");
    });
  });

  describe("complex values", () => {
    it("should handle values with special characters", () => {
      expect(getOptionValue("uv run --script=test_file-2.py", "--script")).toBe(
        "test_file-2.py",
      );
    });

    it("should handle paths", () => {
      expect(
        getOptionValue("uv run --script=/path/to/file.py", "--script"),
      ).toBe("/path/to/file.py");
    });

    it("should handle URLs", () => {
      expect(getOptionValue("uv run --url=https://example.com", "--url")).toBe(
        "https://example.com",
      );
    });

    it("should handle values with dots and underscores", () => {
      expect(getOptionValue("uv run --file=my_script.test.py", "--file")).toBe(
        "my_script.test.py",
      );
    });
  });

  describe("multiple options", () => {
    it("should extract correct option when multiple options present", () => {
      expect(
        getOptionValue(
          "uv run --script test.py --verbose --output out.txt",
          "--script",
        ),
      ).toBe("test.py");
      expect(
        getOptionValue(
          "uv run --script test.py --verbose --output out.txt",
          "--output",
        ),
      ).toBe("out.txt");
    });

    it("should not confuse similar option names", () => {
      expect(
        getOptionValue(
          "uv run --script-file test.py --script main.py",
          "--script",
        ),
      ).toBe("main.py");
    });
  });

  describe("edge cases", () => {
    it("should return undefined for option without value", () => {
      expect(getOptionValue("uv run --script", "--script")).toBeUndefined();
    });

    it("should not match next option as value", () => {
      expect(
        getOptionValue("uv run --script --verbose", "--script"),
      ).toBeUndefined();
    });

    it("should handle option at end of string", () => {
      expect(getOptionValue("uv run arg1 --script=test.py", "--script")).toBe(
        "test.py",
      );
    });

    it("should handle option at beginning of string", () => {
      expect(getOptionValue("--script=test.py arg1", "--script")).toBe(
        "test.py",
      );
    });

    it("should handle empty input", () => {
      expect(getOptionValue("", "--script")).toBeUndefined();
    });

    it("should handle input with only spaces", () => {
      expect(getOptionValue("   ", "--script")).toBeUndefined();
    });

    it("should be case-sensitive for option names", () => {
      expect(
        getOptionValue("uv run --Script test.py", "--script"),
      ).toBeUndefined();
    });
  });

  describe("short options", () => {
    it("should handle short options with = syntax", () => {
      expect(getOptionValue("uv run -s=test.py", "-s")).toBe("test.py");
    });

    it("should handle short options with space syntax", () => {
      expect(getOptionValue("uv run -s test.py", "-s")).toBe("test.py");
    });

    it("should handle short options with quotes", () => {
      expect(getOptionValue('uv run -s "test file.py"', "-s")).toBe(
        "test file.py",
      );
    });
  });
});

describe("isOptionPresent", () => {
  describe("basic functionality", () => {
    it("should return true when option is present with value", () => {
      expect(isOptionPresent("uv run --script test.py", "--script")).toBe(true);
    });

    it("should return true when option is present with = syntax", () => {
      expect(isOptionPresent("uv run --script=test.py", "--script")).toBe(true);
    });

    it("should return false when option is not present", () => {
      expect(isOptionPresent("uv run arg1 arg2", "--script")).toBe(false);
    });

    it("should return true when option is present as flag (no value)", () => {
      expect(isOptionPresent("uv run --verbose arg1", "--verbose")).toBe(true);
    });
  });

  describe("quoted values", () => {
    it("should detect option with double quoted value", () => {
      expect(
        isOptionPresent('uv run --script="test file.py"', "--script"),
      ).toBe(true);
    });

    it("should detect option with single quoted value", () => {
      expect(
        isOptionPresent("uv run --script='test file.py'", "--script"),
      ).toBe(true);
    });

    it("should detect option with quoted value and space", () => {
      expect(
        isOptionPresent('uv run --script "test file.py"', "--script"),
      ).toBe(true);
    });
  });

  describe("position in string", () => {
    it("should detect option at start of string", () => {
      expect(isOptionPresent("--script test.py arg1", "--script")).toBe(true);
    });

    it("should detect option in middle of string", () => {
      expect(isOptionPresent("uv run --script test.py arg1", "--script")).toBe(
        true,
      );
    });

    it("should detect option at end of string", () => {
      expect(isOptionPresent("uv run arg1 --script", "--script")).toBe(true);
    });

    it("should detect option at end with value", () => {
      expect(isOptionPresent("uv run arg1 --script=test.py", "--script")).toBe(
        true,
      );
    });
  });

  describe("multiple options", () => {
    it("should detect option among multiple options", () => {
      expect(
        isOptionPresent(
          "uv run --verbose --script test.py --output out.txt",
          "--script",
        ),
      ).toBe(true);
      expect(
        isOptionPresent(
          "uv run --verbose --script test.py --output out.txt",
          "--verbose",
        ),
      ).toBe(true);
      expect(
        isOptionPresent(
          "uv run --verbose --script test.py --output out.txt",
          "--output",
        ),
      ).toBe(true);
    });

    it("should not detect absent option among multiple options", () => {
      expect(
        isOptionPresent("uv run --verbose --output out.txt", "--script"),
      ).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should return false for empty input", () => {
      expect(isOptionPresent("", "--script")).toBe(false);
    });

    it("should return false for input with only spaces", () => {
      expect(isOptionPresent("   ", "--script")).toBe(false);
    });

    it("should be case-sensitive", () => {
      expect(isOptionPresent("uv run --Script test.py", "--script")).toBe(
        false,
      );
    });

    it("should not match partial option names", () => {
      expect(isOptionPresent("uv run --script-file test.py", "--script")).toBe(
        false,
      );
    });

    it("should handle option that looks like value", () => {
      expect(isOptionPresent("uv run arg1 --script", "--script")).toBe(true);
    });
  });

  describe("short options", () => {
    it("should detect short options", () => {
      expect(isOptionPresent("uv run -s test.py", "-s")).toBe(true);
    });

    it("should detect short options with = syntax", () => {
      expect(isOptionPresent("uv run -s=test.py", "-s")).toBe(true);
    });

    it("should detect short options as flags", () => {
      expect(isOptionPresent("uv run -v", "-v")).toBe(true);
    });
  });

  describe("special characters in values", () => {
    it("should detect options with complex values", () => {
      expect(isOptionPresent("uv run --url=https://example.com", "--url")).toBe(
        true,
      );
    });

    it("should detect options with paths", () => {
      expect(isOptionPresent("uv run --file=/path/to/file.py", "--file")).toBe(
        true,
      );
    });
  });
});

describe("getOptionValue and isOptionPresent integration", () => {
  it("should be consistent - if present, should extract value", () => {
    const input = "uv run --script test.py";
    expect(isOptionPresent(input, "--script")).toBe(true);
    expect(getOptionValue(input, "--script")).toBe("test.py");
  });

  it("should be consistent - if not present, both return false/undefined", () => {
    const input = "uv run arg1 arg2";
    expect(isOptionPresent(input, "--script")).toBe(false);
    expect(getOptionValue(input, "--script")).toBeUndefined();
  });

  it("should handle flags consistently", () => {
    const input = "uv run --verbose";
    expect(isOptionPresent(input, "--verbose")).toBe(true);
    expect(getOptionValue(input, "--verbose")).toBeUndefined();
  });

  it("should handle multiple options consistently", () => {
    const input = "uv run --script test.py --output out.txt --verbose";

    expect(isOptionPresent(input, "--script")).toBe(true);
    expect(getOptionValue(input, "--script")).toBe("test.py");

    expect(isOptionPresent(input, "--output")).toBe(true);
    expect(getOptionValue(input, "--output")).toBe("out.txt");

    expect(isOptionPresent(input, "--verbose")).toBe(true);
    expect(getOptionValue(input, "--verbose")).toBeUndefined();

    expect(isOptionPresent(input, "--missing")).toBe(false);
    expect(getOptionValue(input, "--missing")).toBeUndefined();
  });
});
