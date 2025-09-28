export default interface SubcommandExecutor {
  execute(command: string, args: string[]): Promise<string>;
}
