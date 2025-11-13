import { CommonWidgetPropsDefine } from '@anteng/jsf'
import { defineSchema } from '@anteng/jsf/src/utils/schema'
import { computed, defineComponent } from 'vue'
import useCanvasStore from '../../../../stores/canvas'
import { storeToRefs } from 'pinia'
import { Select } from '@anteng/ui'

export default {
  schema: defineSchema({
    type: 'object',
    properties: {
      title: {
        title: '标题',
        type: 'string',
        required: true
      },
      icon: {
        title: '图标',
        type: 'string',
        widget: 'image',
        config: {
          compact: true
        }
      }
    }
  }),
  default: {
    title: '分页标题'
  },
  defaultAttrs: {}
}
