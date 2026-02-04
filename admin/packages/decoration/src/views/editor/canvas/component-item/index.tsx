import { computed, defineComponent, ref, withModifiers, type PropType } from 'vue'
import './style.scss'
import './style.dark.scss'
import type { DeckComponent } from '../../../../stores/canvas'
import useCanvasStore from '../../../../stores/canvas'
import { storeToRefs } from 'pinia'
import { useContextMenu, uuid } from '@pkg/core'
import { Icon, Modal, Popover, Tooltip } from '@pkg/ui'
import useComponentStore from '../../../../stores/component'
import Comps from '../../menu/comps'

export default defineComponent({
  name: 'DeckEditorRenderComponent',
  props: {
    comp: {
      type: Object as PropType<DeckComponent>,
      required: true
    },
    config: {
      type: Object as PropType<{ [key: string]: any }>,
      required: true
    },
    pure: Boolean
  },
  setup(props) {
    const canvasStore = useCanvasStore()
    const { currentSelectedComponentId } = storeToRefs(canvasStore)

    const componentStore = useComponentStore()
    const { getComponentPackage } = componentStore

    const selectComponent = (scrollIntoView: boolean) => {
      if (canvasStore.currentSelectedComponentId === props.comp.id) {
        return void 0
      }
      canvasStore.selectComponent(props.comp.id, scrollIntoView)
    }

    const componentAttrsStyle = computed(() => {
      if (!props.comp) {
        return {}
      }
      const { opacity, padding, margin, background, backgroundEnable, borderRadius } =
        props.comp.attrs
      return {
        wrapper: {
          marginTop: `${margin[0]}rem`,
          marginBottom: `${margin[2]}rem`
        },
        comp: {
          opacity: (opacity ?? 100) / 100,
          padding: padding.map((i) => `${i}rem`).join(' '),
          marginLeft: `${margin[3]}rem`,
          marginRight: `${margin[1]}rem`,
          background: backgroundEnable ? background : undefined,
          borderRadius: borderRadius.map((i) => `${i}rem`).join(' ')
        }
      }
    })

    /** 显示排序菜单 */
    const onOrderContextMenu = (e: MouseEvent, type: 'up' | 'down') => {
      e.stopPropagation()
      e.preventDefault()
      const rect = (e.target as HTMLElement)!.getBoundingClientRect()
      const event = new MouseEvent('click', {
        screenX: rect.right + 12,
        screenY: rect.top - 6,
        clientX: rect.right + 12,
        clientY: rect.top - 6
      })
      const id = props.comp.id
      useContextMenu(event, {
        list: [
          ...(type === 'up'
            ? [
                {
                  key: 'up',
                  icon: 'up',
                  title: '上移',
                  handler: () => canvasStore.moveComponentUp(id)
                },
                {
                  key: 'top',
                  icon: 'to-top-one',
                  title: '置顶',
                  handler: () => canvasStore.moveComponentTop(id)
                }
              ]
            : [
                {
                  key: 'down',
                  icon: 'down',
                  title: '下移',
                  handler: () => canvasStore.moveComponentDown(id)
                },
                {
                  key: 'bottom',
                  icon: 'to-bottom-one',
                  title: '置底',
                  handler: () => canvasStore.moveComponentBottom(id)
                }
              ])
        ]
      })
    }
    const onMoveUpContextMenu = (e: MouseEvent) => {
      onOrderContextMenu(e, 'up')
    }
    const onMoveDownContextMenu = (e: MouseEvent) => {
      onOrderContextMenu(e, 'down')
    }
    const onCopyComponent = () => {
      canvasStore.copyComponent(props.comp.id)
    }

    const onRemoveComponent = () => {
      Modal.confirm({
        title: '删除组件',
        content: '组件删除后将无法恢复，您确定要删除吗？',
        okText: '确定删除',
        onOk() {
          canvasStore.removeComponent(props.comp.id)
        }
      })
    }

    const manifestRef = computed(() => getComponentPackage(props.comp.key)?.manifest)

    const isFixed = computed(() => {
      return !!manifestRef.value?.fixed
    })

    const bubbleHidden = computed(() => {
      return !!manifestRef.value?.bubbleHidden
    })

    const renderKey = ref(uuid())

    const reload = () => {
      renderKey.value = uuid()
    }

    const InsertComponent = (props: { dir: 'before' | 'after' }) => {
      return (
        <div class="inset-components-modal">
          <h4>在{props.dir === 'before' ? '上方' : '下方'}插入组件</h4>
          <Comps
            asSelector
            onSelect={(manifest) => {
              onInsetComponent(props.dir, manifest)
            }}
          />
        </div>
      )
    }

    const onInsetComponent = (dir: 'before' | 'after', manifest: any) => {
      const index = canvasStore.components.findIndex((item) => item.id === props.comp.id)
      if (index >= 0) {
        canvasStore.addComponent(manifest, props.comp.id, dir === 'before' ? 'above' : 'below')
      }
    }

    return () => {
      const Comp = props.comp.package?.render ?? getComponentPackage(props.comp.key)?.render
      const isActive = props.comp.id === currentSelectedComponentId.value
      return (
        <div
          id={`deck-comp-${props.comp.id}`}
          class={[
            'deck-editor-render-component',
            isActive && '--active',
            isFixed.value && '--fixed'
          ]}
          style={Comp ? componentAttrsStyle.value.wrapper : undefined}
          onClick={withModifiers(() => selectComponent(false), ['capture', 'stop'])}
        >
          <div class="render-component__bubble">
            {!props.pure && (
              <>
                <div
                  class="render-component__bubble-tag clickable"
                  style={{
                    visibility: bubbleHidden.value ? 'hidden' : undefined
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    selectComponent(true)
                  }}
                >
                  {props.comp.name}
                </div>
                <div class="render-component__controls">
                  <Popover
                    placement="rightTop"
                    destroyTooltipOnHide
                    trigger="click"
                    content={<InsertComponent dir="before" />}
                  >
                    <div class="render-component__control-item round clickable">
                      <Tooltip title="在上方插入">
                        <Icon style="font-size: 20px;" name="add" />
                      </Tooltip>
                    </div>
                  </Popover>
                  <div
                    class="render-component__control-item clickable"
                    onContextmenu={onMoveUpContextMenu}
                    onClick={() => {
                      canvasStore.moveComponentUp(props.comp.id)
                    }}
                  >
                    <iconpark-icon name="up"></iconpark-icon>
                    <iconpark-icon class="sink" name="right-one"></iconpark-icon>
                  </div>
                  <div
                    class="render-component__control-item clickable"
                    onContextmenu={onMoveDownContextMenu}
                    onClick={() => {
                      canvasStore.moveComponentDown(props.comp.id)
                    }}
                  >
                    <iconpark-icon style="padding-top: 2px;" name="down"></iconpark-icon>
                    <iconpark-icon class="sink" name="right-one"></iconpark-icon>
                  </div>
                  <div class="render-component__control-item clickable" onClick={onCopyComponent}>
                    <iconpark-icon style="font-size: 18px;" name="copy"></iconpark-icon>
                  </div>
                  <div class="render-component__control-item clickable" onClick={onRemoveComponent}>
                    <iconpark-icon style="font-size: 20px;" name="delete-one"></iconpark-icon>
                  </div>
                  <Popover
                    placement="rightTop"
                    destroyTooltipOnHide
                    trigger="click"
                    content={<InsertComponent dir="after" />}
                  >
                    <div class="render-component__control-item round clickable">
                      <Tooltip title="在下方插入">
                        <Icon style="font-size: 20px;" name="add" />
                      </Tooltip>
                    </div>
                  </Popover>
                </div>
              </>
            )}
          </div>
          <div class="render-component__control-layer"></div>
          <div class="render-component__clean"></div>
          <i class="render-component__top-border"></i>
          {Comp ? (
            <div class="render-component__container" style={componentAttrsStyle.value.comp}>
              <Comp
                key={renderKey.value}
                {...props}
                comp={props.comp}
                config={props.config}
                class={['render-component__comp', isActive && '--active']}
                onReload={reload}
                isActive={isActive}
              />
            </div>
          ) : (
            <div class="render-component__comp-lost">
              <Icon name="info" />
              &nbsp;
              {props.comp.name}({props.comp.key}) 加载失败！
            </div>
          )}
          <i class="render-component__bottom-border"></i>
        </div>
      )
    }
  }
})
