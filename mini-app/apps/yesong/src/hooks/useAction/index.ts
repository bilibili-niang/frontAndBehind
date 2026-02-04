import { toRaw } from 'vue'
import Taro from '@tarojs/taro'
import {
  backToIndex,
  navigateToCategory,
  navigateToCoupon,
  navigateToCouponUsage,
  navigateToCustomPage,
  navigateToDiscountCouponList,
  navigateToGoodsDetail,
  navigateToGoodsGroup,
  navigateToInformationDetail,
  navigateToInformationList,
  navigateToSearch,
  navigateToShoppingCart,
  navigateToProfile,
  navigateToWallet
} from '../../router'
import { commonActions, emitter, useLogin, useQuickMenu, useToast, useUserStore } from '@pkg/core'
import h5 from './actions/h5'
import jd from './actions/jd'

type ActionDefine = {
  key: string
  title: string
  handler: (config?: any) => void
}

const actions: ActionDefine[] = [
  { key: 'home', title: '返回首页', handler: backToIndex },
  {
    key: 'custom',
    title: '自定义页面',
    handler: config => {
      navigateToCustomPage(config.target?.id ?? config.id?.id)
    }
  },
  // { key: 'life', title: '生活圈', handler: backToLife },
  // { key: 'profile', title: '返回个人中心', handler: backToProfile },
  { key: 'menu', title: '快捷菜单', handler: useQuickMenu },
  { key: 'login', title: '登录', handler: useLogin },
  ...Object.values(commonActions),
  {
    key: 'open-page',
    title: '跳转指定页面',
    handler: config => {
      const target = config?.target
      if (!target) {
        return
      }
      const key: string | undefined = target?.key
      const type: string | undefined = target?.__type

      // 系统页：根据 key 跳转到对应内置页面
      const isSystem = type === 'system' || (key && ['home', 'category', 'cart', 'profile', 'search'].includes(key))
      if (isSystem) {
        switch (key) {
          case 'home':
            backToIndex('home')
            return
          case 'category':
            navigateToCategory()
            return
          case 'cart':
            navigateToShoppingCart()
            return
          case 'profile':
            navigateToProfile()
            return
          case 'search':
            navigateToSearch()
            return
          default:
            // 未知系统页暂不支持
            Taro.showToast({ icon: 'none', title: '暂不支持该系统页' })
            return
        }
      }

      // 自定义页：根据 id 跳转
      const id = target?.id || config?.id?.id
      if (id) {
        navigateToCustomPage(id)
      } else {
        Taro.showToast({ icon: 'none', title: '未选择有效页面' })
      }
    }
  },
  {
    key: 'goods-detail',
    title: '商品详情',
    handler: config => {
      navigateToGoodsDetail(config.goods?.id)
    }
  },
  {
    key: 'information-list',
    title: '资讯列表',
    handler: config => {
      navigateToInformationList(config.keywords)
    }
  },
  {
    key: 'information-detail',
    title: '资讯详情',
    handler: config => {
      navigateToInformationDetail(config.target.id)
    }
  },

  {
    key: 'wallet',
    title: '我的余额',
    handler: () => navigateToWallet()
  },
  {
    key: 'coupon',
    title: '我的卡券',
    handler: () => navigateToCoupon()
  },
  {
    key: 'weapp',
    title: '打开小程序',
    handler: config => {
      if (process.env.TARO_ENV === 'h5') {
        // TODO h5打开小程序
        Taro.showToast({
          icon: 'none',
          title: '请在小程序打开'
        })
      } else {
        Taro.navigateToMiniProgram({
          appId: config.appId,
          path: config.path.replace('.html', '')
        })
      }
    }
  },
  h5,
  jd,
  {
    key: 'search',
    title: '搜索',
    handler: config => {
      navigateToSearch({
        keywords: config?.keywords
      })
    }
  },
  {
    key: 'category',
    title: '商品分类',
    handler: () => navigateToCategory()
  },
  {
    key: 'cart',
    title: '购物车',
    handler: () => {
      navigateToShoppingCart()
    }
  },
  {
    key: 'goods-group',
    title: '商品分组',
    handler: config => {
      navigateToGoodsGroup(config.id)
    }
  },
  {
    key: 'discount-coupon',
    title: '我的优惠券',
    handler: () => {
      navigateToDiscountCouponList()
    }
  },
  {
    key: 'discount-coupon-template',
    title: '优惠券领取页',
    handler: config => {
      navigateToCouponUsage({
        templateId: config?.target.templateId
      })
    }
  }
]

export type Action = {
  key: string
  remark?: string
  config?: Record<string, any> & {
    __preCondition?: PreConditionDefine
  }
}

type PreConditionDefine = Record<string, any> & {
  isLogin?: { enable: boolean; message: string; handler: 'none' | 'login' }
  isPartyMember?: { enable: boolean; message: string; handler: 'none' | 'partyMemberAuth' }
  isPersonalAuth?: { enable: boolean; message: string; handler: 'none' | 'personalAuth' }
  isVolunteer?: { enable: boolean; message: string; handler: 'none' | 'volunteerAuth' }
}

const useAction = (action?: Action) => {
  if (!action) {
    return void 0
  }
  if (!(action?.key?.length > 0)) {
    console.log('未定义动作：', toRaw(action))
    return void 0
  }
  const targetAction = actions.find(item => item.key === action.key)
  if (!targetAction) {
    console.error('找不到对应动作定义', toRaw(action))
    return void 0
  }

  // 校验前置条件
  const preCondition = action.config?.__preCondition

  usePreCondition(preCondition, () => {
    targetAction.handler?.(action.config)
  })
}

emitter.on('useAction', useAction)

// 使用条件
const usePreCondition = (preCondition: PreConditionDefine | undefined | null, handler: () => void) => {
  if (!preCondition) {
    handler()
    return void 0
  }

  const { isLogin } = preCondition

  const userStore = useUserStore()

  // 最好使用 enable === true 来判断

  if (isLogin && isLogin.enable && !userStore.isLogin) {
    // toast提示
    isLogin.message?.length > 0 && useToast(isLogin.message)
    // 触发登录弹窗
    isLogin.handler === 'login' && useLogin()
    // 可以考虑使用 .then(usePreCondition(preCondition, handler)) 实现登录后无缝衔接，不需要再点击触发动作
    return void 0
  }

  handler()
}

export default useAction
