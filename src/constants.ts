import path from "path";
import os from "os";

export const EXTENSION_ROOT_DIR = path.dirname(__dirname);

export const UV_BINARY_NAME = process.platform === "win32" ? "uv.exe" : "uv";

export const BUNDLED_PYTHON_SCRIPTS_DIR = path.join(
  EXTENSION_ROOT_DIR,
  "bundled",
);

export const BUNDLED_UV_EXECUTABLE = path.join(
  BUNDLED_PYTHON_SCRIPTS_DIR,
  "libs",
  "bin",
  UV_BINARY_NAME,
);

export const SCRIPTS_ENV_DIR =
  process.platform === "win32"
    ? path.join(
        os.homedir(),
        "AppData",
        "Local",
        "uv",
        "cache",
        "environments-v2",
      )
    : path.join(os.homedir(), ".cache", "uv", "environments-v2");
