import { defineComponent } from "vue"
import { List as AntList } from "ant-design-vue"

export default defineComponent({
  name: 'UiListItem',
  setup(_, { slots, attrs }) {
    const className = attrs?.class as any
    return () => (<AntList.Item class={className} {...attrs}>{slots.default?.()}</AntList.Item>)
  }
})
