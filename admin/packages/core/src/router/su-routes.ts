import BasicLayout from '../components/layouts/basic-layout'
import { RouterView } from 'vue-router'

export default [
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    redirect: '/product',
    meta: {
      showLabelTab: true
    },
    children: [
      {
        path: '/product',
        name: 'su-product',
        meta: {
          title: '产品管理',
          icon: 'ad-product'
        },
        component: RouterView,
        redirect: '/product/list',
        children: [
          {
            path: '/product/list',
            name: 'su-product-list',
            meta: {
              title: '产品列表'
            },
            component: () => import('../views/test2'),
            children: []
          }
        ]
      },
      {
        path: '/merchant',
        name: 'su-merchant',
        meta: {
          title: '合作商管理',
          icon: 'people-top-card'
        },
        component: RouterView,
        redirect: '/merchant/list',
        children: [
          {
            path: '/merchant/list',
            name: 'su-merchant-list',
            meta: {
              title: '合作商列表'
            },
            component: () => import('../views/test2'),
            children: []
          },
          {
            path: '/merchant/pay',
            name: 'su-merchant-pay',
            meta: {
              title: '合作商支付管理'
            },
            component: () => import('../views/test2'),
            children: []
          }
        ]
      },
      {
        path: '/agreement',
        name: 'su-agreement',
        meta: {
          title: '协议管理',
          icon: 'agreement'
        },
        component: RouterView,
        children: [
          {
            path: '/agreement/list',
            name: 'su-agreement-list',
            meta: {
              title: '协议列表'
            },
            component: () => import('../views/test2'),
            children: []
          },
          {
            path: '/agreement/sign-record',
            name: 'su-agreement-sign-record',
            meta: {
              title: '签约记录'
            },
            component: () => import('../views/test2'),
            children: []
          }
        ]
      },
      {
        path: '/license',
        name: 'su-license',
        component: RouterView,
        meta: {
          title: '合作商权限管理',
          icon: 'permissions'
        },
        redirect: '/license/list',
        children: [
          {
            path: '/license/list',
            name: 'su-license-list',
            meta: {
              title: '合作商产品权限'
            },
            component: () => import('../views/test2'),
            children: []
          },
          {
            path: '/license/order',
            name: 'su-license-order',
            meta: {
              title: '产品许可订单表'
            },
            component: () => import('../views/test2'),
            children: []
          }
        ]
      },
      {
        path: '/finance',
        name: 'su-finance',
        component: RouterView,
        meta: {
          title: '财务管理',
          icon: 'finance'
        },
        redirect: '/finance/app-income',
        children: [
          {
            path: '/finance/app-income',
            name: 'su-finance-app-income',
            meta: {
              title: '应用销售收入'
            },
            component: () => import('../views/test2'),
            children: []
          },
          {
            path: '/finance/trade-record',
            name: 'su-finance-trade-record',
            meta: {
              title: '线上交易记录'
            },
            component: () => import('../views/test2'),
            children: []
          }
        ]
      }
    ]
  }
]
