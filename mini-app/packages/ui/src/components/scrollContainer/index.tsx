import { defineComponent } from 'vue'
import SimpleBar from 'simplebar-vue'
import './simplebar.css'

export interface ScrollContainerProps {
  autoHide?: boolean
  thickness?: number | string
}

export default defineComponent({
  name: 'ScrollContainer',
  props: {
    autoHide: {
      type: Boolean,
      default: true
    },
    thickness: {
      type: [Number, String],
      default: 6
    }
  },
  setup(props, { slots, attrs, expose }) {
    let sbRef: any
    const getScrollElement = () => sbRef?.simplebar?.getScrollElement?.() ?? null
    const recalc = () => sbRef?.simplebar?.recalculate?.()
    expose({ getScrollElement, recalc })

    return () => {
      const style = {
        ...(attrs as any)?.style,
        ['--sb-thickness']:
          typeof props.thickness === 'number' ? `${props.thickness}px` : props.thickness
      } as any
      const className = `at-scrollbar${(attrs as any)?.class ? ' ' + (attrs as any).class : ''}`
      return (
        <SimpleBar
          ref={(el: any) => (sbRef = el)}
          autoHide={props.autoHide}
          {...attrs}
          class={className}
          style={style}
        >
          {slots.default?.()}
        </SimpleBar>
      )
    }
  }
})