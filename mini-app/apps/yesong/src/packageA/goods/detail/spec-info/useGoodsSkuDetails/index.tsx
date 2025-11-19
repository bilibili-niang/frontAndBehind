import { computed, defineComponent, ref } from 'vue'
import './style.scss'
import GoodsItem from '../../../../../components/goods-item'
import { useGoodsDetailStore } from '../../store'
import { storeToRefs } from 'pinia'
import { ScrollView, Swiper, SwiperItem } from '@tarojs/components'
import { withUnit } from '@anteng/utils'
import { useModal } from '@anteng/core'
import MustKnow from '../../must-know'
import { nextTick } from '@tarojs/taro'
import { Icon } from '@anteng/ui'
import { navigateToOrderPay } from '../../../../../router'
import { ORDER_ORIGIN_DETAIL } from '../../../../../constants'

const GoodsSkuDetails = defineComponent({
  name: 'GoodsSkuDetails',
  props: {
    goodsId: {
      type: String,
      required: true
    },
    currentSkuId: {
      type: String
    }
  },
  setup(props) {
    const goodsDetailStore = useGoodsDetailStore(props.goodsId)
    const { goodsDetail, goodsSkus } = storeToRefs(goodsDetailStore)

    const isSingle = computed(() => goodsSkus.value.length === 1)

    let initialIndex = goodsSkus.value.findIndex(item => item.id === props.currentSkuId)
    initialIndex = initialIndex > 0 ? initialIndex : 0
    const currentIndex = ref(initialIndex)
    const toggle = (index: number) => {
      if (index === currentIndex.value) {
        return void 0
      }
      currentIndex.value = index
      shallowScrollTop.value = scrollTop.value
      nextTick(() => {
        shallowScrollTop.value = 0
      })
    }
    const targetSku = computed(() => {
      return goodsSkus.value[currentIndex.value]!
    })
    const targetFeeList = computed(() => {
      return goodsDetail.value?.feeList?.skuDetails?.find(item => item.path === targetSku.value.$path)
    })

    const scrollTop = ref(0)
    const shallowScrollTop = ref(0)

    const onBuyClick = (sku: typeof targetSku.value) => {
      let count = goodsDetail.value!.limitNumMin
      count = count > 0 ? count : 1
      navigateToOrderPay({
        origin: ORDER_ORIGIN_DETAIL,
        goods: {
          gid: goodsDetail.value!.id,
          sid: sku.id,
          count: count
        }
      })
    }

    return () => {
      return (
        <ScrollView
          class="goods-sku-details-scroller"
          scrollY
          scrollTop={shallowScrollTop.value}
          onScroll={e => {
            scrollTop.value = e.detail.scrollTop
          }}
        >
          <div class="goods-sku-details">
            <div class={['sku-list', isSingle.value && 'single']}>
              <Swiper
                class="swiper"
                circular
                nextMargin={isSingle.value ? undefined : withUnit(100)}
                current={currentIndex.value}
                onChange={e => {
                  toggle(e.detail.current)
                }}
              >
                {goodsSkus.value.map((item, index) => {
                  return (
                    <SwiperItem>
                      <div class="sku-item">
                        <GoodsItem
                          type="horizontal"
                          image={item.$image}
                          name={item.$name}
                          price={item.price}
                          listPrice={item.underlinePrice}
                          action={
                            item.$soldOut ? (
                              <div class="sku-item__action disabled">已售罄</div>
                            ) : (
                              <div
                                class="sku-item__action"
                                onClick={() => {
                                  onBuyClick(item)
                                }}
                              >
                                立即购买
                              </div>
                            )
                          }
                          // @ts-ignore
                          onClick={() => {
                            toggle(index)
                          }}
                        />
                      </div>
                    </SwiperItem>
                  )
                })}
              </Swiper>
            </div>
            <div class="goods-sku-details__content">
              <div class="title">
                费用说明
                <div class="subtitle">（{targetSku.value.$name}）</div>
              </div>
              {targetFeeList.value.groups.length === 0 && (
                <div class="color-secondary">无内容，请以商品详情描述信息为准</div>
              )}
              {targetFeeList.value.groups.map(group => {
                return (
                  <div class="group">
                    <div class="group-title">{group.name}</div>
                    {group.items.map(item => {
                      return (
                        <div class="group-item">
                          <div class="name">{item.name}</div>
                          <div class="count">（{item.count}份）</div>
                          <div class="value number-font">&yen;{item.price}</div>
                        </div>
                      )
                    })}
                    {group.remark?.length > 0 && (
                      <div class="group-remark">
                        <Icon name="info" />
                        &nbsp;
                        {group.remark}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {goodsDetail.value && <MustKnow class="must-know" goodsDetail={goodsDetail.value} />}
          </div>
        </ScrollView>
      )
    }
  }
})

const useGoodsSkuDetials = (options: { goodsId: string; currentSkuId?: string }) => {
  useModal({
    title: '规格详情',
    className: 'goods-sku-details-modal',
    padding: 0,
    height: 'max',
    content: <GoodsSkuDetails goodsId={options.goodsId} currentSkuId={options.currentSkuId} />,
    scrollViewDisabled: true
  })
}

export default useGoodsSkuDetials
