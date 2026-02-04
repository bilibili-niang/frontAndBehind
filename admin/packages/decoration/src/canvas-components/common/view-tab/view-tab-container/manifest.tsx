import { CommonWidgetPropsDefine } from '@pkg/jsf'
import { defineSchema } from '@pkg/jsf/src/utils/schema'
import { computed, defineComponent } from 'vue'
import useCanvasStore from '../../../../stores/canvas'
import { storeToRefs } from 'pinia'
import { Select } from '@pkg/ui'

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
