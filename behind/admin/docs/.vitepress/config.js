// .vitepress/config.js
export default {
  title: '前端开发文档',
  description: '前端开发文档',
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/' },
      { text: '组件', link: '/components/' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/' },
            { text: '开发规范', link: '/guide/standards' }
          ]
        }
      ],
      '/components/': [
        {
          text: '基础组件',
          items: [
            { text: '按钮', link: '/components/button' },
            { text: '输入框', link: '/components/input' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/your-repo' }
    ]
  }
}
