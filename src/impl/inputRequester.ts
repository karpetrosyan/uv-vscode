import type InputRequester from "../dependencies/inputRequester";

import { window } from "vscode";

export default class VscodeApiInputRequest implements InputRequester {
  askForInput(): Promise<string | undefined> {
    return new Promise((resolve) => {
      const inputBox = window.createInputBox();
      inputBox.prompt = "Please enter your input";
      inputBox.onDidAccept(() => {
        resolve(inputBox.value);
        inputBox.dispose();
      });
      inputBox.onDidHide(() => {
        resolve(undefined);
        inputBox.dispose();
      });
      inputBox.show();
    });
  }
}
