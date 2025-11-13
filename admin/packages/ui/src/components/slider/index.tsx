import './style.scss'
import { defineComponent } from 'vue'
import { Slider as AntSlider } from 'ant-design-vue'
import { PREFIX_CLS } from '@anteng/config'

export default defineComponent({
  name: `${PREFIX_CLS}-slider`,
  // 透传 Antd Slider 的属性，保持行为一致
  props: {
    ...(AntSlider as any).props
  },
  setup(props, { attrs, slots }) {
    return () => (
      <AntSlider {...(props as any)} {...attrs}>
        {slots.default?.()}
      </AntSlider>
    )
  }
})