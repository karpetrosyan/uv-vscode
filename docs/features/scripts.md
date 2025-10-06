## Quickstart

A script is typically a **lightweight program** that solves a **simple task** and is **portable**.

When writing a Python script, you often need a place to include meta-information, such as package dependencies and the required Python version.

[PEP 723](https://peps.python.org/pep-0723/) addresses this problem by introducing a way to write inline metadata directly into the script. Simply put, it’s just a comment with special syntax where you can define TOML-like configuration, similar to how you would in a `pyproject.toml` file.

A simple script that uses requests to send an HTTP request may look like this:

```python
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "requests",
# ]
# ///

import requests

response = requests.get("https://github.com/karpetrosyan/uv-vscode")
print(response.status_code)
```

Okay, it looks like a script: it's **lightweight**, solves a **simple task**, and is **portable**.

And it's... it's so **portable**. You can just copy this code and send it to your friend using your favorite messenger (mine is Telegram), and that's it. Now your friend has everything needed to run this script without a _missing dependency_ error or _Python version incompatibility_.

But it's just a **PEP** standard that defines how it should look. To actually run the script, there must be a tool that understands it, right? And that tool is our already lovely [uv](https://docs.astral.sh/uv/).

Assuming our script above is put in a file named `script.py`, we can now run it as follows:

```bash
>>> uv run script.py
200
```

## Environment Auto-Switching

As [VS Code states](https://code.visualstudio.com/docs/python/environments): an "environment" in Python is the context in which a Python program runs, consisting of an interpreter and any number of installed packages.

When working on a project in VS Code, you need to configure the virtual environment to point to the interpreter that has access to the dependencies your project needs, so the IDE can provide suggestions and autocompletion.

When using the extension, it will automatically switch the environment to a script's environment when you open a file that contains inline metadata. This ensures that you get autocompletion and all the necessary features when working with a Python script.

![run script](/change-environments.gif){.light-only}
![run script](/change-environments-dark.gif){.dark-only}

The extension will remember the last environment you used for a script, and when switching to a non-script file, it will switch back to that environment so you can continue working on your main project.

This simplifies working with script files alongside your main project: just open the script file, work with it, and then close it to get your main project environment back.

## Run

If you’ve ever used VS Code to write Python code, you might have noticed that when using the Python extension, there’s a handy button you can press to run an individual Python file in a terminal.

Pressing that button simply makes the Python extension call the python command using the Python binary configured for your current active environment, passing the file as the first argument like so:

```bash
python /path/to/your/program/script.py
```

Here, python should be replaced with the path to the Python binary configured for your project in VS Code, which often looks like this:

```bash
/path/to/your/program/.venv/bin/python
```

But it just runs the file as a normal Python script, without respecting inline metadata like the script’s dependencies, etc. When `uv-vscode` is enabled, it recognizes that the current file is PEP 723-compatible and handles everything for you—just press the run button and wait for the magic!

![run script](/run-script.gif){.light-only}
![run script](/run-script-dark.gif){.dark-only}

## Debug

There is also a debug option you can set by clicking the little dropdown menu next to the run button. It works similarly to regular debugging, but the extension ensures that the correct interpreter is used for debugging the script.

![debug script](/debug-script.gif){.light-only}
![debug script](/debug-script-dark.gif){.dark-only}
