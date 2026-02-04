import { computed, defineComponent, PropType, ref, SlotsType, watch } from 'vue'
import './style.scss'
import { Image } from '@tarojs/components'
import { formatPrice } from '@pkg/utils'
import { GOODS_TYPE_STORE_VERIFICATION } from '../../../src/constants'

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
      default: TYPE_VERTICAL
    },
    /** 图片，若没有值，显示 “暂无图片” */
    image: {
      type: String
    },
    /** 商品名称，可以是字符串或者插槽内容 */
    name: {},
    nameMaxRows: {
      type: Number
    },
    /** 商品价格 */
    price: {
      type: [String, Number] as PropType<string | number>
    },
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
    action: {},
    // 用户地址代码,这里只用传入维度最低的即可
    userAddress: {
      type: Number,
      default: () => 0
    },
    // 是否限制销售 1 限制 0 不限制
    restrictedStatus: {
      type: Number,
      default: 0
    },
    // 限售区域代码
    restrictedArea: {
      type: Array,
      default: () => []
    },
    // 指定区域以外 还是 指定区域以内可以购买
    // 0 指定区域内可以买, 为 1 指定区域外可以买
    restrictedType: {
      type: Number,
      default: 0
    },
    goodsId: {
      type: String,
      default: () => ''
    },
    // 商品类型,目前如果是卡券商品,则不需要限售逻辑
    goodsType: {
      type: Number,
      default: 0
    }
  },
  slots: Object as SlotsType<{
    /** 商品信息底部插槽 */
    footer: any
    /** 商品按钮插槽 */
    action: any
  }>,
  emits: ['allowBuy'],
  setup(props, { slots, emit }) {
    const type = computed(() => (types.includes(props.type!) ? props.type : TYPE_VERTICAL))
    const nameMaxRows = props.nameMaxRows ?? (type.value === TYPE_VERTICAL ? 2 : 1)
    // 是否展示禁止购买
    const disableEle = ref(false)

    const init = () => {
      const { restrictedStatus, goodsType } = props
      // 如果是卡券商品，不需要限售逻辑
      if (goodsType === GOODS_TYPE_STORE_VERIFICATION) {
        return true
      }
      // 后台配置不限售
      if (restrictedStatus === 0) {
        // console.log('后台配置不限售')
        return true
      }
      // 如果没有限售区域代码,那也是不限售
      if (!props.restrictedArea) {
        console.log('没有限售区域代码')
        return true
      }
      if (!props.userAddress) {
        // useToast('请先填写地址')
        return true
      }
      if (props.userAddress) {
        // 指定区域是否包含用户地址
        const flag = props.restrictedArea.includes(props.userAddress)
        // 是否在指定区域限售
        if (props.restrictedType === 0) {
          if (flag) {
            disableEle.value = false
          } else {
            // 该商品无法下单时,需要提交给外部组件
            emit('allowBuy', props.goodsId)
            disableEle.value = true
          }
        } else {
          // 指定区域禁止销售
          if (flag) {
            disableEle.value = true
            emit('allowBuy', props.goodsId)
          } else {
            disableEle.value = false
          }
        }
      }
    }
    watch(
      () => props?.userAddress,
      newV => {
        if (newV === 0) {
          return void 0
        }
        init()
      },
      {
        immediate: true,
        deep: true
      }
    )
    init()

    return () => {
      const footer = props.footer ?? slots.footer?.()
      return (
        <div class={['c_goods-item', `c_goods-item--${type.value}`]}>
          <div class="c_goods-item__image">
            {props.image ? (
              <Image class="image" mode="aspectFill" src={props.image}/>
            ) : (
              <div class="error-text">暂无图片</div>
            )}
          </div>
          <div class="c_goods-item__info">
            <div class={['c_goods-item__name', `max-${nameMaxRows}-line`]}>
              {/* <div class="c_goods-item__tag">新品</div> */}
              {props.name}
            </div>
            {props.desc && (
              <div class="c_goods-item__row">
                <div class="c_goods-item__desc">{props.desc}</div>
              </div>
            )}
            {props.spec && (
              <div class="c_goods-item__row">
                <div class="c_goods-item__spec">{props.spec}</div>
              </div>
            )}
            <div class="c_goods-item__row price-row">
              {disableEle.value ? (
                <div class="disable-buy">抱歉，该商品无法配送到你选择的地址</div>
              ) : (
                props.price && (
                  <div class="c_goods-item__price number-font">
                    <div class="yen">&yen;</div>
                    <div>{formatPrice(props.price)}</div>
                    {props.priceMax! > props.price && <div>&nbsp;~ {formatPrice(props.priceMax!)}</div>}
                    {/* {props.priceMax! > props.price && <div style="font-size:0.7em">&nbsp;起</div>} */}
                  </div>
                )
              )}

              {props.listPrice && Number(props.listPrice) > Number(props.price) && (
                <div class="c_goods-item__list-price number-font">&yen;{formatPrice(props.listPrice)}</div>
              )}
              <div class="c_goods-item__action">{props.action ?? slots.action?.()}</div>
            </div>
            {footer && <div class="c_goods-item__row">{footer}</div>}
          </div>
        </div>
      )
    }
  }
})
