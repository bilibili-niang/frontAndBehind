import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import './style.scss'
import { storeToRefs } from 'pinia'
import { useRouter } from '@tarojs/taro'
import { ScrollView } from '@tarojs/components'
import useGlobalStore from '../../../stores/global'
import { BasePage, useAppStore, useLogin, useToast, useUserStore, withLogin } from '@pkg/core'

import { Icon } from '@pkg/ui'
import Order from './order'
import { navigateToCoupon, navigateToPosterMakingList, navigateToSettings, navigateToWallet } from '../../../router'
import { getUserBalance } from '../../../api'
import { convertFenToYuanAndFen } from '../../../utils'
import { balanceType } from '../../../api/blance/type'
import { getCouponList } from '../../../api/coupon'
import { COUPON_STATUS_PENDING_USE } from '../../../constants'
import { useDiscountCouponStore } from '../../../stores/discount-coupon'
import { DEFAULT_AVATAR } from '@pkg/config'
import { REQUEST_DOMAIN } from '../../../api/request'

export default defineComponent({
  name: 'IndexProfilePage',
  setup() {
    console.log('%c 页面加载：profile', 'color:#27ae60')
    const route = useRouter()

    /** 是否作为单独页面（在 /packageIndex/index 内则作为组件），会有某些区别进行特殊处理 */
    const isPage = route.path?.startsWith('/packageIndex/profile')

    const appStore = useAppStore()
    const appGlobalStore = useGlobalStore()
    const { commonNavigatorStyle } = storeToRefs(appStore)
    const userStore = useUserStore()

    const { user, isLogin, nickname, phone } = storeToRefs(userStore)

    console.log('user.value:')
    console.log(user.value)

    const logout = () => userStore.logout()
    const balanceObj = ref<Partial<balanceType>>({
      balance: 0,
      createTime: '2024-08-14 16:06:44',
      id: '1823632332083249154',
      scene: 'microstore',
      status: 1,
      userId: '1814115170881236994'
    })
    const couponList = ref({
      total: 0
    })
    const init = () => {
      // 获取钱包余额
      getUserBalance()
        .then(res => {
          if (res.success) {
            balanceObj.value = res.data
          }
        })
        .catch((e: any) => useToast(e.response.data.msg + '' || '加载出错了'))

      // 获取卡券列表信息
      getCouponList({
        phone: userStore.user?.phone,
        status: `${COUPON_STATUS_PENDING_USE}`
      })
        .then(res => {
          if (res.success) {
            couponList.value = res.data
          }
        })
        .catch((e: any) => useToast(e.response.data.msg + '' || '加载出错了'))
    }
    const { currentTab } = storeToRefs(appGlobalStore)
    watch(
      () => currentTab.value,
      newV => {
        if (newV === 'profile') {
          isLogin.value && init()
        }
      }
    )

    const discountCouponStore = useDiscountCouponStore()

    onMounted(() => {
      isLogin.value && init()
      discountCouponStore.getDiscountCouponCounts()
    })

    const posterVisible = computed(() => {
      return true
    })

    return () => {
      const ProfilePage = (
        <div class={['profile-page', isPage && 'as-page']}>
          <div style={commonNavigatorStyle.value}></div>
          {isLogin.value ? (
            <div class="user-info" onClick={() => {
              console.log('user.value:')
              console.log(user.value)
            }}>
              <img class="user-avatar" src={(REQUEST_DOMAIN + user.value!.avatar) || DEFAULT_AVATAR} alt=""/>
              <div class="user-info-text">
                <div class="user-nickname">{nickname.value}</div>
                <div class="user-mobile">{phone.value}</div>
              </div>
            </div>
          ) : (
            <div class="user-info" onClick={() => useLogin()}>
              <img class="user-avatar" src={DEFAULT_AVATAR} alt=""/>
              <div class="user-info-text">
                <div class="user-nickname">立即登录</div>
                <div class="user-mobile">获取更多优质服务</div>
              </div>
            </div>
          )}

          <Order/>
          <div class="tool-menu">
            {isLogin.value && (
              <div class="tool-menu-item" onClick={navigateToWallet}>
                <Icon name="wallet"/>
                <span>
                  钱包
                  {(balanceObj.value?.balance || balanceObj.value?.balance === 0) && (
                    <>（{convertFenToYuanAndFen(balanceObj.value?.balance).amount}元）</>
                  )}
                </span>
                <Icon name="right"/>
              </div>
            )}
            {isLogin.value && (
              <div class="tool-menu-item" onClick={navigateToCoupon}>
                <Icon name="cards-offers"/>
                <span>
                  我的卡券
                  {couponList.value.total ? <>（{couponList.value.total}）</> : ''}
                </span>
                <Icon name="right"/>
              </div>
            )}
            {/*TODO 海报*/}
            {posterVisible.value && (
              <div class="tool-menu-item" onClick={withLogin(navigateToPosterMakingList)}>
                <Icon name="xintupian_new-picture"/>
                <span>海报制作</span>
                <Icon name="right"/>
              </div>
            )}
            <div class="tool-menu-item" onClick={navigateToSettings}>
              <Icon name="settings"/>
              <span>更多设置</span>
              <Icon name="right"/>
            </div>
            {isLogin.value ? (
              <div class="tool-menu-item" onClick={logout}>
                <Icon name="logout"/>
                <span>退出登录</span>
                <Icon name="right"/>
              </div>
            ) : (
              <div class="tool-menu-item" onClick={() => useLogin()}>
                <Icon name="login"/>
                <span>立即登录</span>
                <Icon name="right"/>
              </div>
            )}
          </div>
        </div>
      )

      if (isPage) {
        return <BasePage navigator={{ navigatorStyle: 'immersive' }}>{ProfilePage}</BasePage>
      }
      return (
        <ScrollView class="profile-page-scroller" scrollY>
          {ProfilePage}
        </ScrollView>
      )
    }
  }
})
