import { defineAction } from '../utils'

export default defineAction({
  key: 'copy',
  title: '复制文本',
  icon: 'copy',
  schema: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        title: '文本内容',
        config: {
          placeholder: '请填写需要复制的文本内容'
        }
      },
      toastMessage: {
        type: 'string',
        title: '复制后提示',
        enableKey: 'enableToast'
      }
    }
  },
  default: {
    text: '',
    enableToast: true,
    toastMessage: '复制成功'
  }
})
