import { computed, defineComponent } from 'vue'
import './style.scss'
import { useDetailView, useModal, usePreviewPage, useResponseMessage, useWebView } from '@anteng/core'
import { $getOpenAppCashierDetail, $getOpenAppCashierMallURL } from '../../../../api/open/cashier'
import { InfoList } from '@anteng/ui'

const CashierDetail = defineComponent({
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { getDetail, loading, DetailView, detail } = useDetailView({
      id: props.appId,
      requestHandler: () => {
        return $getOpenAppCashierDetail(props.id)
      }
    })

    const PrivateContent = (value: string) => {
      return <div>{value.slice(0, 4) + ' ******** ' + value.slice(-4, -1)}</div>
    }

    const list = computed(() => {
      const {
        appId,
        appName,
        thirdPublicKey,
        thirdPrivateKey,
        merchantPublicKey,
        merchantPrivateKey,
        shoppingMallUrl,
        orderConfirmUrl,
        orderDetailUrl,
        timeout,
        createTime,
        updateTime
      } = detail.value
      return [
        { label: '应用ID', value: appId },
        { label: '应用名称', value: appName },
        { label: '第三方公钥', value: PrivateContent(thirdPublicKey), copy: thirdPublicKey },
        { label: '第三方秘钥', value: PrivateContent(thirdPrivateKey), copy: thirdPrivateKey },
        { label: '商户公钥', value: PrivateContent(merchantPublicKey), copy: merchantPublicKey },
        { label: '商户私钥', value: PrivateContent(merchantPrivateKey), copy: merchantPrivateKey },
        { label: '商城页面完整url地址', value: shoppingMallUrl },
        { label: '订单支付确认api地址', value: orderConfirmUrl },
        { label: '订单详情页', value: orderDetailUrl },
        { label: '请求超时时间', value: timeout + '（秒）' },
        { label: '创建时间', value: createTime },
        { label: '更新时间', value: updateTime }
      ]
    })

    return () => {
      return (
        <div class="open-app-cashier-detail">
          <DetailView class="ca">
            <InfoList list={list.value} />
          </DetailView>
        </div>
      )
    }
  }
})

export default CashierDetail

export const onCashierDetailModal = (id: string) => {
  useModal({
    title: '收银台详情',
    content: () => {
      return <CashierDetail id={id} />
    }
  })
}

export const onCashierMallModal = (appId: string) => {
  $getOpenAppCashierMallURL(appId)
    .then((res) => {
      useResponseMessage(res)
      if (res.data) {
        usePreviewPage({
          url: res.data,
          title: '商城链接'
        })
      }
    })
    .catch((err) => {
      useResponseMessage(err)
    })
}
