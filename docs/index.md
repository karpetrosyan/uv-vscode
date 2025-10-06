---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "uv-vscode"
  actions:
    - theme: brand
      text: Features
      link: /features/commands
    - theme: alt
      text: View on GitHub
      link: https://github.com/karpetrosyan/uv-vscode

features:
  - icon: 📝
    title: PEP 723 Scripts
    details: Run, debug, and get autocompletion for PEP 723–compatible scripts. The extension detects when the active editor is a Python script and switches to the appropriate environment.
  - icon: 📦
    title: Manage Dependencies Directly in VS Code
    details: Add, remove, and update dependencies through UI elements provided by the extension—no terminal needed.
  - title: Embedded uv binary
    icon: 🧩
    details: Comes with an embedded uv binary for your operating system, so there’s no need to install it manually.
---
