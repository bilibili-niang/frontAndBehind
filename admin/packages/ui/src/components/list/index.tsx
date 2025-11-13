import { defineComponent } from "vue"
import { List as AntList } from "ant-design-vue"

export default defineComponent({
  name: 'UiList',
  setup(_, { slots, attrs }) {
    const className = attrs?.class as any
    return () => (<AntList class={className} {...attrs}>{slots.default?.()}</AntList>)
  }
})
