import { defineComponent, onMounted, ref } from 'vue'
import './style.scss'
import Taro from '@tarojs/taro'
import Icon from '../icon'
import { useAppStore } from '@pkg/core'

export default defineComponent({
  name: 'c_fold',
  setup(props, { slots }) {
    const appStore = useAppStore()
    const expand = ref(false)
    const queryRef = ref<Taro.SelectorQuery>()
    const lastScrollTop = ref(0)
    onMounted(() => {
      const query = Taro.createSelectorQuery()
      query.select('.c_fold-wrapper').boundingClientRect()
      query.selectViewport().scrollOffset()
      queryRef.value = query
    })
    const toggle = () => {
      expand.value = !expand.value
      queryRef.value?.exec(res => {
        if (!expand.value && lastScrollTop.value < res[1].scrollTop) {
          Taro.pageScrollTo({
            scrollTop: res[0].top + res[1].scrollTop - appStore.commonNavigatorHeight,
            duration: 0
          })
        }
        lastScrollTop.value = res[1].scrollTop
      })
    }
    return () => {
      return (
        <div class="c_fold-wrapper">
          <div class={['c_fold', expand.value && 'c_fold--expand']}>
            <div class="c_fold-content">{slots.default?.()}</div>
            <div class="c_fold-btn" onClick={toggle}>
              <div class="c_fold-btn-text">
                <Icon name="down" />
                {expand.value ? '折叠部分' : '展开全部'}
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
})
