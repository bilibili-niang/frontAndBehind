import { defineComponent, PropType, withModifiers } from 'vue'
import './style.scss'
import { Image } from '@tarojs/components'
import { renderAnyNode } from '@pkg/utils'

export default defineComponent({
  name: 'OrderGoodsItem',
  props: {
    /** 图片，若没有值，显示 “暂无图片” */
    image: {
      type: String,
      required: true
    },
    /** 商品名称，可以是字符串或者插槽内容 */
    name: {},
    /** 商品名称最多显示行数，默认 1 */
    nameMaxRows: {
      type: Number,
      default: 1
    },
    /** 商品价格 */
    unitPrice: {
      type: [String, Number] as PropType<string | number>
    },
    /** 实付单价，若未设置或者等同于单价，则不显示 */
    unitPricePaid: {
      type: [String, Number] as PropType<string | number>
    },
    /** 数量 */
    count: {
      type: [String, Number] as PropType<string | number>
    },
    /** 商品规格，可以是字符串或者插槽内容 */
    spec: {},
    /** 商品描述，可以是字符串或者插槽内容 */
    desc: {},
    status: {},
    /** 商品信息底部插槽 */
    footer: {},
    /** 商品按钮插槽 */
    actions: {}
  },
  setup(props, { slots }) {
    return () => {
      const Actions = renderAnyNode(props.actions || slots.actions)
      return (
        <div class="c_order-goods-item">
          <div class="c_order-goods-item__header"></div>
          <div class="c_order-goods-item__main">
            <div class="c_order-goods-item__image">
              <Image class="image" mode="aspectFill" src={props.image} />
            </div>
            <div class="c_order-goods-item__content">
              <div class="c_order-goods-item__detail">
                <div class="c_order-goods-item__info">
                  <div class={['c_order-goods-item__name', `max-${props.nameMaxRows}-line`]}>{props.name}</div>
                  {props.spec && <div class="c_order-goods-item__spec">{props.spec}</div>}
                  {props.desc && <div class="c_order-goods-item__spec">{props.desc}</div>}
                </div>
                <div class="c_order-goods-item__summary">
                  {props.unitPricePaid && props.unitPricePaid !== props.unitPrice ? (
                    <div class="c_order-goods-item__pay number-font">
                      <div class="text">实付</div>
                      <div class="yen">&yen;</div>
                      {props.unitPricePaid}
                    </div>
                  ) : null}
                  {props.unitPrice && (
                    <div class="c_order-goods-item__price number-font">
                      <div class="yen">&yen;</div>
                      {props.unitPrice}
                    </div>
                  )}
                  <div class="c_order-goods-item__count">&times; {props.count}</div>
                  {props.status && <div class="c_order-goods-item__status">{props.status}</div>}
                </div>
              </div>
              {Actions && (
                <div class="c_order-goods-item__actions" onClick={withModifiers(() => {}, ['stop'])}>
                  {Actions}
                </div>
              )}
            </div>
          </div>
          <div class="c_order-goods-item__footer"></div>
        </div>
      )
    }
  }
})

export const OrderGoodsItemAction = (props, { slots }) => {
  return <div class="action">{slots.default?.()}</div>
}
