import GoodsItem from '../../../../components/goods-item'
import { computed, defineComponent, PropType, ref, watch, withModifiers } from 'vue'
import './style.scss'
import { Icon, Radio } from '@pkg/ui'
import CountStepper from '../../../../components/count-stepper'
import { useGoodsLimit, useGoodsSkuModal } from '../../../../hooks'
import { ICartItem } from '../../../../api/cart/types'
import { navigateToGoodsDetail } from '../../../../router'
import { useCartStore } from '../../../../stores'
import { useResponseMessage } from '@pkg/core'

export default defineComponent({
  name: 'CartItem',
  props: {
    data: {
      type: Object as PropType<ICartItem>,
      required: true
    }
  },
  setup(props) {
    const cartStore = useCartStore()

    const goodsInfo = computed(() => {
      return props.data.goods
    })
    const targetSku = computed(() => {
      return goodsInfo.value.goodsSkus.find(item => item.id === props.data.goodsSkuId)
    })
    const goodsImage = computed(() => {
      return targetSku.value?.specs?.[0].image ?? goodsInfo.value.coverImages?.[0]
    })
    const goodsName = computed(() => {
      return goodsInfo.value.title
    })
    const skuText = computed(() => {
      return targetSku.value?.specs.map(item => item.v).join('／')
    })

    const count = ref(props.data.count)

    watch(
      () => [props.data, props.data.count],
      () => {
        count.value = props.data.count
      }
    )

    const { limitMin, limitMax } = useGoodsLimit(goodsInfo, props.data.goodsSkuId)

    const onGoodsClick = () => {
      navigateToGoodsDetail(props.data.goodsId)
    }

    /** 更改sku，传入当前的值 */
    const onChangeSku = () => {
      const modal = useGoodsSkuModal({
        skus: goodsInfo.value.goodsSkus,
        defaultImage: goodsInfo.value.coverImages?.[0],
        count: count.value,
        minCount: goodsInfo.value.limitNumMin ?? 1,
        maxCount: goodsInfo.value.limitNumMax,
        onConfirm: async res => {
          count.value = res.count
          await cartStore
            .updateItem(props.data.id, {
              goodsId: res.goodsId,
              goodsSkuId: res.id,
              count: res.count
            })
            .catch(useResponseMessage)
          modal.close()
        }
      })
    }

    const onCountChange = newCount => {
      count.value = newCount
      cartStore
        .updateItem(props.data.id, {
          goodsId: props.data.goodsId,
          goodsSkuId: props.data.goodsSkuId,
          count: newCount
        })
        .catch(useResponseMessage)
    }

    return () => {
      return (
        <div class="cart-item">
          <div
            class="cart-item__check"
            onClick={() => {
              cartStore.check(props.data.id)
            }}
          >
            <Radio checked={props.data.checked} />
          </div>
          <div class="cart-item__goods">
            <GoodsItem
              // @ts-ignore
              onClick={onGoodsClick}
              type="horizontal"
              // 图片
              image={goodsImage.value}
              // 商品名称
              name={goodsName.value}
              // 规格
              desc={
                <div class="cart-item__sku" onClick={withModifiers(onChangeSku, ['stop'])}>
                  <div class="cart-item__sku-text">{skuText.value}</div>
                  <Icon name="down" />
                </div>
              }
              // 价格
              price={targetSku.value?.price}
              // 划线价
              listPrice={targetSku.value?.underlinePrice}
              // 数量选择
              action={
                <CountStepper
                  size="small"
                  value={count.value}
                  min={limitMin.value?.value}
                  minMessage={limitMin.value?.message}
                  max={limitMax.value?.value}
                  maxMessage={limitMax.value?.message}
                  onChange={onCountChange}
                  // @ts-ignore
                  onClick={withModifiers(() => {}, ['stop'])}
                />
              }
            />
          </div>
        </div>
      )
    }
  }
})
