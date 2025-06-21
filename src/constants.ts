import path from "path";

export const EXTENSION_ROOT_DIR = path.dirname(__dirname);

export const UV_BINARY_NAME = process.platform === "win32" ? "uv.exe" : "uv";

export const BUNDLED_PYTHON_SCRIPTS_DIR = path.join(EXTENSION_ROOT_DIR, "bundled");

export const BUNDLED_UV_EXECUTABLE = path.join(
  BUNDLED_PYTHON_SCRIPTS_DIR,
  "libs",
  "bin",
  UV_BINARY_NAME,
);