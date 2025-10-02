# uv-vscode

A VS Code extension that provides enhanced integration with [uv](https://github.com/astral-sh/uv), the fast Python package installer and resolver. This extension makes it easier to manage Python dependencies and work with inline script metadata (PEP 723) directly in VS Code.

## Documentation

Go through the [documentation](https://karpetrosyan.github.io/uv-vscode/) to get started.

## Highlights

### Automatically enters the script environment when the active editor is a script

When you change your active text editor in `VS Code` to a file that is `PEP 723` compatible script, you will get a full LSP support, autocomplections, because the extension will automatically create, enter to the python environment, installing all the dependencies defined in a file

![Automatically enters the script environment when the active editor is a script](https://raw.githubusercontent.com/karpetrosyan/uv-vscode/main/docs/public/change-environments.gif#gh-light-mode-only)
![Automatically enters the script environment when the active editor is a script](https://raw.githubusercontent.com/karpetrosyan/uv-vscode/main/docs/public/change-environments-dark.gif#gh-dark-mode-only)

### Run & debug your scripts just like normal Python files, but without worrying about dependencies

Buttons like Run and Debug will also handle the inline metadata of the script, installing missing dependencies if needed

![Run & debug your scripts just like normal Python files, but without worrying about dependencies](https://raw.githubusercontent.com/karpetrosyan/uv-vscode/main/docs/public/run-script.gif#gh-light-mode-only)
![Run & debug your scripts just like normal Python files, but without worrying about dependencies](https://raw.githubusercontent.com/karpetrosyan/uv-vscode/main/docs/public/run-script-dark.gif#gh-dark-mode-only)

### Manage dependencies directly in VS Code

UI elements added to `pyproject.toml` and any `PEP 723` compatible script files for managing dependencies without switching to a terminal.

![Manage dependencies directly in VS Code](https://raw.githubusercontent.com/karpetrosyan/uv-vscode/main/docs/public/manage-deps-lenses.png#gh-light-mode-only)
![Manage dependencies directly in VS Code](https://raw.githubusercontent.com/karpetrosyan/uv-vscode/main/docs/public/manage-deps-lenses-dark.png#gh-dark-mode-only)