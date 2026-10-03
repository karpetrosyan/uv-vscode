## uv.autoSelectInterpreterForScripts

<code style="color: #569CD6;">type</code>: <code style="color: #4EC9B0;">boolean</code>  
<code style="color: #569CD6;">default</code>: <code style="color: #B5CEA8;">true</code>

When enabled, the extension will automatically select the appropriate Python interpreter for PEP 723–compatible scripts, and the interpreter of the closest project (`pyproject.toml`) for other files.

## uv.sendUvCommandToTerminal

<code style="color: #569CD6;">type</code>: <code style="color: #4EC9B0;">boolean</code>  
<code style="color: #569CD6;">default</code>: <code style="color: #B5CEA8;">false</code>

When enabled, the UV command will be sent to the terminal instead of being executed directly.