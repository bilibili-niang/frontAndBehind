import { RichText } from '@tarojs/components'
import { computed, defineComponent, PropType } from 'vue'
import './style.scss'
import { Fold, Icon } from '@anteng/ui'
import { IGoodsDetail } from '../../../../api/goods/types'
import { COMMON_STATUS_ON, GOODS_TYPE_STORE_VERIFICATION } from '../../../../constants'
import { calcGoodsUnusableTimeText, calcGoodsUsableTimeText, calcGoodsValidTimeText } from '../../../../utils/goods'

export default defineComponent({
  name: 'GoodsDetailMustKnow',
  props: {
    goodsDetail: {
      type: Object as PropType<IGoodsDetail>,
      required: true
    }
  },
  setup(props) {
    if (!props.goodsDetail.mustKnow) return null
    return () => {
      if (props.goodsDetail.type === GOODS_TYPE_STORE_VERIFICATION) {
        return <StoreVerifTypeGoodsMustKnow goodsDetail={props.goodsDetail} />
      }
      return (
        <div class="goods-detail-must-know">
          <div class="main-title">购买须知</div>
          <div class="main-content">
            <Fold>
              <RichText nodes={props.goodsDetail.mustKnow} />
            </Fold>
          </div>
        </div>
      )
    }
  }
})

/** 门店核销类商品购买须知 */
export const StoreVerifTypeGoodsMustKnow = defineComponent({
  props: {
    goodsDetail: {
      type: Object as PropType<IGoodsDetail>,
      required: true
    }
  },
  setup(props) {
    const goodsUnusableTimeText = computed(() => calcGoodsUnusableTimeText(props.goodsDetail))
    const aheadDays = computed(() => {
      if (props.goodsDetail.needAhead !== COMMON_STATUS_ON) {
        return 0
      }
      return Number.isNaN(Number(props.goodsDetail.aheadDays)) ? 0 : props.goodsDetail.aheadDays
    })
    return () => {
      return (
        <div class="goods-detail-must-know">
          <div class="main-title">购买须知</div>
          {aheadDays.value > 0 && (
            <div class="must-know__group">
              <div class="must-know__group-title">
                <Icon name="info" />
                提前购买
              </div>
              <div class="must-know__group-content" style="display:flex;">
                需提前&nbsp;<div class="color-primary">{aheadDays.value}</div>&nbsp;天购买
              </div>
            </div>
          )}
          <div class="must-know__group">
            <div class="must-know__group-title">
              <Icon name="plan" />
              有效期
            </div>
            <div class="must-know__group-content">{calcGoodsValidTimeText(props.goodsDetail)}</div>
          </div>
          <div class="must-know__group">
            <div class="must-know__group-title">
              <Icon name="time" />
              可用时间
            </div>
            <div class="must-know__group-content">{calcGoodsUsableTimeText(props.goodsDetail)}</div>
          </div>
          {goodsUnusableTimeText.value.length > 0 && (
            <div class="must-know__group">
              <div class="must-know__group-title">
                <Icon name="close-round" />
                不可用时间
              </div>
              <div class="must-know__group-content">
                {goodsUnusableTimeText.value.map((text, index) => {
                  return (
                    <div style="display:flex;margin-top:8px;white-space:pre-wrap;">
                      <div>{index + 1}. &nbsp;</div>
                      <div>{text}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {props.goodsDetail?.verificationTips?.length > 0 && (
            <div class="must-know__group">
              <div class="must-know__group-title">
                <Icon name="scan-code" />
                核销提示
              </div>
              <div class="must-know__group-content">
                <div style="margin-top:8px"></div>
                {props.goodsDetail.verificationTips}
              </div>
            </div>
          )}
          <div class="must-know__group">
            <div class="must-know__group-title">
              <Icon name="agreement" />
              使用规则
            </div>
            <div class="must-know__group-content">
              <div style="margin-top:8px"></div>
              <RichText nodes={props.goodsDetail.mustKnow || '无内容'} />
            </div>
          </div>
        </div>
      )
    }
  }
})
