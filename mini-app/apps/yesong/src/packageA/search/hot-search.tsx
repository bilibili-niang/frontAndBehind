import { computed, defineComponent, ref, watch } from 'vue'
import './hot-search.scss'
import { Icon } from '@pkg/ui'
import { useSearchStore } from '../../stores'
import { storeToRefs } from 'pinia'
import useAction from '../../hooks/useAction'

export default defineComponent({
  name: 'HotSearch',
  setup() {
    const searchStore = useSearchStore()
    const { hotKeywords, hotKeywordsEnable, hotKeywordsVisibleCount } = storeToRefs(searchStore)

    /** 点击，优先级：动作 > 实际搜索 > 按钮文本 */
    const onItemClick = (item: (typeof hotKeywords.value)[number]) => {
      if (item.action) {
        useAction(item.action)
      } else {
        searchStore.search(item.value || item.text)
      }
    }

    /** 显示的数据列表，数量为 count 的 2 倍以上效果最佳 */
    const renderData = ref<typeof hotKeywords.value>([])
    /** 循环因子 */
    let factor = 0

    /** 是否显示换一换 */
    const rollEnable = computed(() => {
      return hotKeywords.value.length > hotKeywordsVisibleCount.value
    })

    /** 换一换 */
    const rollTheChain = () => {
      const count = hotKeywordsVisibleCount.value
      const data = hotKeywords.value

      // 数量达不到可以换一换，直接全部返回
      if (data.length <= count) {
        renderData.value = data.slice(0)
        return void 0
      }
      const loopChain = [...data, ...data]
      const startIndex = (count * factor) % data.length
      renderData.value = loopChain.slice(startIndex, startIndex + count)
      factor++
    }

    rollTheChain()

    watch(
      () => hotKeywords.value,
      () => {
        factor = 0
        rollTheChain()
      }
    )

    return () => {
      if (!hotKeywordsEnable.value) return null
      if (hotKeywords.value.length === 0) return null
      return (
        <div class="hot-search">
          <div class="hot-search__title">
            热搜发现
            {rollEnable.value && (
              <div class="hot-search__toggle" onClick={rollTheChain}>
                换一换
                <Icon name="refresh" />
              </div>
            )}
          </div>
          <div class="hot-search__content">
            {renderData.value.map(item => {
              const style = {
                color: item.color
              }
              const icon = item.icon ? (
                <div
                  class="hot-search__item-icon"
                  style={{
                    backgroundImage: `url(${item.icon})`
                  }}
                ></div>
              ) : null
              return (
                <div
                  class={['hot-search__item', item.color && 'custom-color']}
                  style={style}
                  onClick={() => onItemClick(item)}
                >
                  {icon}
                  <span class="text">{item.text}</span>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  }
})
