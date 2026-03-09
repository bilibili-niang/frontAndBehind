import './left.scss'
import { defineComponent } from 'vue'
import { Icon, PropertyTabs, ScrollContainer } from '@pkg/ui'
import { useDecorationStore } from '../../../../store'

export default defineComponent({
  name: 'DecorationNewLeft',
  setup() {
    const store = useDecorationStore()

    const renderLayerPanel = () => {
      return (
        <div class="layer-panel">
          <div class="layer-panel__title">页面图层</div>
          <div class="layer-panel__body">
            {store.pageComponents.length === 0 ? (
              <div class="layer-empty">无图层，请添加组件</div>
            ) : (
              <ScrollContainer
                class="layer-list"
                thickness={8}
                autoHide={false}
              >
                {store.pageComponents.map((item) => (
                  <div
                    class={[
                      'layer-item',
                      store.activeId === item.id && '--active'
                    ]}
                    onClick={() => store.setActive(item.id)}
                  >
                    <span class="layer-item__name">{item.name}</span>
                  </div>
                ))}
              </ScrollContainer>
            )}
          </div>
        </div>
      )
    }

    const renderGroupContent = (type: 'common' | 'business' | 'page') => {
      const list = store.componentsCatalog.filter((m) => m.type === type)
      if (list.length === 0) return null
      return (
        <div class="group mb-4">
          <div class="group__grid grid grid-cols-2 gap-2">
            {list.map((m) => {
              return (
                <div
                  class="comp-card"
                  draggable={true}
                  onDragstart={(e) => {
                    try {
                      e.dataTransfer?.setData('DECORATION_COMPONENT_KEY', m.key)
                      e.dataTransfer!.effectAllowed = 'copy'
                    } catch {
                    }
                  }}
                >
                  <div class="comp-card__thumb">
                    {m.thumbnail ? <img src={m.thumbnail}/> : <div class="thumb-placeholder"/>}
                  </div>
                  <div class="comp-card__meta">
                    <span class="name">{m.name}</span>
                    <Icon name="plus"/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    const tabs = [
      {
        key: 'common',
        title: '通用组件',
        render: () => renderGroupContent('common')
      },
      {
        key: 'business',
        title: '业务组件',
        render: () => renderGroupContent('business')
      }
    ]

    return () => (
      <div
        class="decoration-left p-3 border-r border-[var(--color-border-base)] bg-[var(--ice-color-bg-300)]">
        {renderLayerPanel()}
        <div class="property-tabs-container">
          <PropertyTabs
            tabs={tabs}
            defaultActiveKey="common"
          />
        </div>
      </div>
    )
  }
})