import { defineComponent } from 'vue'
import './style.scss'
import useBasicLayoutStore, { type PageTab } from '../../../../stores/basic-layout'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { Icon, message } from '@anteng/ui'
import { PREFIX_CLS } from '@anteng/config'

export default defineComponent({
  name: 'BasicLayoutPageLabel',
  setup() {
    const router = useRouter()
    const basicLayoutStore = useBasicLayoutStore()
    const { pageTabs, currentTab } = storeToRefs(basicLayoutStore)
    // const list = [
    //   // { key: 'home', path: '/home', label: '首页', icon: 'settings' },
    //   // { key: 'category', path: '/category', label: '商品分类' },
    //   // { key: 'ad', path: '/ad', label: '广告管理' },
    //   // { key: 'order', path: '/order', label: '订单管理' },
    //   // { key: 'commission', path: '/commission', label: '佣金管理' },
    //   // { key: 'commission1', path: '/commission', label: '佣金管理1' },
    //   // { key: 'commission3', path: '/commission', label: '佣金管理2' },
    //   // { key: 'commission4', path: '/commission', label: '佣金管理3' },
    //   // { key: 'commission5', path: '/commission', label: '佣金管理佣金管理4' },
    //   // { key: 'commission6', path: '/commission', label: '成都师范多福多寿放是否' },
    //   // { key: 'commission7', path: '/commission', label: '鬼地方个梵蒂冈不到' },
    //   // { key: 'commission8', path: '/commission', label: '佣金管理7' }
    // ]

    const toggle = (item: PageTab) => {
      router.push(item.path)
    }

    // TODO 标签关闭，取消该页面的 KeepAlive 缓存
    const onRemove = (item: PageTab) => {
      if (pageTabs.value.length <= 1) {
        return message.info('至少保留一个页面')
        // TODO 这里可以优化一下，打开首页之类的
      }
      const index = pageTabs.value.indexOf(item)
      basicLayoutStore.removePageTab(item.key)
      if (currentTab.value === item.key) {
        const to = pageTabs.value[index] || pageTabs.value[index - 1] || pageTabs.value[0]
        if (to) {
          router.replace(to.path)
        } else {
          // 这里back可能会打开已经关闭的页面
          router.back()
        }
      }
    }

    return () => {
      const list = pageTabs.value
      return (
        <div class={`${PREFIX_CLS}-basic-layout__page-label`}>
          <div class="page-label__list">
            {list.map((item) => {
              return (
                <div
                  class={['page-label__item clickable', currentTab.value === item.key && '--active']}
                  onClick={() => toggle(item)}
                >
                  <i class="--arc-l"></i>
                  <i class="--arc-r"></i>
                  <div class="page-label__item-content">
                    {item.icon && <Icon class="page-label__item-icon" name={item.icon as any} />}
                    <span class="page-label__item-label">{item.label}</span>
                    <div
                      class="page-label__item-close"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemove(item)
                      }}
                    >
                      <Icon name="error-bold"></Icon>
                    </div>
                  </div>
                </div>
              )
            })}
            <div class="page-label__item clickable --append">
              <i class="--arc-l"></i>
              <i class="--arc-r"></i>
            </div>
          </div>
          <div class="page-label__fade-layer"></div>
          <div class="page-label__menu clickable">
            <div class="page-label__menu-button">
              <Icon name="more"></Icon>
            </div>
          </div>
        </div>
      )
    }
  }
})
