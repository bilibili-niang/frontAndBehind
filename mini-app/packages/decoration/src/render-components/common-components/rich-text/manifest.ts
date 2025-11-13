export default {
  schema: {
    type: 'object',
    properties: {
      content: {
        title: '内容',
        type: 'string',
        widget: 'rich-text',
        config: {
          placeholder: '请输入标题内容'
        }
      }
    }
  },
  default: {
    content: ''
  },
  defaultAttrs: {
    padding: [8, 12, 8, 12]
  }
}
