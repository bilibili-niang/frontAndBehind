import { message } from '@pkg/ui'
import { defineAction } from '../utils'
import { ACTION_KEY_SEARCH } from '../constant'

export default defineAction({
  key: ACTION_KEY_SEARCH,
  title: '搜索页',
  schema: {
    type: 'object',
    properties: {
      keywords: {
        title: '搜索关键词',
        type: 'string',
        config: {
          placeholder: '选填，默认不会自动搜索'
        }
      }
    }
  },
  default: {
    keywords: ''
  },
  handler: (config) => {
    if (config.keywords?.length > 0) {
      message.success(`打开搜索页面，搜索："${config.keywords}"`)
    } else {
      message.success(`打开搜索页面，不搜索`)
    }
  }
})
