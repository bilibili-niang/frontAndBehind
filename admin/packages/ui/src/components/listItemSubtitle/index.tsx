import { defineComponent } from "vue"
import { Typography } from "ant-design-vue"

export default defineComponent({
  name: 'UiListItemSubtitle',
  setup(_, { slots, attrs }) {
    const className = attrs?.class as any
    return () => (<Typography.Text type="secondary" class={className} {...attrs}>{slots.default?.()}</Typography.Text>)
  }
})
