import './order-item.scss'
import { computed, defineComponent, ref } from 'vue'
import { Icon } from '@anteng/ui'
import { Image, RichText } from '@tarojs/components'
import '@nutui/nutui-taro/dist/packages/ellipsis/index.css'
import { COUPON_STATUS_OPTIONS, COUPON_STATUS_PENDING_USE } from '../../../constants'
import { navigateToOrderDetail } from '../../../router'

export default defineComponent({
  name: 'OrderItem',
  props: {
    coupons: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const showCardInfo = ref(false)

    const useableCount = computed(() => {
      return props.coupons.filter((item: any) => {
        return item.status === COUPON_STATUS_PENDING_USE
      }).length
    })

    return () => {
      const item: any = props.coupons?.[0]
      if (!item) return null
      return (
        <div
          class={['coupon-order-list-item', item.status !== COUPON_STATUS_PENDING_USE && 'coupon-order-list-item-dark']}
        >
          <div class="top-item-info" onClick={() => navigateToOrderDetail(item.mainOrderNo)}>
            <div class="left-coupon-image-content">
              <Image class="coupon-image" mode="aspectFill" src={item.goodsImages[0]} />
            </div>
            <div class="right-text-content">
              <div class="top-text">
                <div class="goods-name-status-container">
                  <div class="coupon-goods-name max-2-rows">{item.goodsName}</div>
                  <div class="coupon-status">
                    {item.status === COUPON_STATUS_PENDING_USE ? (
                      <div class="go-to-use">去使用</div>
                    ) : (
                      <div class="unuse-div">{COUPON_STATUS_OPTIONS.find(it => it.value === item.status)?.label}</div>
                    )}
                  </div>
                </div>
                {item.cardInfo && <div class="cardInfo">{item.cardInfo}</div>}
                {useableCount.value > 0 && (
                  <div class="use-time">
                    可用券码
                    <div class="h5-span color-primary">&nbsp;{useableCount.value}&nbsp;张</div>
                  </div>
                )}
                {/* <div class="use-time">
                  可用次数&nbsp;
                  <div class="h5-span color-primary">{item.availableTimes}</div>
                  &nbsp;次
                </div> */}
              </div>
              <div class="expireEndAt">有效期至{item.expireEndAt}</div>
            </div>
          </div>
          {item?.mustKnow && (
            <div class="dividingLine">
              <div class="pre-arc"></div>
              <div class="end-arc"></div>
            </div>
          )}

          {item?.mustKnow && (
            <div
              class="bottom-coupon-notice"
              onClick={() => {
                showCardInfo.value = !showCardInfo.value
              }}
            >
              <div class="left-text-content">购买须知</div>
              <div class="right-arrow">{showCardInfo.value ? <Icon name="down-fill" /> : <Icon name="play" />}</div>
            </div>
          )}
          {showCardInfo.value && (
            <div class="cardInfo must-know-content">
              <RichText nodes={item?.mustKnow} />
            </div>
          )}
        </div>
      )
    }
  }
})
