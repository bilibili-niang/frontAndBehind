import { computed, defineComponent, PropType } from 'vue'
import { DeckComponentConfig } from '../../types'
import { EmptyStatus } from '@anteng/core'
import { DeckRender } from '../../../index'

export default defineComponent({
  name: 'd_view-tab-container',
  props: {
    comp: {
      type: Object as PropType<DeckComponentConfig<any>>,
      required: true
    },
    config: {
      type: Object as PropType<any>,
      required: true
    }
  },
  setup(props) {
    const childComponents = computed(() => {
      return props.comp.children || []
    })

    return () => {
      if (childComponents.value.length === 0) {
        return (
          <div style="padding: 36px 0 24px 0">
            <EmptyStatus description="该分页无内容，请添加组件" />
          </div>
        )
      }
      return <DeckRender.value components={childComponents.value} />
    }
  }
})
