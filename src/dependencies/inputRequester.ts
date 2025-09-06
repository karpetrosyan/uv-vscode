export default interface InputRequester {
  askForInput(): Promise<string | undefined>;
}
