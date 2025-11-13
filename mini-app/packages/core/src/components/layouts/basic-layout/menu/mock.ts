export default [
  {
    key: 'goods',
    component: 'PageView',
    icon: 'shopping',
    redirect: '/goods/list',
    name: 'goods',
    title: '商品管理',
    children: [
      {
        key: 'mall',
        path: '/goods/mall',
        name: 'mall',
        title: '商城商品列表',
        children: []
      },
      {
        key: 'mall-create',
        path: '/goods/mall/create',
        meta: {
          show: false
        },
        name: 'mall-create',
        title: '添加商品',
        children: []
      },
      {
        key: 'mall-edit-theme',
        path: '/goods/mall/edit/theme/:id',
        meta: {
          show: false
        },
        name: 'mall-edit-theme',
        title: '编辑商品主题',
        children: []
      },
      {
        key: 'mall-edit',
        path: '/goods/mall/edit/:id',
        meta: {
          show: false
        },
        name: 'mall-edit',
        title: '编辑商品',
        children: []
      },
      {
        key: 'mall-audit',
        path: '/goods/mall/audit/:id',
        meta: {
          show: false
        },
        name: 'mall-audit',
        title: '商城商品审核',
        children: []
      },
      {
        key: 'goods-batch',
        path: '/goods/batch',
        name: 'goods-batch',
        title: '批量修改商品信息',
        children: []
      },
      {
        key: 'goods-batch-create',
        path: '/goods/batch/create',
        meta: {
          show: false
        },
        name: 'goods-batch-create',
        title: '创建规则',
        children: []
      },
      {
        key: 'goods-batch-edit',
        path: '/goods/batch/edit/:id',
        meta: {
          show: false
        },
        name: 'goods-batch-edit',
        title: '编辑规则 ',
        children: []
      },
      {
        key: 'shop',
        path: '/goods/shop',
        name: 'shop',
        title: '小店商品列表',
        children: []
      },
      {
        key: 'shop-detail',
        path: '/goods/shop/detail/:id',
        meta: {
          show: false
        },
        name: 'shop-detail',
        title: '查看小店商品',
        children: []
      },
      {
        key: 'category',
        path: '/goods/category',
        name: 'category',
        title: '后台商品分类',
        children: []
      },
      {
        key: 'shop-audit',
        path: '/goods/shop/audit/:id',
        meta: {
          show: false
        },
        name: 'shop-audit',
        title: '小店商品审核',
        children: []
      },
      {
        key: 'goods-poster',
        path: '/goods/poster/:id',
        meta: {
          show: false
        },
        name: 'goods-poster',
        title: '配置商品分享海报',
        children: []
      },
      {
        key: 'goods-group',
        path: '/goods/group',
        name: 'goods-group',
        title: '商城商品分组',
        children: []
      },
      {
        key: 'goods-group-create',
        path: '/goods/group/create',
        meta: {
          show: false
        },
        name: 'goods-group-create',
        title: '新建商品分组',
        children: []
      },
      {
        key: 'goods-group-edit',
        path: '/goods/group/edit/:id',
        meta: {
          show: false
        },
        name: 'goods-group-edit',
        title: '编辑商品分组',
        children: []
      },
      {
        key: 'goods-group-management',
        path: '/goods/group/:id',
        meta: {
          show: false
        },
        name: 'goods-group-management',
        title: '管理分组商品',
        children: []
      },
      {
        key: 'goods-jdvop',
        path: '/goods/jdvop',
        name: 'goods-jdvop',
        title: '京东vop商品库',
        children: []
      },
      {
        key: 'business-list',
        path: '/businesses',
        name: 'business-list',
        title: '业务列表',
        children: []
      },
      {
        key: 'business-create',
        path: '/businesses/create',
        meta: {
          show: false
        },
        name: 'business-create',
        title: '创建业务',
        children: []
      },
      {
        key: 'business-edit',
        path: '/businesses/edit/:id',
        meta: {
          show: false
        },
        name: 'business-edit',
        title: '编辑业务',
        children: []
      }
    ]
  },
  {
    key: 'brand',
    component: 'PageView',
    icon: 'sketch',
    name: 'brand',
    title: '品牌商家管理',
    children: [
      {
        key: 'brand-merchant',
        path: '/brand/merchant',
        name: 'brand-merchant',
        title: '品牌商家列表',
        children: []
      },
      {
        key: 'brand-merchant-create',
        path: '/brand/merchant/create',
        meta: {
          show: false
        },
        name: 'brand-merchant-create',
        title: '新建品牌商家',
        children: []
      },
      {
        key: 'brand-merchant-edit',
        path: '/brand/merchant/edit/:id',
        meta: {
          show: false
        },
        name: 'brand-merchant-edit',
        title: '编辑品牌商家',
        children: []
      },
      {
        key: 'supplier-shop',
        path: '/supplierShop/supplierShop',
        name: 'supplier-shop',
        title: '品牌门店列表',
        children: []
      },
      {
        key: 'supplier-shop-create',
        path: '/supplierShop/supplierShop/create',
        meta: {
          show: false
        },
        name: 'supplier-shop-create',
        title: '添加门店',
        children: []
      },
      {
        key: 'supplier-shop-edit',
        path: '/supplierShop/supplierShop/edit/:id',
        meta: {
          show: false
        },
        name: 'supplier-shop-edit',
        title: '编辑门店',
        children: []
      },
      {
        key: 'brand-category',
        path: '/brand/category',
        name: 'brand-category',
        title: '品牌商家分类',
        children: []
      }
    ]
  },
  {
    key: 'zones',
    path: '/zones',
    component: 'PageView',
    icon: 'shopping',
    name: 'zones',
    title: '专区管理',
    children: [
      {
        key: 'zone-list',
        path: '/',
        name: 'zone-list',
        title: '专区列表',
        children: []
      }
    ]
  },
  {
    key: 'ecological',
    path: '/ecological',
    component: 'PageView',
    icon: 'shopping',
    name: 'ecological',
    title: '生态商品',
    children: [
      {
        key: 'ecological-goods',
        path: '/ecological/goods',
        name: 'ecological-goods',
        title: '生态商品列表',
        children: []
      },
      {
        key: 'ecological-goods-create',
        path: '/ecological/goods/create',
        meta: {
          show: false
        },
        name: 'ecological-goods-create',
        title: '创建生态商品',
        children: []
      },
      {
        key: 'ecological-goods-edit',
        path: '/ecological/goods/edit/:id',
        meta: {
          show: false
        },
        name: 'ecological-goods-edit',
        title: '编辑生态商品',
        children: []
      },
      {
        key: 'eco-orders-list',
        path: '/ecological/orders',
        name: 'eco-orders-list',
        title: '生态商品订单列表',
        children: []
      }
    ]
  },
  {
    key: 'channel',
    component: 'PageView',
    icon: 'icon-channel',
    redirect: '/organization/city-list',
    name: 'channel',
    title: '渠道管理',
    children: [
      {
        key: 'city-list',
        name: 'city-list',
        title: '地市管理',
        children: []
      },
      {
        key: 'district-list',
        name: 'district-list',
        title: '区县管理',
        children: []
      },
      {
        key: 'ch-city-manager-list',
        name: 'ch-city-manager-list',
        title: '市级渠道管理员',
        children: []
      },
      {
        key: 'ch-district-manager-list',
        name: 'ch-district-manager-list',
        title: '区县渠道管理员',
        children: []
      },
      {
        key: 'ch-company-list',
        name: 'ch-company-list',
        title: '渠道企业管理',
        children: []
      },
      {
        key: 'ch-company-create',
        path: '/channel/ch-company-list/create',
        meta: {
          show: false
        },
        name: 'ch-company-crete',
        title: '添加渠道企业',
        children: []
      },
      {
        key: 'ch-company-edit',
        path: '/channel/ch-company-list/edit/:id',
        meta: {
          show: false
        },
        name: 'ch-company-edit',
        title: '修改渠道企业',
        children: []
      },
      {
        key: 'ch-primary-list',
        name: 'ch-primary-list',
        title: '一级渠道管理',
        children: []
      },
      {
        key: 'ch-secondary-list',
        name: 'ch-secondary-list',
        title: '二级渠道管理',
        children: []
      },
      {
        key: 'ch-partners-list',
        name: 'ch-partners-list',
        title: '合伙人管理',
        children: []
      }
    ]
  },
  {
    key: 'decorate',
    component: 'PageView',
    icon: 'appstore',
    redirect: '/store/decorate',
    name: 'decorate',
    title: '店铺装修',
    children: [
      {
        key: 'navigate-category',
        name: 'navigate-category',
        title: '前台商品分类',
        children: []
      },
      {
        key: 'navigate-category-management',
        path: '/decorate/navigate-category/:id',
        meta: {
          show: false
        },
        name: 'navigate-category-management',
        title: '前台商品分类管理',
        children: []
      },
      {
        key: 'store-decorate-index',
        name: 'store-decorate-index',
        title: '商城首页装修',
        children: []
      },
      {
        key: 'store-decorate-custom',
        name: 'store-decorate-custom',
        title: '商城自定义页面',
        children: []
      },
      {
        key: 'store-decorate-custom-create',
        path: '/decorate/store-decorate-custom-create',
        meta: {
          show: false
        },
        name: 'store-decorate-custom-create',
        title: '添加商城自定义页面',
        children: []
      },
      {
        key: 'store-decorate-custom-edit',
        path: '/decorate/store-decorate-custom-edit/:id',
        meta: {
          show: false
        },
        name: 'store-decorate-custom-edit',
        title: '编辑商城自定义页面',
        children: []
      },
      {
        key: 'store-decorate-audit',
        name: 'store-decorate-audit',
        title: '小店装修审核',
        children: []
      },
      {
        key: 'store-decorate-view',
        path: '/decorate/store-decorate-view/:id',
        meta: {
          show: false
        },
        name: 'store-decorate-view',
        title: '小店装修审核',
        children: []
      }
    ]
  },
  {
    key: 'orders',
    component: 'PageView',
    icon: 'shopping',
    name: 'orders',
    title: '订单管理',
    children: [
      {
        key: 'order-list',
        name: 'order-list',
        title: '统一订单列表',
        children: []
      },
      {
        key: 'after-sale-record-list',
        name: 'after-sale-record-list',
        title: '退货订单列表',
        children: []
      },
      {
        key: 'after-sale-record-detail',
        path: '/orders/after-sale-record-detail/:id',
        meta: {
          show: false
        },
        name: 'after-sale-record-detail',
        title: '退货订单详情',
        children: []
      },
      {
        key: 'supplier-order-list',
        name: 'supplier-order-list',
        title: '供应商订单列表',
        children: []
      },
      {
        key: 'mall-order-list',
        meta: {
          show: false
        },
        name: 'mall-order-list',
        title: '商城订单列表',
        children: []
      },
      {
        key: 'store-order-list',
        meta: {
          show: false
        },
        name: 'store-order-list',
        title: '小店订单列表',
        children: []
      },
      {
        key: 'business-order-list',
        name: 'business-order-list',
        title: '业务订单列表',
        children: []
      },
      {
        key: 'shopping-cart-order-list',
        name: 'shopping-cart-order-list',
        title: '购物车订单列表',
        children: []
      }
    ]
  },
  {
    key: 'finance',
    component: 'PageView',
    meta: {
      show: false
    },
    icon: 'transaction',
    name: 'finance',
    title: '财务管理',
    children: [
      {
        key: 'commission-manage',
        name: 'commission-manage',
        title: '佣金管理',
        children: []
      }
    ]
  },
  {
    key: 'adverts',
    component: 'PageView',
    icon: 'bulb',
    name: 'adverts',
    title: '广告管理',
    children: [
      {
        key: 'advert-list',
        path: '/adverts',
        name: 'advert-list',
        title: '广告内容',
        children: []
      },
      {
        key: 'advert-create',
        path: '/adverts/create',
        meta: {
          show: false
        },
        name: 'advert-create',
        title: '创建广告内容',
        children: []
      },
      {
        key: 'advert-edit',
        path: '/adverts/edit/:id',
        meta: {
          show: false
        },
        name: 'advert-edit',
        title: '编辑广告内容',
        children: []
      },
      {
        key: 'advert-rule-list',
        path: '/adverts/rules',
        name: 'advert-rule-list',
        title: '广告规则',
        children: []
      },
      {
        key: 'advert-rule-create',
        path: '/adverts/rules/create',
        meta: {
          show: false
        },
        name: 'advert-rule-create',
        title: '创建广告规则',
        children: []
      },
      {
        key: 'advert-rule-edit',
        path: '/adverts/rules/edit/:id',
        meta: {
          show: false
        },
        name: 'advert-rule-edit',
        title: '编辑广告规则',
        children: []
      },
      {
        key: 'advert-recommend',
        path: '/adverts/recommend',
        name: 'advert-recommend',
        title: '商品推荐',
        children: []
      }
    ]
  },
  {
    key: 'discount',
    component: 'PageView',
    icon: 'account-book',
    name: 'discount',
    title: '优惠管理',
    children: [
      {
        key: 'coupon-group',
        path: '/card/group',
        name: 'coupon-group',
        title: '优惠活动',
        children: []
      },
      {
        key: 'coupon-group-create',
        path: '/card/group/create',
        meta: {
          show: false
        },
        name: 'coupon-group-create',
        title: '创建优惠活动',
        children: []
      },
      {
        key: 'coupon-group-edit',
        path: '/card/group/edit/:id',
        meta: {
          show: false
        },
        name: 'coupon-group-edit',
        title: '编辑优惠活动',
        children: []
      },
      {
        key: 'coupon-group-send-list',
        path: '/card/group/sendList',
        meta: {
          show: false
        },
        name: 'coupon-group-send-list',
        title: '定向发放用户清单',
        children: []
      },
      {
        key: 'coupon-poster',
        path: '/card/poster',
        name: 'coupon-poster',
        title: '推广海报',
        children: []
      },
      {
        key: 'coupon-poster-create',
        path: '/card/poster/create',
        meta: {
          show: false
        },
        name: 'coupon-poster-create',
        title: '创建活动海报',
        children: []
      },
      {
        key: 'coupon-poster-edit',
        path: '/card/poster/edit/:id',
        meta: {
          show: false
        },
        name: 'coupon-poster-edit',
        title: '编辑活动海报',
        children: []
      }
    ]
  }
]
