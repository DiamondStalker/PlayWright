import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Projects",
  description: "Documentation of all the different projects with their fixes",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Projects', link: '/Projects' },
    ],

    sidebar: [
      {
        text: 'Projects',
        items: [
          { text: 'Indeed', link: '/Projects/indeed' },
          { text: 'Test Templater', link: '/Projects/test_templater' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/diamondstalker' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Evan You'
    },
    lastUpdated: true,
    srcDir: './src',
    srcExclude: ['**/README.md', '**/TODO.md'],
    outDir: '../public'
  }
})
