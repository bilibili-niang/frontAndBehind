import { computed, defineComponent, PropType } from 'vue'
import './style.scss'
import { Icon } from '@pkg/ui'
import { useGoodsSkuModal } from '../../../../hooks'
import { backToIndex, navigateToOrderPay, navigateToShoppingCart } from '../../../../router'
import { Button } from '@tarojs/components'
import { IGoodsDetail } from '../../../../api/goods/types'
import { useCartStore } from '../../../../stores'
import { useGoodsDetailStore } from '../store'
import { storeToRefs } from 'pinia'
import { changeDateSeparator, simplifyDate } from '@pkg/utils'
import { GOODS_TYPE_ENTITY, GOODS_TYPE_STORE_VERIFICATION } from '../../../../constants'
import { addressTranslationToCode, checkAreaCodeInSide, getAreaNameByCode } from '../../../../utils'
import useAddress from '../../../../hooks/useAddress'
import { $getGoodsSupplierContactInfo } from '../../../../api'
import { useLoading, useLoadingEnd, useResponseMessage, useToast } from '@pkg/core'
import useAction from '../../../../hooks/useAction'

export default defineComponent({
  name: 'goods-detail-action-bar',
  props: {
    goodsDetail: {
      type: Object as PropType<IGoodsDetail>,
      required: true
    }
  },
  setup(props) {
    // 用户收货地址
    const useAddressEntities = useAddress()
    const { address } = storeToRefs(useAddressEntities)
    const goodsDetailStore = useGoodsDetailStore()
    const { goodsDetail, isOffSale, isWaitingForSale, isEndOfSale, isWithinTodaySalesTime } =
      storeToRefs(goodsDetailStore)
    const updatePageAddress = () => {
      useAddressEntities.chooseAddress()
    }

    const statusText = computed(() => {
      if (isWaitingForSale.value) {
        return `该商品将于 ${changeDateSeparator(simplifyDate(goodsDetail.value!.onsaleStartAt))} 开始售卖`
      }
      if (isEndOfSale.value) {
        return <>该商品已于 {changeDateSeparator(simplifyDate(goodsDetail.value!.onsaleEndAt))} 结束售卖</>
      }
      if (!isWithinTodaySalesTime.value) {
        return `该商品每日 ${goodsDetail.value!.buyStartAt} 至 ${goodsDetail.value!.buyEndAt} 可购买`
      }
      return null
    })

    /*
     * 用户的区域
     * */
    const commoditySalesArea = computed(() => {
      const provinceCode = addressTranslationToCode(address.value?.provinceName)?.code
      const cityCode = addressTranslationToCode(address.value?.cityName)?.code
      const countyCode = addressTranslationToCode(address.value?.countyName)?.code
      return countyCode ? countyCode : cityCode ? cityCode : provinceCode
    })

    // 销售区域限制提示文字
    const saleAreaText = () => {
      const goodsAllowSaleArea: string[] = []
      // 限售的区域
      goodsDetail.value?.restrictedArea?.map(it => {
        /*
         * 这里地址的数组存储的都是由省到市到区的顺序,但不一定有省例如一些直辖市,所以取最大的即可
         * */
        goodsAllowSaleArea.push(getAreaNameByCode(it[it.length - 1]))
      })
      // 本地没有存储用户最后选择的地址时,是会为空的
      if (!address.value) {
        return (
          <div class="statue-text-row" onClick={updatePageAddress}>
            该商品限制区域销售 <div class="little-tip">填写地址</div>
          </div>
        )
      }
      if (goodsDetail.value?.type === GOODS_TYPE_STORE_VERIFICATION) {
        // 卡券商品,不设置限制
        return void 0
      }
      if (goodsDetail.value?.restrictedStatus === 0) {
        console.log('没有设置销售区域')
        // 实物商品,但是不设置销售区域
        return void 0
      }
      if (!goodsDetail.value?.restrictedArea) {
        console.log('实物商品,设置了销售区域,但是没有填写销售区域的code')
        // 万一为实物商品,设置了销售区域,但是没有填写销售区域的code
        return void 0
      }

      const lastCode = commoditySalesArea.value
      const resultList = goodsDetail.value.restrictedArea.map(it => {
        return checkAreaCodeInSide(lastCode, it[it.length - 1])
      })

      const noSale = () => {
        return (
          <div class="status-text status-text-warning">
            <div
              class="statue-text-row"
              onClick={() => {
                updatePageAddress()
              }}
            >
              此商品在{goodsAllowSaleArea.join(',')}
              {goodsDetail.value?.restrictedType === 0 ? '销售' : '不可销售'}
              <div class="little-tip">修改地址</div>
            </div>
          </div>
        )
      }

      /*
       * 允许在指定区域销售
       * 用户省市区的code最后一个(可能区的code不存在)在允许区域的code里即可
       * restrictedType : 限制类型，0：仅所选区域可下单，1：所选区域不可下单
       * */
      if (goodsDetail.value?.restrictedType === 0) {
        if (resultList.includes(true)) {
          // 允许销售
          return void 0
        } else {
          return noSale()
        }
      } else {
        if (resultList.includes(true)) {
          return noSale()
        } else {
          // 允许销售
          return void 0
        }
      }
    }

    const onBuyNowClick = async () => {
      const { close } = useGoodsSkuModal({
        skus: props.goodsDetail.goodsSkus as any,
        defaultImage: props.goodsDetail.coverImages[0],
        minCount: props.goodsDetail.limitNumMin ?? 1,
        maxCount: props.goodsDetail.limitNumMax,
        onConfirm: res => {
          navigateToOrderPay({
            goods: {
              gid: props.goodsDetail.id,
              sid: res.id,
              count: res.count
            }
          }).finally(close)
        }
      })
    }
    const onAddShoppingCartClick = () => {
      const { close } = useGoodsSkuModal({
        skus: props.goodsDetail.goodsSkus as any,
        defaultImage: props.goodsDetail.coverImages[0],
        minCount: props.goodsDetail.limitNumMin ?? 1,
        maxCount: props.goodsDetail.limitNumMax,
        onConfirm: res => {
          useCartStore()
            .addItem({
              goodsId: res.goodsId,
              goodsSkuId: res.id,
              count: res.count
            })
            .finally(close)
        }
      })
    }

    const MainActions = () => {
      if (isOffSale.value) {
        return <div class="main-action disabled">商品已下架</div>
      }
      if (isWaitingForSale.value) {
        return <div class="main-action">未到开售时间</div>
      }
      if (isEndOfSale.value) {
        return <div class="main-action">售卖时间已过</div>
      }
      if (!isWithinTodaySalesTime.value) {
        return <div class="main-action">不在本日售卖时间</div>
      }
      return (
        <>
          {goodsDetail.value?.type === GOODS_TYPE_ENTITY && (
            <div class="main-action" onClick={onAddShoppingCartClick}>
              加入购物车
            </div>
          )}
          <div class="main-action primary" onClick={onBuyNowClick}>
            立即购买
          </div>
        </>
      )
    }

    const showContactButton = computed(() => {
      return props.goodsDetail.supplierId
    })

    const Contact = () => {
      if (showContactButton.value) {
        return (
          <div
            class="minor-action"
            onClick={() => {
              useLoading()
              $getGoodsSupplierContactInfo(props.goodsDetail.supplierId!)
                .then(res => {
                  if (res.data) {
                    useAction({
                      key: 'contact',
                      config: res.data
                    })
                  } else {
                    useToast('未获取到客服消息')
                  }
                })
                .catch(err => {
                  useResponseMessage(err)
                })
                .finally(useLoadingEnd)
            }}
          >
            <Icon name="profile" />
            <div>客服</div>
          </div>
        )
      }

      if (process.env.TARO_ENV !== 'h5') {
        return (
          <div class="minor-action">
            <Button class="contact" openType="contact"></Button>
            <Icon name="profile" />
            <div>客服</div>
          </div>
        )
      }
      return null
    }

    return () => {
      return (
        <div class="goods-detail-action-bar">
          {saleAreaText()}
          {statusText.value && <div class="status-text">{statusText.value}</div>}
          <div class="content">
            <div class="minor-action" onClick={() => backToIndex()}>
              <Icon name="home" />
              <div>首页</div>
            </div>
            <Contact />
            <div class="minor-action" onClick={() => navigateToShoppingCart()}>
              <Icon name="cart" />
              <div>购物车</div>
            </div>
            <MainActions />
          </div>
        </div>
      )
    }
  }
})
