import { EmptyStatus, useAppStore } from '@anteng/core'
import { defineComponent } from 'vue'
import './style.scss'

export default defineComponent({
  name: 'GoodsDetailEmpty',
  props: {
    description: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const appStore = useAppStore()
    return () => {
      return (
        <div class="goods-detail-empty">
          <div style={`height:${appStore.commonNavigatorHeight}px`}></div>
          <div class="goods-detail-empty__content">
            <EmptyStatus title="当前商品过期／不存在" description={props.description} />
          </div>
        </div>
      )
    }
  }
})
