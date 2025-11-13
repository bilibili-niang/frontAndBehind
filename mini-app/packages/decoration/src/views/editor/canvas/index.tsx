import { computed, defineComponent, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import './style.scss'
import useEditorStore from '../../../stores/editor'
import { storeToRefs } from 'pinia'
import ComponentItem from './component-item'
import useCanvasStore from '../../../stores/canvas'

import { message } from '@anteng/ui'
import useComponentStore, { type ComponentDefine } from '../../../stores/component'
import { SCOPE_LOGIN } from '../../../constants'

export default defineComponent({
  name: 'DeckEditorRender',
  setup() {
    const editorStore = useEditorStore()
    const { viewWidth, viewHeight, scale, isStretch } = storeToRefs(editorStore)
    const canvasStore = useCanvasStore()
    const { components, page, pagePkg, renderComponents } = storeToRefs(canvasStore)

    const componentStore = useComponentStore()

    const containerRef = ref<HTMLElement>()
    const resizeObserver = ref<ResizeObserver>()

    const resize = () => {
      const width = containerRef.value!.offsetWidth
      const height = containerRef.value!.offsetHeight
      editorStore.resize(width, height)
    }

    const offResize = () => {
      resizeObserver.value?.disconnect()
      resizeObserver.value = undefined
    }

    onBeforeUnmount(offResize)

    watch(
      () => containerRef.value,
      () => {
        if (!containerRef.value) return void 0
        resize()
        resizeObserver.value = new ResizeObserver(resize)
        resizeObserver.value.observe(containerRef.value)
      },
      { immediate: true }
    )
    const deviceStyle = computed(() => {
      return {
        width: `${viewWidth.value * scale.value}px`,
        height: isStretch.value ? 'calc(100% - 48px)' : `${viewHeight.value * scale.value}px`,
        fontSize: `${16 * scale.value}px`,
        '--scale': editorStore.scale
      }
    })

    const navigatorStyle = computed(() => {
      return `transform: scale(${scale.value})`
    })
    const viewportStyle = computed(() => {
      return `
        padding-top: ${88 * scale.value}px;
      `
    })

    const onDrop = (e: DragEvent) => {
      try {
        const comp = JSON.parse(
          e.dataTransfer?.getData('deck-component')!
        ) as unknown as ComponentDefine
        canvasStore.addComponent(comp)
      } catch (err: any) {
        message.error(`添加组件失败${err.message}`)
      }
    }

    provide('deck-comp', ComponentItem)

    const BasePageRef = computed(() => {
      return pagePkg.value?.render
    })

    return () => {
      const BasePage = BasePageRef.value
      if (!BasePage) {
        return null
        return (
          <div style="height: 80vh" class="flex-center">
            找不到页面组件&emsp;<strong class="color-primary">{canvasStore.scope}</strong>&emsp;!
          </div>
        )
      }
      return (
        <div
          class="deck-editor-render"
          ref={containerRef}
          onClick={() => {
            canvasStore.selectComponent('')
          }}
        >
          <div
            class="deck-editor-render__device"
            onClick={(e) => e.stopPropagation()}
            style={deviceStyle.value}
          >
            <div
              class="deck-editor-render__viewport"
              style={{
                // 登录页不允许滚动
                overflow: canvasStore.scope === SCOPE_LOGIN ? 'hidden' : undefined
              }}
            >
              <div
                class="deck-editor-render__view"
                onDrop={onDrop}
                onDragover={(e) => {
                  e.preventDefault()
                }}
              >
                <BasePage page={page.value}>
                  {renderComponents.value.map((item) => (
                    <ComponentItem key={item.id} comp={item} config={item.config} />
                  ))}
                </BasePage>
              </div>
            </div>
            <div class="deck-editor-render__footer"></div>
          </div>
        </div>
      )
    }
  }
})
