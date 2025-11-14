import { computed, defineComponent, PropType, ref, watch } from 'vue'
import './style.scss'

import GoodsItem from '../../goods-item'
import getGoodsList from '../../../api/deck-comps/getGoodsList'
import { DeckComponentConfig } from '../types'
import { navigateToGoodsDetail } from '../../../router'
import { COMMON_STATUS_OFF } from '../../../constants'

function groupArray<T>(arr: T[], columns: number): T[][] {
  const result: T[][] = new Array(columns).fill(null).map(() => [])
  for (let i = 0; i < arr.length; i++) {
    const columnIndex = i % columns
    result[columnIndex].push(arr[i])
  }
  return result
}

export default defineComponent({
  name: 'c_goods-list',
  props: {
    comp: {
      type: Object as PropType<
        DeckComponentConfig<{
          goodsList: any[]
        }>
      >,
      required: true
    }
  },
  setup(props) {
    const list = computed(() => {
      return props.comp.config.goodsList
        .map(item => {
          const target = cacheMap.value.get(item?.goods?.id)
          if (target && target.status !== COMMON_STATUS_OFF)
            return {
              id: target.id,
              name: target.title,
              image: target.coverImages?.[0],
              price: target.priceMin,
              listPrice: target.underlinePrice
            }
          return null
        })
        .filter(item => item)
    })
    const clos = computed(() => {
      return groupArray(list.value, 2)
    })

    const cacheMap = ref(new Map())

    const getData = () => {
      const goodsIds = props.comp.config.goodsList
        .map(item => item?.goods?.id)
        .filter(item => item && !cacheMap.value.get(item))
      if (goodsIds.length > 0) {
        getGoodsList(goodsIds).then(res => {
          res.data.forEach((goods: any) => {
            if (goods) {
              cacheMap.value.set(goods.id, goods)
            }
          })
        })
      }
    }

    watch(
      () => props.comp.config.goodsList,
      () => {
        getData()
      },
      { immediate: true, deep: true }
    )

    const onGoodsItemClick = (id: string) => {
      navigateToGoodsDetail(id)
    }

    return () => {
      return (
        <div class="c_goods-list">
          {clos.value.map((col, index) => {
            return (
              <div class={['c_goods-list__col', index === 0 && 'col-1']}>
                {col.map((item: any) => {
                  if (!item) return null
                  return (
                    <GoodsItem
                      type="vertical"
                      image={item.image}
                      name={item.name}
                      price={item.price}
                      priceMax={item.priceMax}
                      listPrice={item.listPrice}
                      // @ts-ignore
                      onClick={() => onGoodsItemClick(item.id)}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      )
    }
  }
})
