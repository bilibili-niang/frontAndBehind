import { subTitleManifest } from '../sub-title/manifest'

export default {
  schema: {
    type: 'object',
    properties: {
      // 组件样式
      cardStyle: {
        title: '卡片样式',
        type: 'object',
        widget: 'suite',
        properties: {
          background: {
            title: '卡片背景色',
            type: 'string',
            widget: 'color'
          }
        }
      },
  topBar: {
    title: '顶部栏',
    type: 'object',
    properties: {
      show: {
        title: '显示顶部栏',
        type: 'boolean',
        default: true
      },
      background: {
        title: '背景颜色',
        condition: (root: any) => root?.topBar?.show,
        type: 'string',
        widget: 'color'
      },
      unLoginText: {
        title: '未登录文字',
        type: 'string',
        default: '登录/注册'
      },
      greeting: {
        title: '登录后的问候语',
        type: 'string',
        default: '晚上好'
      }
    }
  },
  leftContent: {
    title: '左侧内容',
    type: 'object',
    config: {
      orders: ['titleConfig', 'leftImage', 'action']
    },
    properties: {
      leftImage: {
        title: '左侧背景',
        type: 'string',
        widget: 'image'
      },
      titleConfig: {
        title: '左侧标题配置（高级）',
        type: 'object',
        widget: 'group',
        config: { defaultCollapsed: true },
        properties: subTitleManifest.schema.properties
      },
      action: {
        title: '左侧点击事件',
        type: 'object',
        widget: 'action'
      }
    }
  },
  rightContent: {
    title: '右侧内容',
    type: 'object',
    config: {
      orders: ['titleConfig', 'rightImage', 'action']
    },
    properties: {
      rightImage: {
        title: '右侧背景',
        type: 'string',
        widget: 'image'
      },
      titleConfig: {
        title: '右侧标题配置（高级）',
        type: 'object',
        widget: 'group',
        config: { defaultCollapsed: true },
        properties: subTitleManifest.schema.properties
      },
      action: {
        title: '右侧点击事件',
        type: 'object',
        widget: 'action'
      }
    }
  }
    }
  },
  default: {
    cardStyle: {
      background: '#ffffff'
    },
    topBar: {
      show: true,
      unLoginText: '登录/注册',
      greeting: '晚上好',
      background: '#2c2c2c'
    },
    leftContent: {
      leftImage: '',
      titleConfig: {
        title: { text: '到店自取', color: '#1f1f1f', fontSize: 18 },
        subtitle: { enable: true, text: 'PICK UP', color: '#999999', fontSize: 12, placement: 'bottom' }
      }
    },
    rightContent: {
      rightImage: '',
      titleConfig: {
        title: { text: '外卖配送', color: '#1f1f1f', fontSize: 18 },
        subtitle: { enable: true, text: 'DELIVERY', color: '#999999', fontSize: 12, placement: 'bottom' }
      }
    }
  },
  defaultAttrs: {
    margin: [0, 0, 0, 0]
  }
}
