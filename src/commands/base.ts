export default abstract class Command<T = void> {
  public abstract run(): Promise<T>;
}
