import { Icon } from '@anteng/ui'
import { computed, defineComponent, onUnmounted, PropType, watch, withModifiers } from 'vue'
import './style.scss'
import { EmptyStatus, RichText, useCountdown, useModal } from '@anteng/core'
import { renderAnyNode } from '../../../../../../../packages/utils/src/render'
import dayjs from 'dayjs'
import { formatPrice } from '@anteng/utils'
import { COUPON_SCOPE_OPTIONS } from '../../../../api/discount-coupon/types'

export default defineComponent({
  props: {
    name: {
      required: true
    },
    withWrap: {
      type: Boolean,
      default: false
    },
    disabled: Boolean,
    tips: {},
    button: {},

    amount: {
      type: Number,
      required: true
    },
    threshold: {
      type: Number,
      required: true
    },
    useRules: {},
    validDate: {
      type: String
    },
    validDateText: {
      type: String
    },
    scope: {
      type: Number
    },
    stamp: String,
    stampSize: {
      type: String as PropType<'small' | 'normal'>
    }
  },
  setup(props) {
    const showRules = () => {
      useModal({
        title: '使用说明',
        height: 'auto',
        content: () => {
          return (
            <div
              style={{
                minHeight: '40vh'
              }}
            >
              {!props.useRules && <EmptyStatus textOnly />}
              {typeof props.useRules === 'string' ? (
                <RichText content={props.useRules} />
              ) : (
                renderAnyNode(props.useRules)
              )}
            </div>
          )
        }
      })
    }

    const validDate = computed(() => props.validDate)
    const validDateText = computed(() => {
      if (props.validDateText) return props.validDateText

      if (lessThenOneDay.value) {
        if (countdownSeconds.value <= 0) return ''

        return `将在 ${countdownTime.value} 后失效`
      }
      const d = dayjs(validDate.value)

      if (d.isValid()) {
        return `有效期至 ${d.format('YYYY.MM.DD HH:mm:ss')}`
      }
      return ''
    })

    const lessThenOneDay = computed(() => {
      if (!validDate.value) return false
      // 小于24小时时才显示倒计时，否则显示静态的过期时间
      return dayjs().diff(dayjs(validDate.value), 'h') > -24
    })

    const { countdownTime, countdownSeconds, stopCountdown, resumeCountdown } = useCountdown(
      validDate.value || '2099-12-31 12:00:00'
    )
    stopCountdown()

    watch(
      () => lessThenOneDay.value,
      () => {
        if (lessThenOneDay.value) {
          resumeCountdown()
        }
      },
      { immediate: true }
    )

    onUnmounted(() => {
      stopCountdown()
    })

    const amount = computed(() => {
      return formatPrice(props.amount)
    })

    const integer = computed(() => {
      return amount.value.split('.')[0]
    })

    const decimal = computed(() => {
      return amount.value.split('.')[1]
    })

    const disabled = computed(() => props.disabled)

    const scope = computed(() => {
      return COUPON_SCOPE_OPTIONS.find(i => i.value === props.scope)?.label
    })

    /** 门槛金额 */
    const thresholdText = computed(() => {
      if (props.threshold > 0) {
        return `满 ${formatPrice(props.threshold)} 可用`
      } else if (props.threshold === 0) {
        return '无门槛'
      }
      return ''
    })

    const Content = () => {
      return (
        <div class={['c_coupon-item', disabled.value && 'disabled']}>
          <div class="c_coupon-item__main">
            <div class="c_coupon-item__amount">
              <div class="c_coupon-item__amount-content">
                <div class="value-wrap">
                  <div class="value number-font">
                    <div class="yen">&yen;</div>
                    <div class="integer">{integer.value}</div>
                    {decimal.value && <div class="decimal">.{decimal.value}</div>}
                  </div>
                  <div class="label">{thresholdText.value}</div>
                </div>
                <div class="helper" onClick={withModifiers(showRules, ['stop'])}>
                  {/* <Icon name="help" /> */}
                  &nbsp;使用说明
                  <Icon name="right" />
                </div>
              </div>
            </div>
            <div class="c_coupon-item__split"></div>
            <div class="c_coupon-item__info">
              {props.stamp && <div class={['c_coupon-item__stamp', props.stampSize]}>{props.stamp}</div>}
              <div class="c_coupon-item__info-content">
                <div class="name max-2-rows">{renderAnyNode(props.name)}</div>
                <div class="desc">{scope.value}</div>
                <div class={['valid', lessThenOneDay.value && 'count-down']}>{validDateText.value}</div>
              </div>
              {props.button && <div class="c_coupon-item__button">{renderAnyNode(props.button)}</div>}
            </div>
          </div>
          {props.tips && <div class="c_coupon-item__footer">{renderAnyNode(props.tips)}</div>}
          {/* {disabled.value && props.disabledReason && (
            <div class="c_coupon-item__footer">
              <div>
                <Icon name="help" />
                &nbsp;{props.disabledTitle}：
              </div>
              <div class="color-secondary">{props.disabledReason}</div>
            </div>
          )} */}
        </div>
      )
    }

    return () => {
      if (props.withWrap) {
        return (
          <div class="c_coupon-item-wrap">
            <Content />
          </div>
        )
      }
      return <Content />
    }
  }
})

export const CouponItemButton = (props: {
  text: string
  primary?: boolean
  centered?: boolean
  onClick?: () => void
}) => {
  return (
    <div class={['c_coupon-item__common-button', props.primary && 'primary', props.centered && 'centered']}>
      {props.text}
    </div>
  )
}
