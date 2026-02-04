import { defineComponent, ref } from 'vue'
import './style.scss'
import useCanvasStore from '../../../../stores/canvas'
import { storeToRefs } from 'pinia'
import { Button, DatePicker, Input, Switch, Textarea, message } from '@pkg/ui'
import useEditorStore from '../../../../stores/editor'
import useSnapshotStore from '../../../../stores/snapshot'
import { router, useRequestErrorMessage } from '@pkg/core'

export default defineComponent({
  name: 'LegoDeployModal',
  emits: ['close'],
  setup(props, { emit }) {
    const loading = ref(false)
    const canvasStore = useCanvasStore()
    const editorStore = useEditorStore()
    const { page } = storeToRefs(canvasStore)
    const { pageId } = storeToRefs(editorStore)

    const handleDeploy = () => {
      if (!(page.value.basic.name.length > 0)) {
        return message.error('请填写页面名称')
      }
      useSnapshotStore()
        .deploy()
        .then(() => {
          loading.value = false
          emit('close')
          router.back()
        })
        .catch((err) => {
          loading.value = false
          console.log('发布失败', err)
          useRequestErrorMessage(err)
        })
    }

    return () => {
      return (
        <div class="deploy-modal jsf-ui">
          <div class="deploy-modal__item">
            <div class="deploy-modal__label">页面ID</div>
            <div class="deploy-modal__value">
              <Input disabled value={pageId.value ?? ''} placeholder={'发布后自动创建页面ID'} />
            </div>
            <div class="deploy-modal__label">页面名称</div>
            <div class="deploy-modal__value">
              <Input
                placeholder="必填，请输入"
                value={page.value.basic.name}
                onChange={(e) => {
                  page.value.basic.name = e.target.value as string
                }}
              />
            </div>
            <div class="deploy-modal__label">备注信息</div>
            <div class="deploy-modal__value">
              <Textarea
                placeholder="选填"
                value={page.value.basic.remark}
                auto-size={{ minRows: 2, maxRows: 5 }}
                onChange={(e: any) => {
                  page.value.basic.remark = e.target.value as string
                }}
              />
            </div>
            <div class="deploy-modal__label">
              立即发布&emsp;
              <Switch checked />
            </div>
            <div class="deploy-modal__label">
              设为首页&emsp;
              <Switch disabled />
            </div>
          </div>
          <div class="deploy-modal__footer">
            <Button disabled={loading.value} onClick={() => emit('close')}>
              取消
            </Button>
            <Button type="primary" onClick={handleDeploy} loading={loading.value}>
              确定发布
            </Button>
          </div>
        </div>
      )
    }
  }
})

export const SystemPageDeployModal = defineComponent({
  name: 'LegoDeployModal',
  emits: ['close'],
  setup(props, { emit }) {
    const loading = ref(false)
    const canvasStore = useCanvasStore()
    const editorStore = useEditorStore()
    const { scope, pageDefine } = storeToRefs(canvasStore)

    const handleDeploy = () => {
      useSnapshotStore()
        .deploy()
        .then(() => {
          loading.value = false
          emit('close')
          // router.back()
        })
        .catch((err) => {
          loading.value = false
        })
    }

    return () => {
      return (
        <div class="deploy-modal jsf-ui">
          <div class="deploy-modal__item">
            <div class="deploy-modal__label">页面ID</div>
            <div class="deploy-modal__value">
              <Input disabled value={scope.value} />
            </div>
            <div class="deploy-modal__label">页面名称</div>
            <div class="deploy-modal__value">
              <Input placeholder="必填，请输入" value={pageDefine.value?.name} disabled />
            </div>
            <div class="deploy-modal__label">备注信息</div>
            <div class="deploy-modal__value">
              <Textarea placeholder="选填" auto-size={{ minRows: 2, maxRows: 5 }} />
            </div>
            <div class="deploy-modal__label">
              立即发布&emsp;
              <Switch checked />
            </div>
          </div>
          <div class="deploy-modal__footer">
            <Button disabled={loading.value} onClick={() => emit('close')}>
              取消
            </Button>
            <Button type="primary" onClick={handleDeploy} loading={loading.value}>
              确定发布
            </Button>
          </div>
        </div>
      )
    }
  }
})
