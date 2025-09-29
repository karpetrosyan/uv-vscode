## Add/Remove

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
