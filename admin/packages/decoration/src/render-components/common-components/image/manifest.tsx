import { PRESET_SCHEMA } from '@anteng/jsf'

export default {
  schema: {
    type: 'object',
    properties: {
      image: {
        type: 'object',
        title: '图片',
        widget: 'action-image'
      },
      longPress: {
        title: '允许长按',
        type: 'boolean',
        condition: (r: any, p: any) => {
          return p?.image?.type === 'single'
        },
        description: (
          <div style="padding:10px 12px;">
            <p>若图片中包含二维码等可长按识别的内容可开启，否则不建议开启</p>
            <img
              style="width:400px;height:374px;"
              src="https://dev-cdn.null.cn/upload/ac813f7ebdeaac91c96a99526c5c7cb6.jpg"
            />
          </div>
        )
      }
    }
  },
  default: {
    image: {
      url: '',
      type: 'single',
      action: {},
      spots: []
    },
  },
  defaultAttrs: {
    backgroundEnable: false,
    background: 'rgba(255, 255, 255, 0)',
    borderRadius: [0, 0, 0, 0],
    border: {
      enable: false,
      shape: 'solid',
      width: 1,
      color: '#000000'
    },
    opacity: 100,
    padding: [0, 10, 0, 10],
    margin: [10, 0, 10, 0],
    overflow: 'visible'
  }
}
