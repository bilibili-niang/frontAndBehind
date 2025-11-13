import { PAYMENT_CHANNEL_OPTIONS, UNIFIED_PAYMENT_OPTIONS } from '@anteng/config'
import { Tooltip } from '@anteng/ui'
import { defineComponent } from 'vue'

export const PaymentChannelInfo = defineComponent({
  props: {
    paymentChannelInfos: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    return () => {
      if (!props.paymentChannelInfos?.length) {
        return <div class="color-disabled">无支付信息记录</div>
      }

      return (
        <div>
          {props?.paymentChannelInfos?.map((item, index) => {
            const channel = PAYMENT_CHANNEL_OPTIONS.find((i) => i.value === item.payChannel)?.label || '-'
            const text = UNIFIED_PAYMENT_OPTIONS.find((i) => i.value === item.unifiedPayMethod)?.label ?? channel

            const amount = ((item.totalAmount ?? item.payerTotal) / 100).toFixed(2)

            return (
              <>
                {index > 0 && <span> ＋ </span>}
                <Tooltip
                  title={
                    <div>
                      <div>支付金额：&yen;{amount}</div>
                      <div>支付渠道：{channel}</div>
                      <div>
                        收款账户：
                        <small>
                          {item.receivingAccountName ?? item.receivingAccountId ?? item.receivingAccountMchId ?? '-'}
                        </small>
                      </div>
                      <div>
                        交易单号：
                        <small>{item.tradeNo}</small>
                      </div>
                    </div>
                  }
                >
                  <a>{text}</a>
                </Tooltip>
              </>
            )
          })}
        </div>
      )
    }
  }
})
