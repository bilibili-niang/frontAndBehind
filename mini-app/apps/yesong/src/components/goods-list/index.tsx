import { computed, defineComponent, PropType } from 'vue'
import './style.scss'

import GoodsItem, { GoodsItemOptions } from '../goods-item'
import { navigateToGoodsDetail } from '../../router'

function groupArray<T>(arr: T[], columns: number): T[][] {
  const result: T[][] = new Array(columns).fill(null).map(() => [])
  for (let i = 0; i < arr.length; i++) {
    const columnIndex = i % columns
    result[columnIndex].push(arr[i])
  }
  return result
}

GoodsItem

export default defineComponent({
  name: 'c_goods-list',
  props: {
    list: {
      type: Array as PropType<GoodsItemOptions[]>,
      default: () => []
    },
    asSelector: {
      type: Boolean,
      default: false
    },
    select: {
      type: Function,
      default: () => ({})
    }
  },
  setup(props) {
    const list = computed(() => {
      return props.list
    })
    const cols = computed(() => {
      return groupArray(list.value, 2)
    })

    const onGoodsItemClick = (id: string) => {
      navigateToGoodsDetail(id)
    }

    return () => {
      return (
        <div class="c_goods-list">
          {cols.value.map((col, index) => {
            return (
              <div class={['c_goods-list__col', index === 0 && 'col-1']}>
                {col.map((item: any) => {
                  if (!item) return null
                  return (
                    <GoodsItem
                      type="vertical"
                      {...item}
                      // @ts-ignore
                      onClick={() => {
                        if (props.asSelector) {
                          props.select(item)
                        } else {
                          onGoodsItemClick(item.id)
                        }
                      }}
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
