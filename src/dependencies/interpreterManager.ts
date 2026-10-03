export default interface InterpreterManager {
  select(interpreterPath: string): Promise<void>;
}
