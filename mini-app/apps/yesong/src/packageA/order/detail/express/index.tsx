import { computed, defineComponent, onMounted, PropType, ref, watch } from 'vue'
import './style.scss'
import { WxAddress } from '../../../../types'
import { Icon, ScrollTab, ScrollTabItem } from '@pkg/ui'
import { useExpress, useExpressModal } from '../../../../hooks'
import { useCopyText } from '@pkg/core'
import { EXPRESS_STATUS_OPTIONS } from '../../../../constants'
import { EXPRESS_COMPANY_OPTIONS } from '@pkg/config'

export type ExpressPackItem = {
  courierName: string
  courierNo: string
  address?: WxAddress
  goodsList: {
    id: string
    goodsId: string
    name: string
    image: string
  }[]
}

export default defineComponent({
  name: 'GoodsExpress',
  props: {
    packs: {
      type: Array as PropType<any[]>,
      default: () => []
    },
    address: {
      type: Object as PropType<WxAddress>
    }
  },
  setup(props) {
    const hasShippedPacks = computed(() => {
      return props.packs.filter(item => item.courierNo)
    })

    const UNSHIPED_KEY = -1
    const unShippedGoodsList = computed(() => {
      return ([] as ExpressPackItem['goodsList']).concat(
        ...props.packs.filter(item => !item.courierNo).map(item => item.goodsList)
      )
    })
    const currentIndex = ref(0)
    const currentPack = computed(() => {
      return hasShippedPacks.value[currentIndex.value]
    })

    const toggle = (index: number) => {
      currentIndex.value = index
      expressInfoSet[index]?.refresh()
    }

    onMounted(() => toggle(0))

    const ContactInfo = computed(() => {
      if (!props.address) return null
      const { provinceName, cityName, countyName, detailInfo, userName, telNumber } = props.address
      return (
        <div class="goods-express__contact">
          <div class="dot"></div>
          <div class="address">
            送至&nbsp;
            {provinceName}
            {cityName}
            {countyName}
            {detailInfo}
          </div>
          <div class="user">
            {userName} {telNumber}
          </div>
        </div>
      )
    })

    const expressInfoSet: ReturnType<typeof useExpress>[] = []
    watch(
      () => hasShippedPacks.value,
      () => {
        hasShippedPacks.value.map(item => {
          expressInfoSet.push(
            useExpress({
              courierNo: item.courierNo,
              phone: props.address?.telNumber as string,
              lazyLoad: true
            })
          )
        })
      },
      { immediate: true }
    )

    const ExpressInfo = computed(() => {
      const expressInfo = expressInfoSet[currentIndex.value]
      const expressRef = expressInfo?.expressRef
      if (!currentPack.value)
        return (
          <div>
            <div class="goods-express__progress">
              <div class="dot"></div>
              <div class="dash-line"></div>
              <div class="status">未发货</div>
              <div class="desc">已收到订单需求，商家将尽快安排物流发货。</div>
            </div>
            {ContactInfo.value}
          </div>
        )

      const name = expressRef.value?.expressCompanyName || currentPack.value.courierName
      const no = currentPack.value.courierNo
      const t = EXPRESS_COMPANY_OPTIONS.find(i => i.label === name)
      const logo = expressRef.value?.expressCompanyLogo ?? t?.logo
      const remark = currentPack.value.remark
      const noDetails = t?.noDetails
      return (
        <div>
          <div class="goods-express__info">
            {logo ? (
              <div
                class="logo"
                style={{
                  backgroundImage: `url(${logo})`
                }}
              ></div>
            ) : (
              <div class="logo-placeholder"></div>
            )}

            <div class="name">{name}</div>
            {no !== name && (
              <>
                <div>{no}</div>
                <div
                  class="copy"
                  onClick={() => {
                    useCopyText(no)
                  }}
                >
                  复制
                </div>
              </>
            )}
          </div>
          {noDetails && remark ? <div class="goods-express__remark">{remark}</div> : null}
          <div class="goods-express__progress" onClick={onExpressClick}>
            <div class="dot"></div>
            <div class="dash-line"></div>
            {expressRef.value ? (
              <>
                <div class="status">
                  {EXPRESS_STATUS_OPTIONS.find(item => item.value == (expressRef.value?.logisticsStatus as any))?.label}
                  <div class="date">
                    {expressRef.value?.theLastTime?.replace(
                      /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/,
                      '$2-$3 $4:$5'
                    )}
                  </div>
                  <div class="more">
                    详细信息
                    <Icon name="right" />
                  </div>
                </div>
                <div class="desc">{expressRef.value?.theLastMessage}</div>
              </>
            ) : (
              <>
                <div class="status">
                  {expressInfo.isLoading.value ? '正在更新' : '暂无物流信息'}
                  <div class="date"></div>
                  <div class="more">
                    详细信息
                    <Icon name="right" />
                  </div>
                </div>
                <div class="desc">
                  {expressInfo.isLoading.value
                    ? '物流信息加载中...'
                    : expressInfo.errMsg.value || '物流信息获取失败！请稍后再试'}
                </div>
              </>
            )}
          </div>
          {ContactInfo.value}
        </div>
      )
    })

    const onExpressClick = () => {
      useExpressModal({
        courierNo: hasShippedPacks.value[currentIndex.value].courierNo as string,
        phone: props.address?.telNumber as string
      })
    }

    return () => {
      // 发货包裹只有一个
      if (hasShippedPacks.value.length <= 1 && props.packs.length <= 1) {
        return <div class="goods-express">{ExpressInfo.value}</div>
      }
      return (
        <div class="goods-express">
          <div class="goods-express__tip number-font">该订单已被拆分成 {props.packs.length} 个包裹寄出</div>
          <ScrollTab key="packs-warp" class="goods-express__packs-wrap" current={currentIndex.value}>
            <div class="goods-express__packs">
              {hasShippedPacks.value.map((item, index) => {
                return (
                  <ScrollTabItem key={index}>
                    <div
                      class={['pack-item', index === currentIndex.value && 'active']}
                      onClick={() => {
                        toggle(index)
                      }}
                    >
                      <div class="pack-item__info">
                        <div class="name number-font">包裹 {index + 1}</div>
                        <div class="count number-font">共 {item.goodsList.length} 件</div>
                      </div>
                      {item.goodsList.map(goods => {
                        return (
                          <div
                            class="pack-item__goods"
                            style={{
                              backgroundImage: `url(${goods.image})`
                            }}
                          ></div>
                        )
                      })}
                    </div>
                  </ScrollTabItem>
                )
              })}
              {unShippedGoodsList.value.length > 0 && (
                <div
                  class={['pack-item', currentIndex.value === UNSHIPED_KEY && 'active']}
                  onClick={() => {
                    toggle(UNSHIPED_KEY)
                  }}
                >
                  <div class="pack-item__info">
                    <div class="name number-font color-disabled">未发货</div>
                    <div class="count number-font">共 {unShippedGoodsList.value.length} 件</div>
                  </div>
                  {unShippedGoodsList.value.map(goods => {
                    return (
                      <div
                        class="pack-item__goods"
                        style={{
                          backgroundImage: `url(${goods.image})`
                        }}
                      ></div>
                    )
                  })}
                </div>
              )}
            </div>
          </ScrollTab>
          {ExpressInfo.value}
        </div>
      )
    }
  }
})
