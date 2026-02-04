import { BasePage, emitter, useAppStore } from '@pkg/core'
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import './style.scss'
import { Search } from '@pkg/ui'
import { getPageKey } from '../../router'
import { nextTick, useDidShow, useRouter } from '@tarojs/taro'
import SearchRecords from './history-records'
import { useSearchStore } from '../../stores'
import HotSearch from './hot-search'
import { storeToRefs } from 'pinia'
import useAction from '../../hooks/useAction'
import { DeckRender } from '@pkg/deck'

definePageConfig({
  navigationStyle: 'custom'
})

export default defineComponent({
  name: 'SearchPage',
  setup() {
    const route = useRouter()
    const initialKeywords = decodeURIComponent(route.params?.keywords || '')

    /** 输入框文本 */
    const keywords = ref('')

    const appStore = useAppStore()

    const searchStore = useSearchStore()
    const { searchBarKeywords, searchBarPlaceholder, searchPageDeckComponents } = storeToRefs(searchStore)

    const computedSearchBarKeywords = computed(() => {
      // 如果从其他页面进入，且携带关键词，那么只显示这个关键词
      if (initialKeywords) return initialKeywords
      return searchBarKeywords.value.map(item => item.text)
    })

    const searchStyleRef = computed(() => {
      return {
        height: `${appStore.menuButtonRect!.height + 2}px`
      }
    })

    /** 搜索，优先级：输入框文本 > 外部词条 > 词条动作 > 词条搜索值 > 词条文本 */
    const onSearch = text => {
      if (!keywords.value) {
        const target = searchBarKeywords.value?.find(item => item.text === text)
        if (target) {
          if (target.action) {
            useAction(target.action)
            return void 0
          }
          searchStore.search(target.value || text)
          return void 0
        } else {
          searchStore.search(text)
        }
      }
      searchStore.search(text)
    }

    const onChange = (text: string) => {
      keywords.value = text
    }

    const isFocused = ref(true)
    const onBlur = () => {
      isFocused.value = false
    }

    const focus = () => {
      if (isFocused.value) {
        isFocused.value = false
        nextTick(() => {
          isFocused.value = true
        })
      } else {
        isFocused.value = true
      }
    }

    useDidShow(() => {
      focus()
    })

    if (process.env.TARO_ENV === 'h5') {
      onMounted(() => {
        focus()
      })
    }

    // 从其他页面触发设置搜索关键词
    const onSetKeywords = (text?: string) => {
      keywords.value = text || ''
    }
    const pageKey = getPageKey()

    emitter.on(`setSearchKeywords:${pageKey}`, onSetKeywords)

    onBeforeUnmount(() => {
      emitter.off(`setSearchKeywords:${getPageKey(pageKey)}`)
    })

    return () => {
      return (
        <BasePage
          navigator={{
            showMenuButton: false,
            title: (
              <div style={searchStyleRef.value} class="p_search__search" onClick={focus}>
                <Search
                  value={keywords.value}
                  placeholder={searchBarPlaceholder.value}
                  keywords={computedSearchBarKeywords.value}
                  focus={isFocused.value}
                  onBlur={onBlur}
                  onChange={onChange}
                  onSearch={onSearch}
                />
              </div>
            )
          }}
          backgroundColor="#fff"
          class="p_search"
        >
          <div class="p_search__content">
            {/* 搜索记录 */}
            <SearchRecords />
            {/* 热搜 */}
            <HotSearch />
          </div>
          {/* 装修组件 */}
          <DeckRender components={searchPageDeckComponents.value} />
        </BasePage>
      )
    }
  }
})
