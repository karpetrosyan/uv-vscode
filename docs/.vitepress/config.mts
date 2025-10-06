import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "uv-vscode",
  base: "/uv-vscode/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Features", link: "/features/commands" },
      { text: "Commands", link: "/commands/add.md" },
      { text: "Settings", link: "/settings" },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/karpetrosyan/uv-vscode" },
    ],
    sidebar: {
      "/features/": [
        {
          text: "Commands",
          link: "/features/commands.md",
        },
        {
          text: "Scripts",
          link: "/features/scripts.md",
        },
        {
          text: "Dependency management",
          link: "/features/dependency-management.md",
        },
      ],
      "/commands/": [
        {
          text: "Commands",
          items: [
            {
              text: "Add",
              link: "/commands/add.md",
            },
            {
              text: "Remove",
              link: "/commands/remove.md",
            },
            {
              text: "Sync",
              link: "/commands/sync.md",
            },
            {
              text: "Lock",
              link: "/commands/lock.md",
            },
            {
              text: "Venv",
              link: "/commands/venv.md",
            },
            {
              text: "Initialize Project",
              link: "/commands/init.md",
            },
            {
              text: "Initialize Script",
              link: "/commands/initScript.md",
            },
            {
              text: "Show Logs",
              link: "/commands/showLogs.md",
            },
          ],
        },
      ],
    },
  },
});
