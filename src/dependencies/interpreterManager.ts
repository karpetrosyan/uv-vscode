export default interface InterpreterManager {
  select(interpreterPath: string): Promise<void>;
  previous(): Promise<string | undefined>;
}
