import './style.scss'
import { defineComponent, PropType, ref } from 'vue'
import Icon from '../icon'

export interface PropertyTab {
  key: string
  title: string
  icon?: string
  render: () => any
}

export interface PropertyTabsProps {
  tabs: PropertyTab[]
  defaultActiveKey?: string
  onChange?: (activeKey: string) => void
}

export const PropertyTabs = defineComponent({
  name: 'PropertyTabs',
  props: {
    tabs: {
      type: Array as PropType<PropertyTab[]>,
      required: true
    },
    defaultActiveKey: {
      type: String,
      default: ''
    },
    onChange: {
      type: Function as PropType<(activeKey: string) => void>
    }
  },
  setup(props) {
    const activeKey = ref(props.defaultActiveKey || props.tabs[0]?.key || '')
    const paneRefs = ref<Record<string, HTMLElement | null>>({})
    const tabRefs = ref<Record<string, HTMLElement | null>>({})
    const isAnimating = ref(false)

    const setPaneRef = (key: string, el: HTMLElement | null) => {
      paneRefs.value[key] = el
    }
    const setTabRef = (key: string, el: HTMLElement | null) => {
      tabRefs.value[key] = el
    }

    const handleTabClick = (key: string) => {
      if (key === activeKey.value || isAnimating.value) return
      const prevKey = activeKey.value
      const prevEl = paneRefs.value[prevKey]
      const nextEl = paneRefs.value[key]

      isAnimating.value = true
      // 直接切换，无任何动画
      if (prevEl) prevEl.style.display = 'none'
      if (nextEl) nextEl.style.display = 'block'

      activeKey.value = key
      props.onChange?.(key)

      // 结束动画状态
      isAnimating.value = false
    }

    return () => (
      <div class="property-tabs">
        <div class="property-tabs__header">
          {props.tabs.map((tab) => (
            <div
              key={tab.key}
              ref={(el) => setTabRef(tab.key, el as HTMLElement)}
              class={[
                'property-tabs__tab clickable',
                activeKey.value === tab.key && '--active'
              ]}
              onClick={() => handleTabClick(tab.key)}
            >
              {tab.icon && <Icon class="property-tabs__icon" name={tab.icon}/>} 
              <span class="property-tabs__title">{tab.title}</span>
              <i class="property-tabs__arc-l"></i>
              <i class="property-tabs__arc-r"></i>
            </div>
          ))}
        </div>
        <div class="property-tabs__content">
          {props.tabs.map((tab) => (
            <div
              key={tab.key}
              ref={(el) => setPaneRef(tab.key, el as HTMLElement)}
              class="property-tabs__pane"
              style={{ display: activeKey.value === tab.key ? 'block' : 'none', opacity: 1 }}
            >
              {tab.render()}
            </div>
          ))}
        </div>
      </div>
    )
  }
})

export default PropertyTabs