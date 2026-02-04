import { useConfirm } from '@pkg/core'
import Taro from '@tarojs/taro'
import { defineStore, storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { navigateToGoodsList } from '../router'
import { Action } from '../hooks/useAction'
import useSystemPageStore from './system-page'

const useSearchStore = defineStore('search', () => {
  const systemPageStore = useSystemPageStore()
  const { searchPage } = storeToRefs(systemPageStore)

  /** 搜索记录词条列表 */
  const records = ref<string[]>([])

  /** 添加单个搜索记录，如已存在，将其提升到首位 */
  const addRecord = (text: string) => {
    const index = records.value.indexOf(text)
    if (index !== -1) {
      records.value.splice(index, 1)
      return addRecord(text)
    }
    records.value.unshift(text)
    storeRecords()
  }

  /** 移除单个搜索记录 */
  const removeRecord = (index: number) => {
    records.value.splice(index, 1)
    storeRecords()
  }

  /** 情况全部搜索记录，确定清除后回调 */
  const clearRecords = (callback?: () => void) => {
    useConfirm({
      title: '确定清空搜索记录吗？',
      onConfirm: () => {
        records.value = []
        storeRecords()
        callback?.()
      }
    })
  }

  /** 存储历史记录，当前为 localStorage 方案 */
  const storeRecords = () => {
    Taro.setStorageSync('search-records', records.value)
  }

  /** 恢复历史记录，当前为 localStorage 方案 */
  const retrieveRecords = () => {
    const s = Taro.getStorageSync('search-records')
    records.value = Array.isArray(s) ? s : []
  }

  // 立即恢复一次本地记录
  retrieveRecords()

  /** 搜索 */
  const search = (keywords: string) => {
    const _keywords = keywords?.trim?.()
    if (!_keywords) {
      return void 0
    }
    navigateToGoodsList({ keywords: _keywords })
    addRecord(_keywords)
  }

  type HotKeywordsItem = {
    /** 文本 */
    text: string
    value?: string
    /** 颜色 */
    color?: string
    /** 图标链接 */
    icon?: string
    /** 点击动作，若无 action 则作为搜索词条进行搜索 */
    action?: Action
  }

  const hotKeywords = computed<HotKeywordsItem[]>(() => {
    const { hotKeywords, hotKeywordsEnable } = searchPage.value?.decorate?.payload?.page ?? {}
    if (!hotKeywordsEnable) return []
    return (hotKeywords.list?.slice(0) ?? []).map(item => {
      return {
        ...item,
        icon: item.iconEnable ? item.icon?.url : void 0,
        color: item.colorEnable ? item.color : void 0
      }
    })
  })

  /** 开启热搜 */
  const hotKeywordsEnable = computed(() => {
    return !!searchPage.value?.decorate?.payload?.page?.hotKeywordsEnable
  })
  /** 热搜每页数量 */
  const hotKeywordsVisibleCount = computed(() => {
    return Math.max(2, searchPage.value?.decorate?.payload?.page?.hotKeywords?.visibleCount ?? 2)
  })

  /** 搜索框词条 */
  const searchBarKeywords = computed(() => {
    const { keywordsList } = searchPage.value?.decorate?.payload?.page?.searchBar ?? []
    return (
      keywordsList?.filter(item => {
        return item.text?.length > 0
      }) ?? []
    )
  })

  /** 搜索框占位符 */
  const searchBarPlaceholder = computed(() => {
    return searchPage.value?.decorate?.payload?.page?.searchBar?.placeholder ?? '搜索你感兴趣的内容'
  })

  /** 搜索页装修组件 */
  const searchPageDeckComponents = computed(() => {
    return searchPage.value?.decorate?.payload?.components ?? []
  })

  return {
    records,
    storeRecords,
    retrieveRecords,
    addRecord,
    removeRecord,
    clearRecords,
    search,
    hotKeywords,
    hotKeywordsEnable,
    hotKeywordsVisibleCount,
    searchBarKeywords,
    searchBarPlaceholder,
    searchPageDeckComponents
  }
})

export default useSearchStore
