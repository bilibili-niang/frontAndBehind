import { computed, defineComponent } from 'vue'
import './PayAmount.scss'
import { UNIFIED_PAYMENT_OPTIONS, UnifiedPayRecordMethodType } from '../../../../../config/payment'

export const PayAmount = defineComponent({
  props: {
    paymentChannelInfos: {
      type: Array
    }
  },
  setup(props) {
    const totalAmount = computed(() => {
      return props.paymentChannelInfos?.reduce((acc, item) => acc + item.payerTotal, 0)
    })

    const mainOptions = UNIFIED_PAYMENT_OPTIONS.filter((i) => i.type === UnifiedPayRecordMethodType.MainPaymentMethod)

    const subOptions = UNIFIED_PAYMENT_OPTIONS.filter((i) => i.type === UnifiedPayRecordMethodType.SubPaymentMethod)

    const mainPaymentAmount = computed(() => {
      const target = props.paymentChannelInfos?.find((item) =>
        mainOptions.find((i) => i.value === item.unifiedPayMethod)
      )
      return target
    })

    const mainPaymentMethod = computed(() => {
      return mainOptions.find((i) => i.value === mainPaymentAmount.value?.unifiedPayMethod)?.label
    })

    const subPaymentAmount = computed(() => {
      const target = props.paymentChannelInfos?.find((item) =>
        subOptions.find((i) => i.value === item.unifiedPayMethod)
      )
      return target
    })

    return () => {
      if (!props.paymentChannelInfos?.length) {
        return null
      }

      if (props.paymentChannelInfos?.length === 1) {
        return (
          <div class="g_pay-amount">
            <div class="g_pay-amount__sub">
              <div class="value">{totalAmount.value / 100}</div>
            </div>
          </div>
        )
      }

      return (
        <div class="g_pay-amount">
          <div class="g_pay-amount__total">
            <div class="value">{totalAmount.value / 100}</div>
            <div class="label">(订单总额)</div>
          </div>
          <div class="sub">-</div>
          <div class="g_pay-amount__main">
            <div class="value">{mainPaymentAmount.value?.payerTotal / 100}</div>
            <div class="label">({mainPaymentMethod.value}抵扣)</div>
          </div>
          <div class="eq">=</div>
          <div class="g_pay-amount__sub">
            <div class="value">{subPaymentAmount.value?.payerTotal / 100}</div>
          </div>
        </div>
      )
    }
  }
})
