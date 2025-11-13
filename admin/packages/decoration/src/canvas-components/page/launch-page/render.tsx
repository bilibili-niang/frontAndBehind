import { PropType, defineComponent } from 'vue'
import './style.scss'
import BasicNaigator from '../../../canvas-components/components/navigator/basic'
import { ActionImage } from '../../../canvas-components/common/image/render'
export { default as manifest } from './manifest'

export default defineComponent({
  name: 'P_launch',
  props: {
    page: {
      type: Object as PropType<Record<string, any>>,
      required: true
    }
  },
  setup(props, { slots }) {
    return () => {
      if (!props.page) return null
      return (
        <div
          class="p_launch"
          style={{
            backgroundColor: props.page.backgroundColor
          }}
        >
          <BasicNaigator theme="custom" />
          <div
            class="p_launch-bg"
            style={{
              justifyContent:
                props.page.backgroundPosition === 'top'
                  ? 'flex-start'
                  : props.page.backgroundPosition === 'bottom'
                  ? 'flex-end'
                  : 'center'
            }}
          >
            <ActionImage class="p_launch-bg-image" active image={props.page.backgroundImage} />
          </div>
          <div class="p_launch-skip clickable">
            <div class="count-down">{props.page.countdown}s</div>
            <div class="text">跳过</div>
          </div>
          {/* {slots.default?.()} */}
        </div>
      )
    }
  }
})
