## Quickstart

The extension maps `VS Code` commands to [uv commands](https://docs.astral.sh/uv/reference/cli/), allowing you to access them through the [Command Palette.](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette)

![run script](/command-palette.png){.light-only}
![run script](/command-palette-dark.png){.dark-only}

Some commands require input; you can provide arguments and options that will be passed to `uv`.

For example, if you provide an input like `--package myproject` to the init command, the executed `uv` command would look like this:

```bash
/path/to/uv init --directory /project/root --python=3.12 --package myproject
```

As you can see, the extension may add some options automatically, but you can always override them by providing the same option with a different value.

See the detailed list of commands, along with their descriptions and default behavior, [here](../commands/add.md).

## Scripts Supports

For some commands that support the `--script option`, the extension will automatically add it if the currently active editor is a [PEP 723](https://peps.python.org/pep-0723/)–compatible script.

This improves the user experience by allowing a single command—for example, adding a dependency—to work contextually: if a script is open, the dependency is added to it; otherwise, it’s added to the project dependencies.

> [!NOTE]
> You can override it just like any other option set by the extension.
