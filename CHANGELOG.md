## [0.42.0] - 2026-10-04

### 🚀 Features

- Support running scripts for in-memory files

### 🐛 Bug Fixes

- Show the terminal when a command is sent to it
- Don't reuse a closed terminal
## [0.40.0] - 2026-10-03

### 🚀 Features

- Enter the environment of the closest project
- Support untitled scripts

### 🐛 Bug Fixes

- Cancel commands when the input is dismissed

### ⚙️ Miscellaneous Tasks

- Pin vsce
- Bump uv version
## [0.36.0] - 2026-02-08

### ⚙️ Miscellaneous Tasks

- Bump uv version
## [0.36.0] - 2025-10-16

### 🚀 Features

- Try to enter script environment when file changes
## [0.32.0] - 2025-10-13

### ⚙️ Miscellaneous Tasks

- Don't specify default version when creating python script
## [0.30.0] - 2025-10-06

### 🐛 Bug Fixes

- Set `--directory` path when trying to find a script environment
## [0.28.0] - 2025-10-06

### 🚀 Features

- Add vscode command for `uv lock`
- Add vscode command for `uv venv`
- Add `uv.sentUvCommandToTerminal` setting

### 🐛 Bug Fixes

- `sendUvCommandToTerminal` config typo

### 🚜 Refactor

- Improve commands
- Add general uv command impl

### 📚 Documentation

- Improve docs
## [0.26.0] - 2025-10-02

### 🚀 Features

- *(docs)* Add vitepress powered docs
- Better check for toml files
- Trim line when searching for dependencies
- Enter a script environment after init command

### 🐛 Bug Fixes

- Display name

### 📚 Documentation

- Better readme
## [0.24.0] - 2025-09-28

### 🐛 Bug Fixes

- Script interpreter path finding in windows

### 🚜 Refactor

- Remove enter/exit code lenses, automatically switch between interpreters
## [0.22.0] - 2025-09-27

### 🐛 Bug Fixes

- Extension activation for windows
## [0.20.0] - 2025-09-27

### ⚙️ Miscellaneous Tasks

- Fix display name, add more keywords
## [0.18.0] - 2025-09-24

### 🚀 Features

- Add configuration properties to package.json
## [0.16.0] - 2025-09-23

### 🚀 Features

- Add `ignoreProjectConfigs` setting, true by default
## [0.12.0] - 2025-09-22

### 🚀 Features

- Add initScript command
## [0.10.0] - 2025-09-13

### 🚀 Features

- Add logging with output channel
## [0.8.0] - 2025-09-08

### 🐛 Bug Fixes

- *(docs)* Fix readme
- *(docs)* Fix links to the gifs

### 📚 Documentation

- Improve readme, add gifs for demo

### ⚙️ Miscellaneous Tasks

- Fix gif paths
- Format with prettier when fixing lint errors
## [0.6.0] - 2025-09-08

### 🚀 Features

- Don't overwrite previous interpreter with the same one
## [0.4.0] - 2025-09-08

### 🐛 Bug Fixes

- Extension importing
## [0.2.0] - 2025-09-08

### ⚙️ Miscellaneous Tasks

- Initial commit
- Remove extension tests module
- Clean up commands in package.json
- Add basic ci workflow
- Fix ci workflow
- Remove extension-quickstart markdown file
- Add contents read permission to ci workflow
- Use npm as a PM
- Add LICENSE
- Add github url in package.json
