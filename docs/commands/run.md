# uv-vscode.run

Runs the script in the active editor in a terminal. A file on disk is saved first; an [untitled file](../features/scripts.md#untitled-files) doesn't need to be saved, a copy of it is run instead.

For untitled Python files, the command is also available as a run button in the editor title, next to the one from the Python extension.

<code style="color: #569CD6;">default options</code>: <code style="color: #4EC9B0;">--script</code>

Under the hood, this simply runs the [uv run](https://docs.astral.sh/uv/reference/cli/#uv-run) command.
