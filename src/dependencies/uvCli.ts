export type UvCommand = "add" | "remove" | "sync" | "init" | "lock" | "venv";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default interface UvCli<T extends UvCommand> {
  run(): Promise<void>;
}
