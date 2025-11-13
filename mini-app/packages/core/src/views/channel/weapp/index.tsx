import { computed, defineComponent, onMounted, ref } from 'vue'
import './style.scss'
import { Alert, Button, Icon, message } from '@anteng/ui'
import { useRoute } from 'vue-router'
import DevSettings from './dev-settings'
import PermissionList from './permission-list'
import BasicInfo from './basic-info'
import VersionInfo from './version-info'
import { getWeappBasicInfo, getWechatAccountDetail } from '../../../api/weapp'
import { useRequestErrorMessage } from '../../../hooks/useRequestErrorMessage'
import Spin from '../../../components/spin'
import WechatPayApply from './wechat-pay-apply'
import useAppStore from '../../../stores/app'
import { SCENE_STORE, SCENE_VENUE } from '@anteng/config'

export default defineComponent({
  name: 'StoreChannelWeapp',
  setup() {
    const route = useRoute()

    const appStore = useAppStore()
    const needWechatPay = computed(() => {
      return [SCENE_STORE, SCENE_VENUE].includes(appStore.scene)
    })

    const accountId = computed(() => route.params.id as string)
    const loading = ref(false)
    const errorInfo = ref('')
    const weappInfo = ref<any>()
    const reload = () => {
      getInfo(true)
    }
    const nonsupport = () => {
      message.info({
        content: (
          <span>
            暂不支持，请前往&nbsp;
            <a style="text-decoration:underline;" href="https://mp.weixin.qq.com/" target="_blank">
              <strong>微信小程序后台</strong>
            </a>
            &nbsp; 进行操作
          </span>
        )
      })
    }

    const getInfo = (noninductive?: boolean) => {
      if (!noninductive) {
        loading.value = true
      }
      errorInfo.value = ''
      getWeappBasicInfo(accountId.value)
        .then((res: any) => {
          if (res.code === 200) {
            weappInfo.value = res.data
            if (noninductive) {
              message.success('刷新成功')
            }
          } else {
            message.error(res.msg || '小程序信息获取失败！')
            errorInfo.value = res.msg
          }
        })
        .catch((err) => {
          useRequestErrorMessage(err)
          errorInfo.value = err.response.data.msg
        })
        .finally(() => {
          loading.value = false
        })
    }

    onMounted(() => {
      getInfo()
      needWechatPay.value && getAccount()
    })

    const account = ref(undefined)
    const getAccount = () => {
      getWechatAccountDetail(accountId.value)
        .then((res) => {
          account.value = res.data.records?.[0]
          // account.value!.wechatPayApplyment!.status = 0
        })
        .catch((err) => {})
    }

    return () => {
      if (loading.value) {
        return (
          <div class="flex-center">
            <Spin></Spin>
            <strong style="margin: 12px 0 15% 0;">加载中，请稍候...</strong>
          </div>
        )
      } else if (errorInfo.value || !weappInfo.value) {
        return (
          <div class="flex-center">
            <strong style="font-size:20px;">抱歉，出现了异常。</strong>
            <div style="margin: 12px 0 0 0;">
              <a onClick={() => getInfo()}>点击重试</a>
            </div>
            <p style="width:600px;margin: 12px 0 15% 0;">{errorInfo.value}</p>
          </div>
        )
      }

      return (
        <>
          {needWechatPay.value && <WechatPayApply account={account.value} />}
          <div class="weapp-detail">
            <VersionInfo
              onNonsupport={nonsupport}
              accountId={accountId.value}
              account={account.value}
              needWechatPay={needWechatPay.value}
            />
            <BasicInfo
              onNonsupport={nonsupport}
              basicInfo={weappInfo.value}
              account={account.value}
              needWechatPay={needWechatPay.value}
            />
            <DevSettings accountId={accountId.value} onNonsupport={nonsupport} />
            <PermissionList />
          </div>
        </>
      )
    }
  }
})
