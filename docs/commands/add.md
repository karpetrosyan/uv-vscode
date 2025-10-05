# uv-vscode.add 

Adds a dependency either to the project or to a [PEP 723](https://peps.python.org/pep-0723/)–compatible script. If the active editor is focused on such a script, the dependency is added there; otherwise, it is added to the project at the workspace root.

Under the hood, this simply runs the [uv add](https://docs.astral.sh/uv/reference/cli/#uv-add) command.