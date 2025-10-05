export default interface TerminalSender {
  sendText(text: string, execute?: boolean): void;
}
