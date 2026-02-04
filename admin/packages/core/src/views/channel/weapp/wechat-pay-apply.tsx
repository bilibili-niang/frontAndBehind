import { Alert, Button } from '@pkg/ui'
import { computed, defineComponent } from 'vue'
import { useWechatPayApply } from '../../../../../../apps/cs/center/src/views/finance/wechat-pay-apply'
import {
  WECHATPAY_APPLY_STAUS_CLOSED,
  WECHATPAY_APPLY_STAUS_COMPLETED,
  WECHATPAY_APPLY_STAUS_FROZEN,
  WECHATPAY_APPLY_STAUS_OPTIONS,
  WECHATPAY_APPLY_STAUS_SIGN,
  WECHATPAY_APPLY_STAUS_VALIDATE
} from '../../../../../../apps/cs/center/src/views/finance/wechat-pay-apply/constants'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: '',
  props: {
    account: {
      type: Object
    }
  },
  setup(props) {
    const router = useRouter()
    const id = computed(() => props.account?.wechatPayApplyment?.id)
    const status = computed(() => props.account?.wechatPayApplyment?.status)

    const { onCreate, onRead, onResubmit, validateWechatPayAccouunt, signWechatPayAccouunt, data, getData } =
      useWechatPayApply(
        id,
        computed(() => props.account?.appId)
      )

    getData()

    const onApply = () => {
      onCreate()
    }

    const refreshPage = () => {
      setTimeout(() => {
        router.go(0)
      }, 300)
    }

    const Actions = (): any => {
      if (status.value === undefined || status.value === null) {
        return (
          <Button type="primary" onClick={onApply}>
            提交申请
          </Button>
        )
      }

      return [
        ![WECHATPAY_APPLY_STAUS_CLOSED, WECHATPAY_APPLY_STAUS_FROZEN].includes(status.value) && (
          <Button style="margin-left:8px;" onClick={() => onRead()}>
            查看申请单
          </Button>
        ),
        status.value === WECHATPAY_APPLY_STAUS_VALIDATE && (
          <Button
            type="primary"
            style="margin-left:8px;"
            onClick={() => {
              validateWechatPayAccouunt()
            }}
          >
            账户校验
          </Button>
        ),
        [WECHATPAY_APPLY_STAUS_CLOSED, WECHATPAY_APPLY_STAUS_FROZEN].includes(status.value) && (
          <Button type="primary" style="margin-left:8px;" onClick={() => onResubmit().finally(refreshPage)}>
            重新提交
          </Button>
        ),
        status.value === WECHATPAY_APPLY_STAUS_SIGN && (
          <Button
            type="primary"
            style="margin-left:8px;"
            onClick={() => {
              signWechatPayAccouunt()
            }}
          >
            签约
          </Button>
        )
      ]
    }

    return () => {
      if (status.value === WECHATPAY_APPLY_STAUS_COMPLETED) {
        // 已完成申请，不显示
        return null
      }

      return (
        <div class="weapp-pay-block">
          <h2>微信支付能力</h2>
          <Alert
            type="error"
            showIcon
            class="color-error"
            message="当前小程序尚未开通微信支付能力，无法进行订单支付，请在小程序发布之前完成申请。如已完成过微信支付进件申请，请联系平台客服。"
          />
          <div class="weapp-pay-content">
            <div>
              当前状态：{WECHATPAY_APPLY_STAUS_OPTIONS.find((item) => item.value === status.value)?.label || '未申请'}
            </div>
            {data.value?.remark && <div>（{data.value.remark}）</div>}
          </div>
          <Actions />
        </div>
      )
    }
  }
})
