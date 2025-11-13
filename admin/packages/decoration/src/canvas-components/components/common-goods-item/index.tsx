import { computed, defineComponent, PropType, SlotsType } from 'vue'
import './style.scss'

export type GoodsItemOptions = {
  id: string
  type?: 'vertical' | 'horizontal'
  image?: string
  name: any
  price: any
  priceMax?: any
  listPrice?: any
  desc?: any
  spec?: any
  footer?: any
  action?: any
}

const TYPE_VERTICAL = 'vertical'
const TYPE_HORIZONTAL = 'horizontal'
const types = [TYPE_VERTICAL, TYPE_HORIZONTAL]

export default defineComponent({
  name: 'GoodsItem',
  props: {
    /** 横向、竖向 */
    type: {
      type: String as PropType<GoodsItemOptions['type']>,
      default: TYPE_HORIZONTAL
    },
    headerText: {},
    status: {},
    /** 图片，若没有值，显示 “暂无图片” */
    image: {
      type: String
    },
    /** 商品名称，可以是字符串或者插槽内容 */
    name: {},
    tag: {
      type: String
    },
    tagOnImage: Boolean,
    nameMaxRows: {
      type: Number
    },
    customPrice: {},
    /** 商品价格 */
    price: {
      type: [String, Number] as PropType<string | number>
    },
    priceUnit: String,
    priceMax: {
      type: [String, Number] as PropType<string | number>
    },
    /** 商品划线价 */
    listPrice: {
      type: [String, Number] as PropType<string | number>
    },
    /** 商品描述，可以是字符串或者插槽内容 */
    desc: {},
    /** 商品规格，可以是字符串或者插槽内容 */
    spec: {},
    /** 商品信息底部插槽 */
    footer: {},
    /** 商品按钮插槽 */
    action: {}
  },
  slots: Object as SlotsType<{
    /** 商品信息底部插槽 */
    footer: any
    /** 商品按钮插槽 */
    action: any
  }>,
  setup(props, { slots }) {
    const type = computed(() => (types.includes(props.type!) ? props.type : TYPE_VERTICAL))
    const nameMaxRows = props.nameMaxRows ?? (type.value === TYPE_VERTICAL ? 2 : 1)
    return () => {
      const footer = props.footer ?? slots.footer?.()
      return (
        <div class={['c_common-goods-item', `c_common-goods-item--${type.value}`]}>
          {props.headerText && (
            <div class="c_common-goods-item__header">
              {props.headerText}
              {props.status && <div class="c_common-goods-item__status">{props.status}</div>}
            </div>
          )}
          <div class="c_common-goods-item__image">
            {props.tagOnImage && props.tag && (
              <div class="c_common-goods-item__tag on-image">{props.tag}</div>
            )}
            {props.image ? (
              <img class="image" src={props.image} />
            ) : (
              <div class="error-text">暂无图片</div>
            )}
          </div>
          <div class="c_common-goods-item__info">
            <div class={['c_common-goods-item__name', `max-${nameMaxRows}-line`]}>
              {!props.tagOnImage && props.tag && (
                <div class="c_common-goods-item__tag">{props.tag}</div>
              )}
              {props.name}
            </div>
            {props.desc && (
              <div class="c_common-goods-item__row">
                <div class="c_common-goods-item__desc max-2-line">{props.desc}</div>
              </div>
            )}
            {props.spec && (
              <div class="c_common-goods-item__row">
                <div class="c_common-goods-item__spec">{props.spec}</div>
              </div>
            )}
            <div class="c_common-goods-item__grow"></div>
            <div class="c_common-goods-item__row price-row">
              {props.customPrice ? (
                <div class="c_common-goods-item__price custom number-font">{props.customPrice}</div>
              ) : (
                props.price && (
                  <div class="c_common-goods-item__price number-font">
                    <div class="yen">&yen;</div>
                    <div>{formatPrice(props.price)}</div>
                    {props.priceMax! > props.price && (
                      <div>&nbsp;~ {formatPrice(props.priceMax!)}</div>
                    )}
                    {/* {props.priceMax! > props.price && <div style="font-size:0.7em">&nbsp;起</div>} */}
                    {props.priceUnit && (
                      <div style="font-size:0.65em;position:relative;bottom:1px;">
                        &nbsp;/&nbsp;{props.priceUnit}
                      </div>
                    )}
                    {Number(props.listPrice) > Number(props.price) && (
                      <div class="c_common-goods-item__list-price number-font">
                        &yen;{formatPrice(props.listPrice!)}
                      </div>
                    )}
                  </div>
                )
              )}

              <div class="c_common-goods-item__action">{props.action ?? slots.action?.()}</div>
            </div>
            {footer && <div class="c_common-goods-item__row">{footer}</div>}
          </div>
        </div>
      )
    }
  }
})

/** 格式化价格，最多保留2位小数 */
const formatPrice = (value: string | number): string => {
  const v = Number(value)
  if (Number.isNaN(v)) return ''
  return String(Math.round(v * 100) / 100)
}
