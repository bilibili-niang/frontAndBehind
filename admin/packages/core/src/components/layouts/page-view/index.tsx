import { defineComponent } from 'vue'
import './style.scss'
import { PREFIX_CLS } from '@anteng/config'

export default defineComponent({
  name: 'PageView',
  props: {
    header: {},
    footer: {}
  },
  setup(props, { attrs, slots }) {
    return () => {
      return (
        <>
          {props.header ?? slots.header?.()}
          <div class={`${PREFIX_CLS}-page-view`} {...attrs}>
            <div class={`${PREFIX_CLS}-page-view-content`}>{slots.default?.()}</div>
          </div>
          {props.footer ?? slots.footer?.()}
        </>
      )
    }
  }
})
