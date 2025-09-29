import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "uv-vscode",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: "Features", link: "/features/scripts" }],

    socialLinks: [
      { icon: "github", link: "https://github.com/karpetrosyan/uv-vscode" },
    ],
    sidebar: [
      {
        text: "Scripts",
        items: [
          { text: "Introduction", link: "/features/scripts/index.md" },
          { text: "Run & Debug", link: "/features/scripts/run_and_debug" },
          { text: "Environments", link: "/features/scripts/environments" },
        ],
      },
      {
        text: "Dependency management",
        items: [
          {
            text: "Introduction",
            link: "/features/dependency-management/index.md",
          },
          {
            text: "Manage Dependencies",
            link: "/features/dependency-management/manage-dependencies.md",
          },
        ],
      },
    ],
  },
});
