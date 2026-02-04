import { Schema } from '@pkg/jsf'

export default {
  key: 'user-agreement-page',
  name: '用户协议',
  version: '0.1.0',
  schema: {
    title: '用户协议',
    type: 'object',
    properties: {
      title: {
        title: '标题',
        type: 'string'
      },
      type: {
        title: '类型',
        type: 'number',
        widget: 'radio-button',
        config: {
          options: [
            { label: '自定义', value: 1 },
            { label: '跳转链接', value: 2 }
          ]
        }
      },
      list: {
        title: '协议列表',
        type: 'array',
        condition: (rootValue) => rootValue.type === 1,
        items: {
          title: '协议',
          type: 'object',
          properties: {
            title: {
              title: '协议名称',
              type: 'string',
              required: true
            },
            content: {
              title: '协议内容',
              type: 'string',
              widget: 'rich-text'
            }
          }
        }
      },
      link: {
        title: '链接',
        type: 'string',
        required: true,
        condition: (rootValue) => rootValue.type === 2,
        config: {
          placeholder: '必填，请输入'
        }
      }
    }
  } as Schema,
  default: {
    title: '用户协议',
    type: 1,
    list: [
      { title: '用户服务协议', content: '暂无内容' },
      { title: '隐私政策', content: '暂无内容' }
    ]
  }
}
