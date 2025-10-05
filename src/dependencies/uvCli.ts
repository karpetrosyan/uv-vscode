export type UvCommand = "add" | "remove" | "sync" | "init";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default interface UvCli<T extends UvCommand> {
  run(): Promise<void>;
}
