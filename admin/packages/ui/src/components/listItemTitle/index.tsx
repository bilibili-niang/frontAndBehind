import { defineComponent } from "vue"
import { Typography } from "ant-design-vue"

export default defineComponent({
  name: 'UiListItemTitle',
  setup(_, { slots, attrs }) {
    const className = attrs?.class as any
    return () => (<Typography.Text strong class={className} {...attrs}>{slots.default?.()}</Typography.Text>)
  }
})
