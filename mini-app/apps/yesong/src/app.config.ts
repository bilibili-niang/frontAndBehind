export default defineAppConfig({
  pages: ['pages/launch', 'pages/404', 'pages/login'],
  subPackages: [
    {
      root: 'packageMain',
      pages: ['index', 'web', 'custom', 'category', 'cart', 'profile']
    },
    {
      root: 'packageA',
      pages: [
        'community/detail/index',
        'community/publish/index',
        'creative/detail/index',
        'goods/detail',
        'goods/list',
        'goods/group',
        'order/list/index',
        'order/detail/index',
        'order/pay/index',
        'order/after-sale/index',
        'order/after-sale/result',
        'pay/result',
        'search/index',
        'wallet/index',
        'coupon/list/index',
        'information/list/index',
        'information/detail/index',
        'goods/poster/index',
        'posterMaking/list/index',
        'posterMaking/create/index',
        'category/index',
      ]
    },
    {
      root: 'packageOther',
      pages: ['settings/index', 'settings/nickname', 'jd-cashier/index']
    },
    {
      root: 'packageDokit',
      pages: ['index', 'demo']
    },
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    backgroundColor: '#f5f5f5',
    navigationBarTitleText: ' ',
    navigationBarTextStyle: 'black'
  },
  enableShareAppMessage: true,
  enableShareTimeline: false,
  requiredPrivateInfos: ['chooseAddress', 'getLocation'],
  permission: {
    'scope.userLocation': {
      desc: '你的位置信息将用于小程序位置接口的效果展示' // 高速公路行驶持续后台定位
    }
  }
})
