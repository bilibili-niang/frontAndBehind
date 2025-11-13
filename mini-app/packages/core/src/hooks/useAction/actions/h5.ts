import { defineAction } from '../utils'

export default defineAction({
  key: 'h5',
  title: '打开 H5 链接',
  schema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        title: '链接',
        description: '仅支持https链接，且必须符合小程序业务域名要求',
        config: {
          placeholder: 'https://...'
        }
      },
      params: {
        type: 'array',
        title: '链接参数',
        config: {
          itemTitle: '参数',
          defaultCollapsed: true
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
      },
      needSSO: {
        title: '可单点登录',
        type: 'boolean',
        description: '开启后将在跳转前尝试单点登录'
      }
    }
  },
  default: {
    url: '',
    params: [],
    needSSO: false
  }
})
