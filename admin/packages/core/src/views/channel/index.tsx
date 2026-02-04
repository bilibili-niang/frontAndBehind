import { computed, defineComponent, onMounted, ref } from 'vue'
import './style.scss'
import STORE from '../../assets/channel/store.svg'
import MP from '../../assets/channel/mp.svg'
import OA from '../../assets/channel/oa.svg'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { Modal } from '@pkg/ui'
import type { IWechatAccountRecord } from '../../api/weapp/types'
import { getWechatAccountList } from '../../api/weapp'
import useGenerateQrcode from '../../hooks/useGenerateQrcode'
import usePreviewPage from '../../hooks/usePreviewPage'
import { PageView } from '../../router'
import useUserStore from '../../stores/user'
import useGlobalStore from '../../../../../apps/cs/home/src/stores/global'
import useAppStore from '../../stores/app'

export default defineComponent({
  name: 'StoreChannel',
  setup(props, { slots }) {
    const router = useRouter()
    const route = useRoute()
    const appStore = useAppStore()

    const wechatLoading = ref(false)
    const wechatInitialized = ref(false)
    const wechatAccounts = ref<any[]>([])

    // const mockWechatAccounts = ref<IWechatAccountRecord[]>([
    //   {
    //     id: 1714205969242783700, // accountId
    //     merchantId: '1692472512249634817',
    //     merchantName: '合作商-测试',
    //     appId: 'wxd682b23211684769',
    //     type: 1, // 0 公众号，1 小程序
    //     typeText: '小程序',
    //     name: '数字家园',
    //     sourceType: 0, // 0 授权， 1 快速注册小程序， 2 注册试用小程序， 3 复用公众号注册小程序
    //     sourceTypeText: '授权',
    //     scene: 'home',
    //     status: 1, // 0 取消授权，1 已授权，2 授权中
    //     statusText: '已授权'
    //   },
    //   {
    //     id: 1714205969242783700, // accountId
    //     merchantId: '1692472512249634817',
    //     merchantName: '合作商-测试',
    //     appId: 'wxd682b23211684769',
    //     type: 1, // 0 公众号，1 小程序
    //     typeText: '小程序',
    //     name: '授权已有小程序，授权中',
    //     sourceType: 0, // 0 授权， 1 快速注册小程序， 2 注册试用小程序， 3 复用公众号注册小程序
    //     sourceTypeText: '授权',
    //     scene: 'home',
    //     status: 2, // 0 取消授权，1 已授权，2 授权中
    //     statusText: '已授权'
    //   },
    //   {
    //     id: 1714205969242783700, // accountId
    //     merchantId: '1692472512249634817',
    //     merchantName: '合作商-测试',
    //     appId: 'wxd682b23211684769',
    //     type: 1, // 0 公众号，1 小程序
    //     typeText: '小程序',
    //     name: '快速注册小程序，注册中',
    //     sourceType: 1, // 0 授权， 1 快速注册小程序， 2 注册试用小程序， 3 复用公众号注册小程序
    //     sourceTypeText: '授权',
    //     scene: 'home',
    //     status: 2, // 0 取消授权，1 已授权，2 授权中
    //     statusText: '已授权'
    //   },
    //   {
    //     id: 1714205969242783700, // accountId
    //     merchantId: '1692472512249634817',
    //     merchantName: '合作商-测试',
    //     appId: 'wxd682b23211684769',
    //     type: 1, // 0 公众号，1 小程序
    //     typeText: '小程序',
    //     name: '注册试用小程序，注册中',
    //     sourceType: 2, // 0 授权， 1 快速注册小程序， 2 注册试用小程序， 3 复用公众号注册小程序
    //     sourceTypeText: '授权',
    //     scene: 'home',
    //     status: 2, // 0 取消授权，1 已授权，2 授权中
    //     statusText: '已授权'
    //   },
    //   {
    //     id: 1714205969242783700, // accountId
    //     merchantId: '1692472512249634817',
    //     merchantName: '合作商-测试',
    //     appId: 'wxd682b23211684769',
    //     type: 1, // 0 公众号，1 小程序
    //     typeText: '小程序',
    //     name: '复用公众号注册小程序，注册中',
    //     sourceType: 3, // 0 授权， 1 快速注册小程序， 2 注册试用小程序， 3 复用公众号注册小程序
    //     sourceTypeText: '授权',
    //     scene: 'home',
    //     status: 2, // 0 取消授权，1 已授权，2 授权中
    //     statusText: '已授权'
    //   }
    // ])

    // const hasNoWechatAccount = computed(() => {
    //   return !(wechatAccounts.value.length > 0)
    // })

    onMounted(() => {
      wechatLoading.value = true
      getWechatAccountList()
        .then((res) => {
          wechatAccounts.value = res.data.records
          wechatInitialized.value = true
        })
        .catch((err) => {})
        .finally(() => {
          wechatLoading.value = false
        })
    })

    const toCreateWeapp = () => {
      router.push({
        name: 'store-channel-weapp-sign'
      })
    }

    const toWeapp = (item: IWechatAccountRecord) => {
      router.push({
        name: 'store-channel-weapp',
        params: {
          id: item.id
        }
      })
    }

    const showQrcode = () => {
      useGenerateQrcode(
        {
          // TODO 这里要改店铺id、域名
          text: `${useGlobalStore().previewURL}?m=${useUserStore().userInfo?.merchantId}`
        },
        (src: string) => {
          Modal.open({
            title: 'H5应用二维码',
            content: (
              <div class="store-channel-h5-qrcode">
                <p style="text-indent: 8px;">保存二维码，嵌入海报中进行推广。</p>
                <div class="qrcode-image">
                  <img draggable src={src} alt="" />
                </div>
              </div>
            )
          })
        }
      )
    }

    const showLink = () => {
      usePreviewPage({
        url: useGlobalStore().previewURL,
        title: 'H5应用'
      })
    }

    const continueSign = (item: IWechatAccountRecord) => {
      const actions = {
        0: () => {
          router.push({
            name: 'store-channel-weapp-bind'
          })
        },
        1: () => {
          router.push({
            name: 'store-channel-weapp-create'
          })
        },
        2: () => {
          router.push({
            name: 'store-channel-weapp-trial'
          })
        },
        3: () => {
          router.push({
            name: 'store-channel-weapp-oa'
          })
        }
      }
      ;(actions as any)[item.sourceType as any]?.()
    }

    const useWeappCard = (item: IWechatAccountRecord) => {
      if (item.type === 0) {
        return (
          <div class="store-channel-card">
            <div class="store-channel-card__content">
              <div class="store-channel-card__icon">
                <img src={OA} />
              </div>
              <div class="store-channel-card__name">{item.name}</div>
              <div class="store-channel-card__desc">已授权公众号</div>
            </div>
          </div>
        )
      }

      return (
        <div class="store-channel-card">
          <div class="store-channel-card__content">
            <div class="store-channel-card__icon">
              <img src={MP} />
            </div>
            <div class="store-channel-card__name">{item.name || item.sourceTypeText}</div>
            <div class="store-channel-card__desc">将您的H5应用发布为微信小程序</div>
          </div>
          <div class="store-channel-card__actions">
            {item.status === 1 ? (
              <a href="javascript:void(0)" onClick={() => toWeapp(item)}>
                前往管理小程序
              </a>
            ) : (
              <a href="javascript:void(0)" onClick={() => continueSign(item)}>
                继续注册
              </a>
            )}
          </div>
        </div>
      )
    }

    const wxOaVisible = computed(() => {
      return wechatInitialized.value && !wechatAccounts.value.find((item) => item.type === 0)
    })

    const onWxOaAuth = () => {
      location.href = `${
        import.meta.env.VITE_APP_REQUEST_BASE_URL
      }/null-cornerstone-wechat/open/authUrl?merchant_id=${useUserStore().userInfo?.merchantId}&scene=${
        useAppStore().scene
      }`
    }

    return () => {
      if (route.name !== 'store-channel') {
        return <RouterView />
      }
      return (
        <PageView class="store-channel-page">
          <h2 class="store-channel-title">经营渠道管理</h2>
          <div class="store-channel-list">
            {wechatAccounts.value.length === 0 && (
              <div class="store-channel-card">
                <div class="store-channel-card__content">
                  <div class="store-channel-card__icon">
                    <img src={MP} />
                  </div>
                  <div class="store-channel-card__name">微信小程序</div>
                  <div class="store-channel-card__desc">将您的H5应用发布为微信小程序</div>
                </div>
                <div class="store-channel-card__actions">
                  <a href="javascript:void(0)" onClick={toCreateWeapp}>
                    前往创建
                  </a>
                </div>
              </div>
            )}
            {wechatAccounts.value.map(useWeappCard)}
            <div class="store-channel-card">
              <div class="store-channel-card__content">
                <div class="store-channel-card__icon">
                  <img src={STORE} />
                </div>
                <div class="store-channel-card__name">H5应用</div>
                <div class="store-channel-card__desc">请点击操作栏获取H5访问地址</div>
              </div>
              <div class="store-channel-card__actions">
                <a href="javascript:void(0)" onClick={showQrcode}>
                  二维码
                </a>
                <a href="javascript:void(0)" onClick={showLink}>
                  访问链接
                </a>
                {wxOaVisible.value && (
                  <a href="javascript:void(0)" onClick={onWxOaAuth}>
                    公众号授权
                  </a>
                )}
              </div>
            </div>
          </div>
          {/* <div style="margin-top: 48px; padding-left: 12px;" class="color-disabled">
            以下为模拟数据，各个注册场景状态、进度
          </div> */}
          {slots.default?.()}
        </PageView>
      )
    }
  }
})
