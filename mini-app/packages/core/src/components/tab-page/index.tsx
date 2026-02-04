import { computed, defineComponent, PropType, ref, ExtractPublicPropTypes, watch } from 'vue'
import './style.scss'
import { Icon, ScrollTab, ScrollTabItem } from '@pkg/ui'
import { ScrollView, ScrollViewProps, Swiper, SwiperItem } from '@tarojs/components'
import EmptyStatus from '../empty-status'
import Spin from '../spin'
import { pick } from 'lodash-es'
import Taro from '@tarojs/taro'
import { ComputedValue, useComputedValue } from '../../hooks'
import { renderAnyNode } from '@pkg/utils'

export interface TabPageItem {
  key?: string | number
  title: any
  tabClassName?: string
  viewClassName?: string
  scrollView?: ScrollViewProps
  useScrollView?: boolean
  onLoad?: () => void
  content?: () => any
  onClick?: () => void
}

const commonPropsDefine = {
  tabs: {
    type: Array as PropType<TabPageItem[]>,
    required: true
  },
  current: {
    type: Number
  },
  stretch: {
    type: Boolean,
    default: true
  },
  tabLeft: {},
  tabRight: {}
}

const TabPage = defineComponent({
  name: 'CommonTabPage',
  props: {
    ...commonPropsDefine,
    scrollViewDisabled: Boolean
  },
  emits: {
    change: (current: number) => true
  },
  setup(props, { emit }) {
    const { tabs, current, currentTab, toggle } = useCommonTab({
      ...props,
      tabs: () => props.tabs!,
      onChange: index => emit('change', index)
    })

    watch(
      () => props.current,
      () => {
        props.current !== undefined && toggle(props.current)
      }
    )

    const Content = () => {
      if (props.scrollViewDisabled) {
        return currentTab.value?.content?.() || <EmptyStatus />
      }
      return (
        <Swiper
          class="c_tab-page__swiper"
          current={current.value}
          onChange={e => {
            toggle(e.detail.current)
          }}
        >
          {tabs.value.map(tab => {
            const Content = tab.loaded ? (
              tab.content?.() || <EmptyStatus />
            ) : (
              <EmptyStatus image={<Spin />} title={null} description="加载中" />
            )
            return (
              <SwiperItem class="c_tab-page__swiper-item" key={tab.key}>
                {tab.useScrollView !== false ? (
                  <ScrollView class="c_tab-page__scroll-view" scrollY {...tab.scrollView}>
                    {Content}
                  </ScrollView>
                ) : (
                  Content
                )}
              </SwiperItem>
            )
          })}
        </Swiper>
      )
    }

    const tabProps = computed(() => {
      return {
        ...pick(props, Object.keys(commonPropsDefine)),
        tabs: tabs.value,
        current: current.value,
        onChange: index => toggle(index)
      }
    })

    return () => {
      return (
        <div class="c_tab-page">
          <CommonTab {...tabProps.value} />
          <div class="c_tab-page__content">
            <Content />
          </div>
        </div>
      )
    }
  }
})

export default TabPage

export const CommonTab = defineComponent({
  props: {
    ...commonPropsDefine
  },
  emits: {
    change: (current: number) => true
  },
  setup(props, { emit }) {
    const current = computed({
      get() {
        return props.current ?? 0
      },
      set(index: number) {
        emit('change', index)
      }
    })
    return () => {
      return (
        <div class={['c_tab-page__tab', props.stretch && 'stretch']}>
          {props.tabLeft}
          <div class="c_tab-page__tab-center">
            <ScrollTab current={current.value}>
              <div class="c_tab-page__tab-content">
                {props.tabs!.map((tab, index) => {
                  const isActive = index === current.value
                  return (
                    <div
                      key={tab.key}
                      class={['c_tab-page__tab-item', tab.tabClassName, isActive && 'active']}
                      onClick={() => {
                        tab.onClick ? tab.onClick() : (current.value = index)
                      }}
                      onTouchstart={
                        process.env.TARO_ENV !== 'h5'
                          ? () => {
                              Taro.vibrateShort({
                                type: 'medium'
                              })
                            }
                          : undefined
                      }
                    >
                      <ScrollTabItem>{renderAnyNode(tab.title)}</ScrollTabItem>
                      {isActive && <Icon class="arc" name="arc" />}
                    </div>
                  )
                })}
              </div>
            </ScrollTab>
          </div>
          {props.tabRight}
        </div>
      )
    }
  }
})

export const useCommonTab = (
  options: Omit<ExtractPublicPropTypes<typeof commonPropsDefine>, 'tabs'> & {
    tabs: ComputedValue<TabPageItem[]>
    onChange?: (index: number) => void
  }
) => {
  const tempTabs = useComputedValue(options.tabs)
  const tabs = computed(() => {
    return (tempTabs.value || []).map((tab, index) => {
      return {
        ...tab,
        loaded: loadedTabs.value.includes(index)
      }
    })
  })

  const current = ref(options.current || 0)
  const currentTab = computed(() => tabs.value[current.value])

  const loadedTabs = ref<number[]>([])

  const toggle = (index: number) => {
    if (index !== current.value) {
      options.onChange?.(index)
    }
    current.value = index
    const tab = tabs.value[index]
    if (tab && !loadedTabs.value.includes(index)) {
      loadedTabs.value.push(index)
      tab.onLoad?.()
    }
  }

  toggle(options.current ?? 0)

  const Tab = () => {
    return <CommonTab {...options} tabs={tabs.value} current={current.value} onChange={i => toggle(i)} />
  }

  return {
    CommonTab,
    Tab,
    tabs,
    current,
    currentTab,
    toggle,
    TabPage
  }
}
