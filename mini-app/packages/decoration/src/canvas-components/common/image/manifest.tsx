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
      borderRadius: PRESET_SCHEMA.BORDER_RADIUS,
      // border: PRESET_SCHEMA.BORDER
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
              src="https://dev-cdn.kacat.cn/upload/ac813f7ebdeaac91c96a99526c5c7cb6.jpg"
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
    borderRadius: [0, 0, 0, 0],
    border: {
      enable: true,
      shape: 'solid',
      width: 1,
      color: '#ffffff'
    }
  },
  defaultAttrs: {}
}
