import { PropType, computed, defineComponent, onBeforeUnmount, ref } from 'vue'
import './style.scss'
import BasicNaigator from '../../../canvas-components/components/navigator/basic'
export { default as manifest } from './manifest'

export default defineComponent({
  name: 'P_Search',
  props: {
    page: {
      type: Object as PropType<Record<string, any>>,
      required: true
    }
  },
  setup(props, { slots }) {
    return () => {
      if (!props.page) return null
      const mode = props.page.mode
      return (
        <div class="p_search">
          <BasicNaigator />
          <div class="flex-center flex-column" style="height:100px;">
            <div>搜索框、搜索记录、热搜 暂未支持预览</div>
            <div>可在下方插入装修组件</div>
          </div>
          {slots.default?.()}
        </div>
      )
    }
  }
})
