// 推荐组件
import './style.scss'
import { defineComponent, ref, computed, onMounted } from 'vue'
import GoodsItem from '../goods-item'
import { navigateToGoodsDetail } from '../../router'
import { requestGetGoodsListByRule } from '../../api'
import { ScrollAnchor, usePagination } from '@pkg/core'

export default defineComponent({
  name: 'Recommended',
  props: {
    // 0 空 1 猜你喜欢 2 热门商品 3 最近热销
    type: {
      type: Number,
      default: 0
    },
    categoryId: {
      type: Array,
      default: () => [1]
    }
  },
  setup(props) {
    /** 前端分页 */
    const fePagination = ref(false)

    const { data, fetchData, CommonPaginationStatus } = usePagination({
      requestHandler: params => {
        return requestGetGoodsListByRule({
          ...params,
          size: 10,
          showType: props.type,
          categoryIds: props.type === 1 ? props.categoryId.join(',') : undefined
        }).then(res => {
          if (res.data?.records?.length > 10) {
            fePagination.value = true
          }
          return res
        })
      }
    })

    const page = ref(1)
    const goods = computed(() => {
      if (fePagination.value) {
        return data.value.slice(0, page.value * 10)
      }
      return data.value
    })

    function groupArray<T>(arr: T[], columns: number): T[][] {
      const result: T[][] = new Array(columns).fill(null).map(() => [])
      for (let i = 0; i < arr.length; i++) {
        const columnIndex = i % columns
        result[columnIndex].push(arr[i])
      }
      return result
    }

    const clos = computed(() => {
      if (goods.value.length === 0) {
        return []
      } else {
        return groupArray(goods.value, 2)
      }
    })
    const init = () => {
      if (props.type === 0) {
        return void 0
      }
      fetchData()
    }

    onMounted(() => init())

    const getData = () => {
      if (fePagination.value) {
        page.value++
      } else {
        fetchData()
      }
    }

    return () => {
      if (!(data.value.length > 0)) {
        return null
      }
      
      return (
        <div class="recommended">
          {props.type === 0 && <div></div>}
          {props.type === 1 && <div class="recommend-title">— 猜你喜欢 —</div>}
          {props.type === 2 && <div class="recommend-title">— 热门商品 —</div>}
          {props.type === 3 && <div class="recommend-title">— 近期热销 —</div>}

          <div class="goods-list-content">
            <div class="c_goods-list">
              {clos.value.map((col, index) => {
                return (
                  <div class={['c_goods-list__col', index === 0 && 'col-1']}>
                    {col.map((item: any) => {
                      if (!item) return null
                      return (
                        <GoodsItem
                          type="vertical"
                          image={item.coverImages[0]}
                          name={item.title}
                          price={item.priceMin}
                          priceMax={item.priceMax}
                          listPrice={item.underlinePrice}
                          onClick={() => navigateToGoodsDetail(item.id)}
                        />
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
          <CommonPaginationStatus />
          <ScrollAnchor onReach={getData} />
        </div>
      )
    }
  }
})
