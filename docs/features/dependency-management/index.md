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
