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
