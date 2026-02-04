import { BasePage, EmptyStatus, Spin, useAppStore, useLogin, useResponseMessage, useUserStore } from '@pkg/core'
import { storeToRefs } from 'pinia'
import { defineComponent, onMounted, ref, watch } from 'vue'
import './style.scss'
import CartItem from './cart-item'
import Taro from '@tarojs/taro'
import { ScrollView } from '@tarojs/components'
import { Icon, Radio } from '@pkg/ui'
import { SwipeGroup, Swipe } from '@nutui/nutui-taro'
import '@nutui/nutui-taro/dist/packages/swipe/index.css'
import { useCartStore } from '../../../stores'
import { backToIndex } from '../../../router'
import Recommended from '../../../components/recommended'

export default defineComponent({
  name: 'IndexCartPage',
  setup() {
    console.log('%c 页面加载：cart', 'color:#27ae60')
    const appStore = useAppStore()
    const { commonNavigatorStyle } = storeToRefs(appStore)

    const userStore = useUserStore()
    const { isLogin } = storeToRefs(userStore)

    const cartStore = useCartStore()
    const { cartGoodsList, isEmpty, isLoading, isAllChecked, totalAmount, checkedIdList } = storeToRefs(cartStore)

    /** 下拉刷新中 */
    const isRefresherPulling = ref(false)
    watch(
      () => isLoading.value,
      () => {
        if (isLoading.value === false) {
          isRefresherPulling.value = false
        }
      }
    )

    onMounted(() => {
      cartStore.refresh()
    })

    const onRemove = async (id: string) => {
      console.log(id)
      await cartStore.removeItem(id).catch(useResponseMessage)
    }

    const activeSwipeRef = ref()
    const activeSwipeId = ref()
    const onSwipeOpen = (id: string) => {
      activeSwipeId.value = id
    }

    const CartEmpty = () => {
      if (!isLogin.value) {
        return (
          <>
            <EmptyStatus description="请登录后查看" />
            <div
              class="shopping-cart__go"
              onClick={() => {
                useLogin()
              }}
            >
              立即登录
            </div>
          </>
        )
      }
      return isEmpty.value ? (
        <>
          <EmptyStatus description="购物车是空的，快去商城选购吧" />
          <div
            class="shopping-cart__go"
            onClick={() => {
              backToIndex('home', true)
            }}
          >
            去逛逛
          </div>
        </>
      ) : null
    }

    const ActionBar = () => {
      return isLogin.value && cartGoodsList.value.length > 0 ? (
        <div class="shopping-cart__action-bar">
          <div class="shopping-cart__action-content">
            <div
              class="shopping-cart__check-all"
              onClick={() => {
                isAllChecked.value ? cartStore.uncheckAll() : cartStore.checkAll()
              }}
            >
              <Radio checked={isAllChecked.value} />
              &nbsp;全选
            </div>
            <div class="shopping-cart__amount number-font">
              合计：
              <span class="yen">&yen;</span>
              <span class="value">{totalAmount.value.toFixed(2)}</span>
            </div>
            <div
              class={['shopping-cart__order-pay', checkedIdList.value.length === 0 && 'disabled']}
              onClick={() => {
                cartStore.toPay()
              }}
            >
              去结算({checkedIdList.value.length})
            </div>
          </div>
        </div>
      ) : null
    }

    const CartContent = () => {
      if (!isLogin.value || !(cartGoodsList.value.length > 0)) {
        return null
      }
      return (
        <ScrollView
          refresherBackground="transparent"
          class="shopping-cart__scroller"
          enhanced
          scrollY
          refresherEnabled
          refresherTriggered={isRefresherPulling.value && isLoading.value}
          onRefresherrefresh={async () => {
            isRefresherPulling.value = true
            return cartStore.refresh()
          }}
        >
          <div
            class="shopping-cart__list"
            onTouchstart={() => {
              activeSwipeRef.value?.close?.()
            }}
          >
            <SwipeGroup lock touch-move-prevent-default touch-move-stop-propagation>
              {cartGoodsList.value.map((item, index) => {
                return (
                  <div class="shopping-cart__item-wrap">
                    <Swipe
                      ref={item.id === activeSwipeId.value ? activeSwipeRef : undefined}
                      name={item.id}
                      key={item.id}
                      onOpen={() => onSwipeOpen(item.id)}
                    >
                      {{
                        default: () => <CartItem data={item} />,
                        right: () => (
                          <div
                            class="shopping-cart__item-remove"
                            onClick={() => {
                              onRemove(item.id)
                            }}
                          >
                            <Icon name="close" />
                            删除
                          </div>
                        )
                      }}
                    </Swipe>
                  </div>
                )
              })}
              <Recommended type={recommendRule.shoppingPage} />
            </SwipeGroup>
          </div>
        </ScrollView>
      )
    }

    const recommendRule = Taro.getStorageSync('recommendRule')

    return () => {
      return (
        <BasePage navigator={null}>
          <div class="shopping-cart-page">
            <div class="layout-scroll">
              <div class="shopping-cart__header" style={commonNavigatorStyle.value}>
                <div class="shopping-cart__title">
                  购物车
                  {/* <div
                  class="shopping-cart__manage"
                  onClick={() => {
                    isManage.value = !isManage.value
                  }}
                >
                  {isManage.value ? '完成' : '管理'}
                </div> */}
                </div>
              </div>
              <div class="shopping-cart__desc">你可以将喜欢的商品加入购物车</div>
              <div class="shopping-cart__spin">{isLoading.value && <Spin />}</div>
              <CartEmpty />
              <CartContent />
              <ActionBar />
              {/*style={{
                  'bottom':bottomBarHeight.value + 'px'
                }}*/}
            </div>
          </div>
        </BasePage>
      )
    }
  }
})
