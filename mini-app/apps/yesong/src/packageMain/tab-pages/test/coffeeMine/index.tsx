// 我的（个人中心 - Coffee 风格）
import { computed, defineComponent, onMounted } from 'vue'
import { BasePage, useLogin, useUserStore, withLogin } from '@pkg/core'
import { Image, Text, View } from '@tarojs/components'
import { Icon } from '@pkg/ui'
import './index.scss'
import { storeToRefs } from 'pinia'
import { navigateToCoupon, navigateToOrderList, navigateToSettings, navigateToWallet } from '../../../../router'
import { DEFAULT_AVATAR } from '@pkg/config'
import { useProfileStore } from '../../../../stores/profile'
import { REQUEST_DOMAIN } from '../../../../api/request'

definePageConfig({
  enableShareAppMessage: true,
  navigationStyle: 'custom',
  disableScroll: true
})

export default defineComponent({
  name: 'CoffeeMinePage',
  setup() {
    const { user, isLogin } = storeToRefs(useUserStore())
    const login = useLogin

    // 余额（演示）
    const profileStore = useProfileStore()
    const { balanceText, isBalanceAvailable } = storeToRefs(profileStore)
    onMounted(() => {
      // 登录后再拉取余额
      if (isLogin.value) profileStore.getAccountBalance()
    })

    const nickname = computed(() => user.value?.nickname || '游客')

    return () => (
      <BasePage
        navigator={{
          navigatorStyle: 'blank',
          immersive: true,
          fixedTitle: '个人中心',
          navigationBarTextStyleFixed: 'black',
          navigationBarBackgroundColorFixed: 'rgba(255,255,255,0)'
        }}
        navigatorPlaceholder={true}
        useScrollView={true}
      >
        <View class="coffee-mine">
          {/* 头部：头像与昵称 */}
          <View class="mine-header">
            <View class="mine-header__profile">
              <Image class="avatar" mode="aspectFill"
                     src={(REQUEST_DOMAIN + DEFAULT_AVATAR)}/>
              <View class="info">
                <Text class="nickname">{nickname.value}</Text>
                {!isLogin.value ? (
                  <View class="login-btn" onClick={() => login()}>登录/注册</View>
                ) : (
                  <Text class="desc">欢迎回来，开启今日咖啡时光</Text>
                )}
              </View>
            </View>
          </View>

          {/* 快捷入口 */}
          <View class="mine-actions">
            <View class="mine-actions__item" onClick={withLogin(navigateToWallet)}>
              <View class="left"><Icon name="wallet"/></View>
              <View class="center">
                <Text class="label">钱包</Text>
                {isBalanceAvailable.value && <Text class="extra">￥{balanceText.value}</Text>}
              </View>
              <View class="right"><Icon name="right"/></View>
            </View>
            <View class="mine-actions__item" onClick={withLogin(navigateToCoupon)}>
              <View class="left"><Icon name="cards-offers"/></View>
              <View class="center"><Text class="label">我的卡券</Text></View>
              <View class="right"><Icon name="right"/></View>
            </View>
            <View class="mine-actions__item" onClick={() => navigateToOrderList()}>
              <View class="left"><Icon name="order"/></View>
              <View class="center"><Text class="label">我的订单</Text></View>
              <View class="right"><Icon name="right"/></View>
            </View>
            <View class="mine-actions__item" onClick={navigateToSettings}>
              <View class="left"><Icon name="settings"/></View>
              <View class="center"><Text class="label">更多设置</Text></View>
              <View class="right"><Icon name="right"/></View>
            </View>
          </View>

          {/* 咖啡主题功能区（示例） */}
          <View class="mine-coffee">
            <Text class="section-title">常用功能</Text>
            <View class="chips">
              <View class="chip" onClick={() => navigateToOrderList(1)}>
                <Icon name="clock"/>
                <Text>待付款</Text>
              </View>
              <View class="chip" onClick={() => navigateToOrderList(2)}>
                <Icon name="delivery"/>
                <Text>配送中</Text>
              </View>
              <View class="chip" onClick={() => navigateToOrderList(3)}>
                <Icon name="evaluate"/>
                <Text>待评价</Text>
              </View>
              <View class="chip" onClick={navigateToSettings}>
                <Icon name="address"/>
                <Text>地址管理</Text>
              </View>
            </View>
          </View>
        </View>
      </BasePage>
    )
  }
})
