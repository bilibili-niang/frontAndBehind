import { defineComponent, onMounted } from 'vue'
import './index.scss'
import { BasePage, TabBar } from '@anteng/core'
import demo from '@anteng/core/src/components/tab-bar/demo.json'
import { storeToRefs } from 'pinia'
import Home from './tab-pages/home'
import Category from './tab-pages/category'
import Cart from './tab-pages/cart'
import Profile from './tab-pages/profile'
import { useGlobalStore } from '../stores'
import IndexCustom from './tab-pages/deck/index-custom'
import { useRouter } from '@tarojs/taro'
import useGoodsStore from '../stores/goods'
import useAction from '../hooks/useAction'
import test from './tab-pages/test'
import coffeeHome from './tab-pages/test/coffeeHome'
import coffeeMine from './tab-pages/test/coffeeMine'
import coffeeOrder from './tab-pages/test/coffeeOrder'
import coffeeWorkShop from './tab-pages/test/coffeeWorkShop'
import coffeeCommunity from './tab-pages/test/coffeeCommunity'

// 内置的系统页面
const pages = {
  home: Home,
  category: Category,
  cart: Cart,
  profile: Profile,
  test,
  coffeeHome,
  coffeeMine,
  coffeeOrder,
  coffeeWorkShop,
  coffeeCommunity,
}

definePageConfig({
  navigationBarTitleText: ' ',
  navigationStyle: 'custom',
  // 因为各 tab 页都需要保存独立的滚动距离，所以不采用原生页面滚动
  // 禁止页面滑动，提高 scroll-view 性能
  disableScroll: true,
  enableShareAppMessage: true,
  enableShareTimeline: true
})

const TabPage = defineComponent({
  name: 'IndexTabPage',
  props: {
    hidden: {
      type: Boolean,
      required: true
    }
  },
  setup(props, { slots }) {
    return () => <div class={['index-page__tab-page', props.hidden && 'hidden']}>{slots.default?.()}</div>
  }
})

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const route = useRouter()
    const appStore = useGlobalStore()

    useGlobalStore().getIndexTabs()

    const { tabs, currentTab, loadedTab, indexTabConfig } = storeToRefs(appStore as any)
    const onTabChange = (key: string, keyIndex: number, item: any) => {
      if (item?.action && item?.actionEnable) {
        useAction(item.action)
        return
      } else {
        appStore.toggleTab(key)
      }
    }

    route.params.tab && onTabChange(route.params.tab)
    onMounted(() => {
      useGoodsStore().getGoodsRecommendRule()
    })

    const init = () => {
      console.log('系统内置页面pages:')

      console.log(pages)

    }

    init()

    return () => {
      return (
        <BasePage navigator={null} enableShareAppMessage={true} enableGlobalShare={true}>
          <div class="index-page">
            <div class="index-page__container">
              {tabs.value.map((tab: any) => {
                const Comp = pages[tab.key]
                const isSystemPage = Boolean(Comp)
                return (
                  <TabPage hidden={tab.key !== currentTab.value}>
                    {loadedTab.value[tab.key] &&
                      (isSystemPage ? <Comp/> : <IndexCustom pageId={tab?.key?.id} action={tab?.action}/>)}
                  </TabPage>
                )
              })}
            </div>
            <div class="index-page__tab">
              <TabBar
                tabs={tabs.value}
                current={currentTab.value}
                theme={(indexTabConfig.value?.theme as any) ?? (demo as any).theme}
                backgroundColor={indexTabConfig.value?.backgroundColor ?? (demo as any).backgroundColor}
                color={indexTabConfig.value?.color ?? (demo as any).color}
                activeColor={indexTabConfig.value?.activeColor ?? (demo as any).activeColor}
                borderRadius={indexTabConfig.value?.borderRadius ?? (demo as any).borderRadius}
                margin={indexTabConfig.value?.menuMargin ?? [0, 0, 0, 0]}
                padding={indexTabConfig.value?.menuPadding ?? [0, 0, 0, 0]}
                onChange={onTabChange}
                onAction={useAction}
              />
            </div>
          </div>
        </BasePage>
      )
    }
  }
})
