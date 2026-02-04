import { defineComponent, ref, type InputHTMLAttributes, toRaw, computed } from 'vue'
import './style.scss'
import './style.dark.scss'
import { router, useContextMenu } from '@pkg/core'
import { storeToRefs } from 'pinia'
import { Icon, Modal, message } from '@pkg/ui'
import useEditorStore from '../../../stores/editor'
import useCanvasStore from '../../../stores/canvas'
import Snapshot from './snapshot'
import useSnapshotStore from '../../../stores/snapshot'
import Deploy, { SystemPageDeployModal } from './deploy'
import { SCOPE_CUSTOM } from '../../../constants'
import { registeredComponents } from '../../../canvas-components'

export default defineComponent({
  name: 'DeckEditorHeader',
  setup() {
    const editorStore = useEditorStore()
    const { scaleOptions, scale, scaleType } = storeToRefs(editorStore)

    const canvasStore = useCanvasStore()
    const { currentSelectedComponent, components, page } = storeToRefs(canvasStore)

    const openDeviceMenu = () => {
      message.info('暂不支持切换设备')
    }

    const scaleButtonRef = ref<HTMLElement>()
    const openScaleMenu = () => {
      const rect = scaleButtonRef.value!.getBoundingClientRect()
      const event = new MouseEvent('click', {
        screenX: rect.left,
        screenY: rect.bottom + 4,
        clientX: rect.left,
        clientY: rect.bottom + 4
      })
      useContextMenu(event, {
        list: [...scaleOptions.value]
      })
    }

    const editedName = ref('')
    const isNameEditting = ref(false)
    const onEditName = (e: Event) => {
      editedName.value = currentSelectedComponent.value!.name
      isNameEditting.value = true
      e.preventDefault()
      e.stopPropagation()
      ;(e.target as any).select()
    }
    const onEditNameChange = (e: any) => {
      editedName.value = e.target.value
    }
    const onEditNameEnd = () => {
      const v = editedName.value.trim()
      if (v !== '') {
        canvasStore.updateComponent(currentSelectedComponent.value!.id, { name: v })
      } else {
        editedName.value = currentSelectedComponent.value!.name
      }
      isNameEditting.value = false
    }

    /** 显示排序菜单 */
    const useOrderMenu = (e: MouseEvent) => {
      const rect = (e.target as HTMLElement)!.getBoundingClientRect()
      const event = new MouseEvent('click', {
        screenX: rect.left - 6,
        screenY: rect.bottom + 12,
        clientX: rect.left - 6,
        clientY: rect.bottom + 12
      })
      const id = currentSelectedComponent.value!.id
      useContextMenu(event, {
        list: [
          {
            key: 'up',
            icon: 'up',
            title: '上移',
            handler: () => canvasStore.moveComponentUp(id)
          },
          {
            key: 'down',
            icon: 'down',
            title: '下移',
            handler: () => canvasStore.moveComponentDown(id)
          },
          {
            key: 'top',
            icon: 'to-top-one',
            title: '置顶',
            handler: () => canvasStore.moveComponentTop(id)
          },
          {
            key: 'bottom',
            icon: 'to-bottom-one',
            title: '置底',
            handler: () => canvasStore.moveComponentBottom(id)
          }
        ]
      })
    }

    const onCopyComponent = () => {
      canvasStore.copyComponent(currentSelectedComponent.value!.id)
    }

    const onRemoveComponent = () => {
      Modal.confirm({
        title: '删除组件',
        content: '组件删除后将无法恢复，您确定要删除吗？',
        okText: '确定删除',
        onOk() {
          canvasStore.removeComponent(currentSelectedComponent.value!.id)
        }
      })
    }

    const handleDeploy = () => {
      if (canvasStore.scope === SCOPE_CUSTOM) {
        const modal = Modal.open({
          title: (
            <div style="display:flex;align-items:center;">
              <iconpark-icon name="telegram"></iconpark-icon>&ensp;发布页面
            </div>
          ),
          content: <Deploy onClose={() => modal.destroy()} />
        })
      } else {
        const modal = Modal.open({
          title: (
            <div style="display:flex;align-items:center;">
              <iconpark-icon name="telegram"></iconpark-icon>&ensp;发布系统页面
            </div>
          ),
          content: <SystemPageDeployModal onClose={() => modal.destroy()} />
        })
      }
      // useSnapshotStore().deploy()
    }

    const ComponentActions = () => {
      const name = isNameEditting.value ? editedName.value : currentSelectedComponent.value!.name
      return (
        <div class="deck-editor-header__actions">
          <div class="deck-editor-header__comp-name">
            <div class="deck-editor-header__comp-name-text">
              <span>{name}</span>
              <input
                value={name}
                onFocus={onEditName}
                onBlur={onEditNameEnd}
                onInput={onEditNameChange}
              />
              <Icon name="edit" />
            </div>
          </div>
          <div class="deck-editor-header__action clickable" onClick={useOrderMenu}>
            <iconpark-icon name="toggler"></iconpark-icon>
            <iconpark-icon class="sink" name="right-one"></iconpark-icon>
          </div>
          <div class="deck-editor-header__action clickable" onClick={onCopyComponent}>
            <iconpark-icon name="copy"></iconpark-icon>
          </div>
          <div class="deck-editor-header__action clickable" onClick={onRemoveComponent}>
            <iconpark-icon name="delete-one"></iconpark-icon>
          </div>
        </div>
      )
    }

    const scopeTitle = computed(() => {
      return registeredComponents.value[canvasStore.scope]?.name || '页面'
    })

    return () => {
      const Name =
        canvasStore.scope === SCOPE_CUSTOM ? (
          page.value?.basic?.name.length > 0 ? (
            <strong class="deck-editor-header__name">{page.value.basic.name}</strong>
          ) : (
            <strong
              class="deck-editor-header__name clickable"
              onClick={() => {
                message.info('请在右侧页面设置里填写「页面名称」')
                canvasStore.selectComponent('')
              }}
              style="opacity:0.4"
            >
              未命名页面
            </strong>
          )
        ) : (
          <>
            <strong class="deck-editor-header__name">{scopeTitle.value}</strong>
            <strong class="deck-editor-header__scope">系统页面</strong>
          </>
        )

      return (
        <div class="deck-editor-header">
          <div class="deck-editor-header__left">
            <div class="deck-editor-header__back clickable" onClick={router.back}>
              <iconpark-icon name="left"></iconpark-icon>
              <strong>返回控制台</strong>
            </div>
            {Name}
          </div>
          <div class="deck-editor-header__center">
            {currentSelectedComponent?.value ? (
              <ComponentActions />
            ) : (
              <>
                <div class="deck-editor-header__button" onClick={openDeviceMenu}>
                  <iconpark-icon name="iphone"></iconpark-icon>
                  <strong>设备: iPhone6/7/8</strong>
                </div>
                <div
                  class="deck-editor-header__button"
                  ref={scaleButtonRef}
                  onClick={openScaleMenu}
                >
                  <strong>{`${scaleType.value === 'reactive' ? '自适应' : '缩放'}: ${Math.round(
                    scale.value * 100
                  )}%`}</strong>
                  <iconpark-icon class="sink" name="right-one"></iconpark-icon>
                </div>
              </>
            )}
          </div>
          <div class="deck-editor-header__right">
            <Snapshot>
              <div class="deck-editor-header__button __preview">
                <iconpark-icon name="camera-8ibipgm5"></iconpark-icon>
                <strong>快照</strong>
              </div>
            </Snapshot>
            <div
              class="deck-editor-header__button __preview"
              onClick={() => useSnapshotStore().preview()}
            >
              <iconpark-icon name="play-one"></iconpark-icon>
              <strong>预览</strong>
            </div>
            <div class="deck-editor-header__button __publish" onClick={handleDeploy}>
              <iconpark-icon name="telegram"></iconpark-icon>
              <strong>发布</strong>
            </div>
          </div>
        </div>
      )
    }
  }
})
