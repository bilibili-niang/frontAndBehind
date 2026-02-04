import { defineComponent } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { TreeSelect } from '@pkg/ui'

export default defineComponent({
  name: 'sw_tree-select',
  props: CommonWidgetPropsDefine,
  setup(props) {
    return () => {
      return <TreeSelect {...props.config} class="sw_tree-select" />
    }
  }
})
