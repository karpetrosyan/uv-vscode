# uv-vscode.add 

Adds a dependency either to the project or to a [PEP 723](https://peps.python.org/pep-0723/)–compatible script. If the active editor is focused on such a script, the dependency is added there; otherwise, it is added to the project at the workspace root.

<code style="color: #569CD6;">default options</code>: <code style="color: #4EC9B0;">--directory</code>, <code style="color: #4EC9B0;">--script</code><br>
<code style="color: #FF5555;">throws</code>: <code style="color: #FFB86C;">when input is missing</code>

Under the hood, this simply runs the [uv add](https://docs.astral.sh/uv/reference/cli/#uv-add) command.