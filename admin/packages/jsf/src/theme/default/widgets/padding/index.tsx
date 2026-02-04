import { defineComponent, reactive, watch } from 'vue'
import { InputNumber } from '@pkg/ui'
import './style.scss'
import { CommonWidgetPropsDefine } from '../../../../types/widget'

export default defineComponent({
  name: 'Widget_Padding',
  props: CommonWidgetPropsDefine,
  setup(props) {
    const padding = reactive<Record<string, number>>({
      top: (props.value as any)?.[0] ?? 0,
      left: (props.value as any)?.[3] ?? 0,
      right: (props.value as any)?.[1] ?? 0,
      bottom: (props.value as any)?.[2] ?? 0
    })
    watch(padding, () => {
      const { top, right, bottom, left } = padding
      props.onChange([top, right, bottom, left])
    })
    return () => {
      return (
        <div class="widget-padding">
          <div class="widget-padding__item --top" title="top">
            <InputNumber
              class="widget-padding__input"
              controls={false}
              value={padding.top}
              onChange={(v: any) => (padding.top = v ?? 0)}
            />
          </div>

          <div class="widget-padding__item --left" title="left">
            <InputNumber
              class="widget-padding__input"
              controls={false}
              value={padding.left}
              onChange={(v: any) => (padding.left = v ?? 0)}
            />
          </div>
          <div class="widget-padding__inner"></div>
          <div class="widget-padding__item --right" title="right">
            <InputNumber
              class="widget-padding__input"
              controls={false}
              value={padding.right}
              onChange={(v: any) => (padding.right = v ?? 0)}
            />
          </div>
          <div class="widget-padding__item --bottom" title="bottom">
            <InputNumber
              class="widget-padding__input"
              controls={false}
              value={padding.bottom}
              onChange={(v: any) => (padding.bottom = v ?? 0)}
            />
          </div>
        </div>
      )
    }
  }
})
