import { defineAction } from '../utils'

export default defineAction({
  key: 'weapp',
  title: '打开小程序',
  icon: 'weixin-mini-app',
  schema: {
    type: 'object',
    properties: {
      originalId: {
        type: 'string',
        title: '原始ID',
        description: '来源：小程序 - 更多资料 - 账号原始ID',
        config: {
          placeholder: '小程序 - 更多资料 - 账号原始ID'
        }
      },
      appId: {
        type: 'string',
        title: 'App ID',
        description: '来源：小程序 - 更多资料 - App ID',
        config: {
          placeholder: '小程序 - 更多资料 - App ID'
        }
      },
      path: {
        type: 'string',
        title: '页面路径',
        config: {
          placeholder: '非 / 开头的页面路径'
        }
      },
      params: {
        type: 'array',
        title: '页面参数',
        config: {
          itemTitle: '参数'
        },
        items: {
          type: 'object',
          title: '参数',
          properties: {
            key: {
              type: 'string',
              title: '键 key'
            },
            value: {
              type: 'string',
              title: '值 value'
            }
          }
        }
      }
    }
  },
  default: {
    originalId: '',
    appId: '',
    path: '',
    params: []
  }
})
