A script is typically a **lightweight program** that solves a **simple task** and is **portable**.

When writing a Python script, you often need a place to include meta-information, such as package dependencies and the required Python version.

[PEP 723](https://peps.python.org/pep-0723/) addresses this problem by introducing a way to write inline metadata directly into the script. Simply put, it’s just a comment with special syntax where you can define TOML-like configuration, similar to how you would in a `pyproject.toml` file.

A simple script that uses requests to send an HTTP request may look like this:

```python
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "requests",
# ]
# ///

import requests

response = requests.get("https://github.com/karpetrosyan/uv-vscode")
print(response.status_code)
```

Okay, it looks like a script: it's **lightweight**, solves a **simple task**, and is **portable**.

And it's... it's so **portable**. You can just copy this code and send it to your friend using your favorite messenger (mine is Telegram), and that's it. Now your friend has everything needed to run this script without a _missing dependency_ error or _Python version incompatibility_.

But it's just a **PEP** standard that defines how it should look. To actually run the script, there must be a tool that understands it, right? And that tool is our already lovely [uv](https://docs.astral.sh/uv/).

Assuming our script above is put in a file named `script.py`, we can now run it as follows:

```bash
>>> uv run script.py
200
```

In the next pages, we'll see how we can simplify it for use from VS Code.
