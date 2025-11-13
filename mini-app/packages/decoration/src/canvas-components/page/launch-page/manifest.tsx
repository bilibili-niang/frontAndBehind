import { Schema } from '@anteng/jsf'

export default {
  key: 'launch-page',
  name: '启动页',
  version: '0.1.0',
  schema: {
    title: '启动页',
    type: 'object',
    properties: {
      backgroundColor: {
        title: '背景颜色',
        type: 'string',
        widget: 'color'
      },
      backgroundImage: {
        title: '背景图片',
        type: 'object',
        widget: 'action-image'
      },
      backgroundPosition: {
        title: '背景对齐',
        type: 'string',
        widget: 'select',
        config: {
          options: [
            { label: '顶部对齐', value: 'top' },
            { label: '居中对齐', value: 'center' },
            { label: '底部对齐', value: 'bottom' }
          ]
        }
      },
      countdown: {
        title: '倒计时',
        type: 'number',
        widget: 'slider',
        description: '若未开启倒计时，将在启动完毕后立即跳转至首页，且不显示 “跳过” 按钮',
        enableKey: 'countdownEnable',
        config: {
          min: 3,
          max: 12,
          suffix: '秒'
        }
      }
    }
  } as Schema,
  default: {
    backgroundColor: '#fff',
    backgroundImage: null,
    backgroundPosition: 'center',
    countdown: 5
  }
}
