import { defineComponent, onMounted, ref, watch } from 'vue'
import './history-records.scss'
import Taro, { useDidShow } from '@tarojs/taro'
import { Icon } from '@anteng/ui'
import { useSearchStore } from '../../stores'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'SearchHistoryRecords',
  setup() {
    const searchStore = useSearchStore()
    const { records } = storeToRefs(searchStore)
    const clearRecords = () => {
      searchStore.clearRecords(() => {
        toggleManage()
      })
    }
    const toggleManage = () => {
      isEditing.value = !isEditing.value
      isCollapse.value = !isEditing.value
      if (!isEditing.value) {
        // 删除后可能导致折叠位置发生变化，需要重新计算
        calcCollapse()
      }
    }

    const tagQuery = Taro.createSelectorQuery()
      .select('.search-records__content')
      .fields({ size: true })
      .selectAll('.search-records__item')
      .fields({ size: true, computedStyle: ['margin'] })
      .select('.search-records__collapse')
      .fields({ size: true, computedStyle: ['margin'] })

    const isEditing = ref(false)

    const collapseIndex = ref(-1)
    const collapseHeight = ref(0)
    const fullHeight = ref(0)
    const isCollapse = ref(true)
    let initialized = false

    const calcCollapse = () => {
      /** 延迟 300 ms 计算，防止和键盘抬起动作冲突 */
      if (!initialized) return void 0
      // 编辑时默认展开
      if (isEditing.value) return void 0
      if (records.value.length === 0) return void 0
      // collapseIndex.value = -1
      tagQuery.exec(res => {
        if (!res[0]) return void 0
        const container = res[0]
        const containerWidth = container.width
        const collapse = res[2]
        const collapseWidth = collapse.width + parseFloat(collapse.margin) * 2
        const items = res[1]
        const itemsWidth = items.map((item: any) => item.width + parseFloat(item.margin) * 2)
        const { index, rows } = calculateCollapseIndex(containerWidth, collapseWidth, itemsWidth)
        const rowHeight = collapse.height + parseFloat(collapse.margin) * 2
        collapseHeight.value = rows * rowHeight
        fullHeight.value = container.height + rowHeight
        collapseIndex.value = index

        if (collapseIndex.value === -1) {
          // 不显示展开按钮的情况下，默认折叠
          isCollapse.value = true
        }
      })
    }

    // 搜索记录变化时（个数，顺序）重新计算折叠
    watch(
      () => records.value,
      () => {
        calcCollapse()
      },
      { deep: true }
    )

    onMounted(() => {
      setTimeout(() => {
        initialized = true
        calcCollapse()
      }, 300)
    })

    useDidShow(() => {
      calcCollapse()
    })

    const onItemClick = (index: number) => {
      if (isEditing.value) {
        // 删除
        searchStore.removeRecord(index)
        if (records.value.length === 0) {
          toggleManage()
        }
      } else {
        // 搜索
        const text = records.value[index]
        searchStore.search(text)
      }
    }

    return () => {
      if (records.value.length === 0) {
        return null
      }
      return (
        <>
          <div class="search-records__title">
            搜索记录
            {isEditing.value ? (
              <div class="search-records__manager">
                <span class="search-records__clear" onClick={clearRecords}>
                  全部删除
                </span>
                <span class="split">丨</span>
                <span class="search-records__exit-edit" onClick={toggleManage}>
                  完成
                </span>
              </div>
            ) : (
              <Icon name="trash" class="search-records__trash" onClick={toggleManage} />
            )}
          </div>
          <div
            class={['search-records', !isCollapse.value && 'expanding', isEditing.value && 'editing']}
            style={{
              maxHeight: isCollapse.value ? collapseHeight.value + 'px' : fullHeight.value + 'px'
            }}
          >
            <div class="search-records__content">
              {records.value.map((text, index) => {
                const tag = (
                  <div
                    class={[
                      'search-records__item',
                      collapseIndex.value !== -1 && index >= collapseIndex.value && 'overflow'
                    ]}
                    onClick={() => onItemClick(index)}
                  >
                    <span class="text">{text}</span>
                    {isEditing.value && <Icon name="close" class="search-records__remove" />}
                  </div>
                )
                if (index === collapseIndex.value) {
                  return [
                    <div
                      class="search-records__expand"
                      onClick={() => {
                        isCollapse.value = false
                      }}
                    >
                      <Icon name="down" />
                    </div>,
                    tag
                  ]
                }
                return tag
              })}
              <div
                class="search-records__collapse"
                onClick={() => {
                  isCollapse.value = true
                }}
              >
                <Icon name="up" />
              </div>
            </div>
          </div>
        </>
      )
    }
  }
})

/** 计算折叠下标索引 */
function calculateCollapseIndex(containerWidth: number, collapseWidth: number, itemsWidth: number[], rows: number = 2) {
  let row = 1
  let index = -1
  let width = 0
  const _rows = rows > 2 ? rows : 2
  for (let i = 0; i < itemsWidth.length; ) {
    width = width + itemsWidth[i]
    if (width > containerWidth) {
      if (row + 1 > _rows) {
        // 边界情况，刚好可以完全放下
        if (i === itemsWidth.length - 1 && width - collapseWidth < containerWidth) {
          index = -1
        } else {
          index = i
        }
        break
      }
      row++
      width = row === _rows ? collapseWidth : 0
      continue
    } else {
      i++
    }
  }
  return {
    index,
    rows: row
  }
}
