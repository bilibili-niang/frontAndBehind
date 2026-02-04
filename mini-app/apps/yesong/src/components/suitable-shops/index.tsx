import { Icon } from '@pkg/ui'
import { computed, defineComponent, onMounted, PropType, ref, watch } from 'vue'
import './style.scss'
import ShopItem, { IShopItemOptions } from '../shop-item'
import { EmptyStatus, useModal, usePagination, useUserStore } from '@pkg/core'
import { getGoodsSuitableShops } from '../../api/shop'
import { ScrollView } from '@tarojs/components'

export interface ISuitableShopsOptions {
  /** 商品id */
  goodsId: string
  /** 标题，默认：适用门店 */
  title?: string | Function
  /** 门店总数，不大于 1 时，文案为 “查看全部” */
  total?: number | (() => number)
  /** 门店总数文案 */
  totalText?: string | (() => string)
  /** 显示的门店数据 */
  shops: IShopItemOptions[]
}

export default defineComponent({
  name: 'GoodsSuitableShops',
  props: {
    goodsId: {
      type: String,
      required: true
    },
    title: {
      type: [String, Function] as PropType<ISuitableShopsOptions['title']>,
      default: '适用门店'
    },
    total: {
      type: [Number, Function] as PropType<ISuitableShopsOptions['total']>
    },
    totalText: {
      type: [String, Function] as PropType<ISuitableShopsOptions['totalText']>
    },
    shops: {
      type: Array as PropType<ISuitableShopsOptions['shops']>,
      default: () => []
    }
  },
  setup(props) {
    const shops = computed(() => {
      return Array.isArray(props.shops) ? props.shops : []
    })

    const title = computed(() => {
      return (typeof props.title === 'function' ? props.title() : props.title) ?? '适用门店'
    })
    const total = computed(() => {
      return (typeof props.total === 'function' ? props.total() : props.total) ?? 0
    })
    const isMoreThanOne = computed(() => {
      return total.value > 1
    })
    const totalText = computed(() => {
      return (
        (typeof props.totalText === 'function' ? props.totalText() : props.totalText) ??
        (isMoreThanOne.value ? `${total.value} 家可用门店` : '查看全部')
      )
    })
    const onMoreClick = () => {
      useGoodsSuitableShops(props.goodsId)
    }

    return () => {
      return (
        <div class="goods-suitable-shops" onClick={onMoreClick}>
          <div class="header">
            <div class="title">{title.value}</div>
            {isMoreThanOne.value && (
              <div class="more">
                {totalText.value}&nbsp;
                <Icon name="right" />
              </div>
            )}
          </div>
          {shops.value.map(item => {
            return <ShopItem {...item} />
          })}
        </div>
      )
    }
  }
})

/** 商品适用门店 */
export const useGoodsSuitableShops = (goodsId: string) => {
  const { close } = useModal({
    title: '适用门店',
    height: 'max',
    padding: 0,
    content: <ShopList goodsId={goodsId} />
  })

  return {
    close
  }
}

export const ShopList = defineComponent({
  props: {
    goodsId: {
      type: String,
      required: true
    },
    asSelector: {
      type: Boolean,
      default: false
    },
    selectedShopId: {
      type: [String, Number]
    }
  },
  emits: {
    select: (shopItem: IShopItemOptions) => true
  },
  setup(props, { emit }) {
    const userStore = useUserStore()
    const { fetchData, isEmpty, refreshData, data, refresherTriggered, EndTip } = usePagination({
      requestHandler: params => {
        return getGoodsSuitableShops({ ...params, goodsId: props.goodsId })
      },
      showLoading: true
    })

    watch(
      () => userStore.userLocation,
      () => {
        refreshData()
      }
    )

    onMounted(() => {
      userStore.getUserLocation({ denyTip: true }).finally(() => {
        fetchData()
      })
    })

    const shops = computed(() => {
      return data.value
        .map(item => {
          return {
            id: item.id,
            name: item.name,
            address: item.address,
            longitude: item.location?.lng,
            latitude: item.location?.lat,
            openAt: item.openingAt,
            closeAt: item.closingAt,
            distance: item.distance ? (item.distance as any) / 1000 : undefined,
            tell: item.contactInfo?.[0]?.contactPhone
          } as IShopItemOptions
        })
        .sort((a, b) => {
          return (a.distance as number) - (b.distance as number)
        })
    })

    watch(
      () => shops.value,
      () => {
        if (props.asSelector && !current.value) {
          onShopItemClick(shops.value[0])
        }
      }
    )

    const current = ref(props.selectedShopId || '')

    watch(
      () => props.selectedShopId,
      () => {
        current.value = props.selectedShopId || ''
      }
    )

    const onShopItemClick = (shopItem: IShopItemOptions) => {
      if (props.asSelector) {
        current.value = shopItem.id
        emit('select', shopItem)
      }
    }

    return () => {
      if (isEmpty.value) {
        return <EmptyStatus description="暂无适用门店" />
      }

      return (
        <ScrollView
          class="goods-suitable-shops-list"
          scrollY
          onScrolltolower={fetchData}
          onRefresherrefresh={() => refreshData()}
          refresherEnabled
          refresherTriggered={refresherTriggered.value}
        >
          <div class="goods-suitable-shops-list__header"></div>
          <div class="goods-suitable-shops-list__content">
            {shops.value.map(item => {
              return (
                <ShopItem
                  class={current.value === item.id && 'active'}
                  onClick={() => onShopItemClick(item)}
                  {...item}
                />
              )
            })}
          </div>
          <EndTip />
        </ScrollView>
      )
    }
  }
})
