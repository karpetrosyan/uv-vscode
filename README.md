# uv-vscode

A VS Code extension that provides enhanced integration with [uv](https://github.com/astral-sh/uv), the fast Python package installer and resolver. This extension makes it easier to manage Python dependencies and work with inline script metadata (PEP 723) directly in VS Code.

## Features

### 🔧 Dependency Management
- **Add Dependencies**: Quickly add Python packages to your project or inline scripts
- **Remove Dependencies**: Remove packages with a simple command
- **Smart Detection**: Automatically detects whether you're working with a project or an inline script

### 📝 Inline Script Support (PEP 723)
- **Script Environment Selection**: Choose and manage Python interpreters for inline scripts
- **Dependency Code Lenses**: Visual indicators showing dependencies in both `.py` files and `pyproject.toml` files
- **Environment Management**: Easy switching between different script environments

### 🎯 Code Lenses Integration
- Interactive buttons appear directly in your code for:
  - Adding dependencies (`+ Add Dependency`)
  - Removing dependencies (`- Remove Dependency`)
  - Selecting script interpreters (`Select Script Environment`)
  - Exiting script environments (`Exit Script Environment`)

## Requirements

- **VS Code**: Version 1.101.0 or higher
- **Python Extension**: The Microsoft Python extension must be installed
- **uv**: The uv package manager should be available in your system PATH or bundled with the extension

## Usage

### Managing Dependencies

1. **Add a Dependency**:
   - Open a Python file or `pyproject.toml`
   - Click the `+ Add Dependency` code lens that appears
   - Or use the Command Palette: `Ctrl+Shift+P` → "Add Dependency"

2. **Remove a Dependency**:
   - Click the `- Remove Dependency` code lens
   - Or use the Command Palette: `Ctrl+Shift+P` → "Remove Dependency"

### Working with Inline Scripts (PEP 723)

For Python files with inline metadata blocks:

```python
#!/usr/bin/env python3
# /// script
# dependencies = [
#   "requests",
#   "beautifulsoup4",
# ]
# ///

import requests
from bs4 import BeautifulSoup
```

1. **Select Script Interpreter**:
   - Click `Select Script Environment` code lens
   - Choose from available Python interpreters

2. **Exit Script Environment**:
   - Click `Exit Script Environment` when you're done working with the script

## Commands

The extension provides the following commands accessible via the Command Palette (`Ctrl+Shift+P`):

- `Select Script Interpreter`: Choose a Python interpreter for inline scripts
- `Exit Script Environment`: Exit the current script environment
- `Add Dependency`: Add a Python package dependency
- `Remove Dependency`: Remove a Python package dependency

## Extension Settings

This extension contributes settings under the `uv-vscode` namespace. Configure uv-specific options through VS Code's settings.

## Development

This extension is built with:
- TypeScript
- VS Code Extension API
- esbuild for bundling
- Vitest for testing

### Building from Source

```bash
# Install dependencies
npm install

# Build the extension
npm run compile

# Watch for changes during development
npm run watch
```

### Testing

```bash
# Run tests
npm test

# Watch tests during development
npm run watch-tests
```

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

See [LICENSE](./build/LICENSE) file for details.

---

**Enjoy enhanced Python development with uv in VS Code!** 🚀
