# uv-vscode.remove 

Removes a dependency either from the project or from a [PEP 723](https://peps.python.org/pep-0723/)–compatible script. If the active editor is focused on such a script, the dependency is removed from there; otherwise, it is removed from the project at the workspace root.

Under the hood, this simply runs the [uv remove](https://docs.astral.sh/uv/reference/cli/#uv-remove) command.