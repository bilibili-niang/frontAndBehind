import type { Schema } from '@anteng/jsf'

// 页面右侧面板的「导航按钮」开关配置（映射到 decorationStore.header.value.value）
const headerSchema: Schema = {
  title: '导航按钮',
  type: 'object',
  properties: {
    left: {
      title: '左侧',
      type: 'object',
      widget: 'group',
      properties: {
        back: { title: '返回', type: 'boolean' },
        menu: { title: '菜单', type: 'boolean' }
      }
    },
    right: {
      title: '右侧',
      type: 'object',
      widget: 'group',
      properties: {
        add: { title: '添加', type: 'boolean' },
        more: { title: '更多', type: 'boolean' }
      }
    }
  }
}

export default headerSchema