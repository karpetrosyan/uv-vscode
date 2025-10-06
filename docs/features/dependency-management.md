## Quickstart

When working on a Python project, we often modify the dependency list by adding, removing, or updating packages,
which usually requires temporarily switching to a terminal to run the appropriate commands.

```bash
uv add requests
```

If you want to add a dependency for a specific Python script, you also need to include the --script option, like this:

```bash
uv add --script script.py requests
```

The extension adds small buttons directly above the dependencies section in a file, allowing you to add, remove, or update dependencies without switching to a terminal.

![manage-deps-lenses](/manage-deps-lenses.png){.light-only}
![manage-deps-lenses](/manage-deps-lenses-dark.png){.dark-only}

These same buttons also work for Python scripts with inline metadata, so you don’t need to use the terminal with the `--script` flag.

## Add, Remove, and Update

When you press the `add` or `remove` dependency button, the extension will ask what you want to `add` or `remove`.
The input you provide is then passed as an argument to the `uv add` or `uv remove` command.

![debug script](/input-requests.png){.light-only}
![debug script](/input-requests-dark.png){.dark-only}

The extension then executes a uv command like this:

::: code-group

```bash [pyproject.toml]
uv add requests
```

```bash [script]
uv add --script {{SCRIPT_PATH}} requests
```

:::

Note that it might be slightly more complicated due to additional options set by the extension.

### Passing extra options

You can also include extra options, which will be passed to uv as well.

For example, an input like `. --editable` would be translated to

```bash
uv add . --editable
```
