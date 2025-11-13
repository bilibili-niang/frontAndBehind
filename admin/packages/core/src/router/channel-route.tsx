import { defineAsyncComponent, defineComponent } from 'vue'

const AsyncChannel = defineAsyncComponent(() => import('../views/channel/index'))

export default (basePath: string, defaultSlot?: () => any) => {
  const Channel = defineComponent({
    setup(props, { slots }) {
      return () => {
        return <AsyncChannel>{defaultSlot?.()}</AsyncChannel>
      }
    }
  })
  return {
    path: `${basePath}/channel`,
    name: 'store-channel',
    component: Channel,
    meta: {
      title: '经营渠道'
    },
    children: [
      {
        path: `${basePath}/channel/weapp/:id`,
        name: 'store-channel-weapp',
        component: () => import('../views/channel/weapp'),
        meta: {
          title: '微信小程序',
          hiddenInMenu: true
        }
      },
      {
        path: `${basePath}/channel/weapp-sign`,
        name: 'store-channel-weapp-sign',
        component: () => import('../views/channel/weapp-sign'),
        meta: {
          title: '选择小程序注册场景',
          hiddenInMenu: true
        },
        children: [
          {
            path: `${basePath}/channel/weapp-sign/bind`,
            name: 'store-channel-weapp-bind',
            component: () => import('../views/channel/weapp-sign/views/bind'),
            meta: {
              title: '授权绑定已有小程序',
              hiddenInMenu: true
            }
          },
          {
            path: `${basePath}/channel/weapp-sign/trial`,
            name: 'store-channel-weapp-trial',
            component: () => import('../views/channel/weapp-sign/views/trial'),
            meta: {
              title: '创建试用小程序',
              hiddenInMenu: true
            }
          },
          {
            path: `${basePath}/channel/weapp-sign/oa`,
            name: 'store-channel-weapp-oa',
            component: () => import('../views/channel/weapp-sign/views/oa'),
            meta: {
              title: '复用公众号主体创建小程序',
              hiddenInMenu: true
            }
          },
          {
            path: `${basePath}/channel/weapp-sign/create`,
            name: 'store-channel-weapp-create',
            component: () => import('../views/channel/weapp-sign/views/create'),
            meta: {
              title: '快速创建小程序',
              hiddenInMenu: true
            }
          }
        ]
      }
    ]
  }
}
