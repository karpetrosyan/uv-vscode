export default interface SubcommandExecutor {
  execute(command: string, args: string[], isScript: boolean): Promise<string>;
}
