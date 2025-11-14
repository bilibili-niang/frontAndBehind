import Taro from '@tarojs/taro'

/** 默认分享内容 */
export const DEFAULT_SHARE_PAYLOAD: Taro.WeappShareAppMessageReturnObject = {
  // title: '欢迎使用卡猫微店',
  // imageUrl: 'https://dev-cdn.cardcat.cn/anteng/CHxDpOit7DNh.png',
  path: undefined, // 默认当前页面路径
  promise: undefined as any
}

export const HOME_PAGE = 'homePage'

// 目前允许分享跳转的页面列表
export const tabsValue = [
  {
    label: '商品详情',
    value: 'goodsDetail',
    path: 'packageA/goods/detail',
    children: 'goods'
  },
  {
    label: '首页',
    value: HOME_PAGE,
    path: 'undefined',
    children: 'homePage'
  }
  /*{
    label: '商品分组',
    value: 'goodsGroup',
    path: 'packageA/goods/group',
    children: 'goodsGroup'
  },
  {
    label: '资讯详情',
    value: 'information',
    path: 'packageA/information/detail/index',
    children: 'information'
  }*/
]
