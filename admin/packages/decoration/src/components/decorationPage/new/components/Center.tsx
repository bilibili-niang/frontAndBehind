import './center.scss'
import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Icon, Modal } from '@pkg/ui'
import { useDecorationStore } from '../../../../store'
import customPageSchema from '../../../../store/customPageSchema'
import { cloneDeep, defaultsDeep } from 'lodash'
import { PhoneNavbar, StatusBar } from '../../../../../lib'
import PageComponentWrapper from './PageComponentWrapper'

export default defineComponent({
  name: 'DecorationNewCenter',
  setup() {
    const store = useDecorationStore()
    const frameRef = ref<HTMLElement | null>(null)
    const bodyRef = ref<HTMLElement | null>(null)
    const controlsRef = ref<HTMLElement | null>(null)
    const controlsStyle = ref<Record<string, any>>({ display: 'none' })
    const dragging = ref(false)
    const DND_KEY = 'DECORATION_COMPONENT_KEY'

    const updateControlsPosition = () => {
      const frameEl = frameRef.value
      const bodyEl = bodyRef.value
      const controlsEl = controlsRef.value
      const activeId = store.activeId
      if (!frameEl || !bodyEl || !controlsEl || !activeId) {
        controlsStyle.value = { display: 'none' }
        return
      }
      const itemEl = bodyEl.querySelector<HTMLElement>(`.preview-item[data-id="${activeId}"]`)
      if (!itemEl) {
        controlsStyle.value = { display: 'none' }
        return
      }

      // 获取各元素的位置信息
      const frameRect = frameEl.getBoundingClientRect()
      const bodyRect = bodyEl.getBoundingClientRect()
      const itemRect = itemEl.getBoundingClientRect()
      const controlsRect = controlsEl.getBoundingClientRect()

      // 计算相对于手机框架的位置，考虑滚动偏移
      const scrollTop = bodyEl.scrollTop
      const itemTopInBody = itemEl.offsetTop
      const itemHeightHalf = itemRect.height / 2
      const controlsHeightHalf = (controlsRect?.height || 0) / 2

      // 计算控制栏应该显示的位置（相对于手机框架顶部）
      let top = itemTopInBody + itemHeightHalf - controlsHeightHalf - scrollTop + (bodyRect.top - frameRect.top)

      // 限制在可视区域内
      const minTop = 8
      const maxTop = frameRect.height - (controlsRect?.height || 0) - 8
      if (top < minTop) top = minTop
      if (top > maxTop) top = maxTop

      controlsStyle.value = { top: `${top}px`, display: 'block' }
    }

    const bindListeners = () => {
      const bodyEl = bodyRef.value
      if (bodyEl) {
        bodyEl.addEventListener('scroll', updateControlsPosition)
      }
      window.addEventListener('resize', updateControlsPosition)
    }

    const unbindListeners = () => {
      const bodyEl = bodyRef.value
      if (bodyEl) {
        bodyEl.removeEventListener('scroll', updateControlsPosition)
      }
      window.removeEventListener('resize', updateControlsPosition)
    }

    onMounted(() => {
      bindListeners()
      nextTick(updateControlsPosition)
    })
    onBeforeUnmount(() => unbindListeners())

    watch(
      () => store.activeId,
      async () => {
        await nextTick()
        updateControlsPosition()
      }
    )

    // 监听组件列表变化，确保添加/删除组件时更新控制栏位置
    watch(
      () => store.pageComponents.length,
      async () => {
        await nextTick()
        // 延迟一帧确保DOM完全更新
        requestAnimationFrame(() => {
          updateControlsPosition()
        })
      }
    )

    // 监听活动组件的属性变化，可能影响组件高度
    watch(
      () => store.activeComponent?.value,
      async () => {
        await nextTick()
        requestAnimationFrame(() => {
          updateControlsPosition()
        })
      },
      { deep: true }
    )

    const onBodyClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // 如果点击位置不在任何 preview-item 内，则取消选中
      if (!target.closest('.preview-item')) {
        // 空白区域展示页面配置（custom-page）
        store.setActive(null)
      }
    }

    return () => (
      <div
        class="decoration-center flex items-center justify-center p-4 overflow-hidden flex-col border-r border-[var(--color-border-base)] bg-[var(--anteng-color-bg-50)]">
        <div
          ref={frameRef}
          class="phone-frame w-[375px] bg-white flex flex-col"
          style={{ transform: `scale(${store.zoom})`, transformOrigin: 'top center' }}
        >
          <StatusBar class={{
            'fixed-status-bar':true
          }}/>
          {(() => {
            // 从页面级配置（customPageSchema）读取导航栏属性
            const pageNav = (store.pageValue as any)?.navigator || {}
            const navOptions = defaultsDeep(cloneDeep(pageNav), customPageSchema.default.navigator)
            return (
              <PhoneNavbar
                options={navOptions}
                theme={navOptions.theme || 'basic'}
                onClick={() => store.setActive(null)}/>
            )
          })()}
          <div
            ref={bodyRef}
            class={["phone-body", "flex-1", dragging.value && "--dragging"]}
            onClick={onBodyClick}
            onDragover={(e) => {
              e.preventDefault()
              dragging.value = true
            }}
            onDragenter={() => {
              dragging.value = true
            }}
            onDragleave={() => {
              dragging.value = false
            }}
            onDrop={(e) => {
              e.preventDefault()
              const key = e.dataTransfer?.getData(DND_KEY)
              dragging.value = false
              if (key) {
                store.addComponent(key)
              }
            }}
            style={{
              background: store.pageValue.basic?.background || undefined,
              padding: (() => {
                const cp = store.pageValue.basic?.contentPadding || [0, 0, 0, 0]
                return `${cp[0]}px ${cp[1]}px ${cp[2]}px ${cp[3]}px`
              })()
            }}
          >
            {store.pageComponents.length === 0 ? (
              <div class="empty text-[var(--color-text-secondary)] text-align-center">请从左侧添加组件</div>
            ) : (
              <div class="preview-list flex flex-col" style={{ gap: `${store.pageValue.basic?.gap ?? 8}px` }}>
                {store.pageComponents.map((c) => (
                  <PageComponentWrapper item={c}/>
                ))}
              </div>
            )}
          </div>

          {/* 外部悬浮的操作控件层（容器外部） */}
          <div ref={controlsRef} class="floating-controls" style={controlsStyle.value}>
            <div class="comp-control" onClick={(e) => {
              e.stopPropagation()
              store.activeId && store.moveComponentUp(store.activeId)
            }}>
              <Icon name="arrow-up"/>
            </div>
            <div class="comp-control" onClick={(e) => {
              e.stopPropagation()
              store.activeId && store.moveComponentDown(store.activeId)
            }}>
              <Icon name="arrow-down"/>
            </div>
            <div class="comp-control" onClick={(e) => {
              e.stopPropagation()
              store.activeId && store.copyComponent(store.activeId)
            }}>
              <Icon name="copy"/>
            </div>
            <div class="comp-control" onClick={(e) => {
              e.stopPropagation()
              if (!store.activeId) return
              Modal.confirm({
                title: '删除组件',
                content: '确定要删除当前组件吗？此操作不可撤销。',
                okText: '删除',
                cancelText: '取消',
                okType: 'danger',
                onOk: () => {
                  store.removeComponent(store.activeId as string)
                }
              })
            }}>
              <Icon name="delete"/>
            </div>
          </div>
        </div>
      </div>
    )
  }
})