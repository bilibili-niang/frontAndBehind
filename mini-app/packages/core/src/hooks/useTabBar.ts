import { computed, isRef, Ref, ref, watch } from 'vue'
import { ITabBarItem } from '../components/tab-bar'
const useTab = (options: {
  /** tab 列表 */
  tabs: ITabBarItem[] | Ref<ITabBarItem[]>
  /** 当前 tab key */
  current?: string
  /** 切换回调 */
  onChange?: (key?: string, index?: number) => void
}) => {
  const tabs = computed(() => {
    return isRef(options.tabs) ? options.tabs.value : options.tabs
  })
  const currentTab = ref(options.current ?? tabs.value[0].key)

  watch(
    () => tabs.value,
    () => {
      if (!tabs.value.find(item => item.key === currentTab.value)) {
        currentTab.value = tabs.value[0]?.key
        toggleTab(currentTab.value)
      }
    }
  )

  const loadedTab = ref(
    tabs.value.reduce((obj, item) => {
      obj[item.key] = false
      return obj
    }, {})
  )
  loadedTab.value[currentTab.value] = true

  let lastTab = currentTab.value

  const toggleTab = (key: string) => {
    lastTab = currentTab.value
    currentTab.value = key
    loadedTab.value[key] = true
    options.onChange?.(
      currentTab.value,
      tabs.value.findIndex(item => item.key === currentTab.value)
    )
  }

  const backToLastTab = () => {
    loadedTab.value[currentTab.value] = false
    toggleTab(lastTab)
  }

  return {
    tabs,
    currentTab,
    toggleTab,
    loadedTab,
    backToLastTab
  }
}

export default useTab
