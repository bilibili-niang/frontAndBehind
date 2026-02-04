import { Button, Modal, message } from '@pkg/ui'
import { type Ref, defineComponent, ref, reactive, isRef, computed, toRaw } from 'vue'
import { cloneDeep } from 'lodash'
import uuid from '../../utils/uuid'
import './style.scss'

import { type Schema, SchemaForm, validateForm } from '@pkg/jsf'
import Errors from './errors'
import useContextMenu from '../useContextMenu'
import useRequestErrorMessage from '../useRequestErrorMessage'
import useModal from '../useModal'

type UseSchemaFormModalConfig = {
  title?: string | any
  schema: Schema | Ref<Schema>
  data: any
  okText?: string
  cancelText?: string
  onOk?: (data: any) => void | Promise<any>
  onCancel?: () => void
  onChange?: (data: any) => void
  /** 是否深拷贝数据，默认 true 将不会影响源数据 */
  dataReplicated?: boolean
  labelWidth?: number
  width?: number | string
  readonly?: boolean
  // 是否开启全屏样式,开启会覆盖类名和width
  fullScreen?: boolean
  theme?: 'standard' | 'compact'
}

export const useSchemaForm = (config: UseSchemaFormModalConfig) => {
  const Content = defineComponent({
    emits: ['close'],
    setup(props, { emit }) {
      const loading = ref(false)
      const close = () => emit('close')
      const onChange = (v: any) => {
        config.onChange?.(data)
      }
      const data = config.dataReplicated === false ? config.data : reactive(cloneDeep(config.data))

      const formKey = ref(uuid())

      const errorSchema = ref({
        valid: true,
        errorMap: {}
      })

      const schemaRef = computed(() => {
        return isRef(config.schema) ? config.schema.value : config.schema
      })
      const onConfirm = (force?: boolean) => {
        const validateResult = validateForm(schemaRef.value, data)

        errorSchema.value = validateResult

        if (process.env.NODE_ENV === 'development') {
          console.log(validateResult)
          console.log(toRaw(data))
        }

        if (!force && !validateResult.valid) {
          message.error(`当前表单存在 ${Object.keys(validateResult.errorMap).length} 处错误，请检查后再次尝试`)
          return void 0
        }

        try {
          const res = config.onOk?.(data)
          if (res instanceof Promise) {
            loading.value = true
            res
              .then(() => {
                loading.value = false
                close()
              })
              .catch((err) => {
                loading.value = false
                // 处理表单填写错误
                console.log(err)
                // useRequestErrorMessage(err)
              })
          } else {
            close()
          }
        } catch (err) {
          console.log(err)
          useRequestErrorMessage(err)
        }
      }

      const onBeforeCancel = () => {
        onCancel()
        return void 0
        const confirm = Modal.confirm({
          title: '保存草稿？',
          content: '下次编辑时可以从草稿中恢复当前数据。',
          okText: '保存草稿',
          footer: (
            <div class="jsf_draft-confirm-footer">
              <Button
                onClick={() => {
                  confirm.destroy()
                  onCancel()
                }}
              >
                丢弃
              </Button>
              <Button
                onClick={() => {
                  confirm.destroy()
                }}
              >
                继续编辑
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  confirm.destroy()
                  onCancel()
                  message.info('暂不支持')
                }}
              >
                保存草稿
              </Button>
            </div>
          )
        })
      }

      const onCancel = () => {
        config.onCancel?.()
        close()
      }

      const onConfirmContextmenu = (e: MouseEvent) => {
        e.preventDefault()
        useContextMenu(e, {
          list: [
            {
              key: '1',
              title: '强制保存',
              handler: () => {
                onConfirm(true)
              }
            }
          ]
        })
      }

      return () => {
        return (
          <div class={['jsf-modal jsf-ui', loading.value && 'loading cursor-disabled']}>
            <div class="jsf-modal-header">
              {config.title ?? schemaRef.value.title}
              <div class="jsf-modal-actions">
                {/* <Select placeholder="搜索关键词" showSearch /> */}
                {/* <Drafts>
                  <Button class="jsf-modal__draft clickable flex-center">
                    草稿
                    <Icon name="right-one" />
                  </Button>
                </Drafts> */}
                <Errors errorSchema={errorSchema.value}></Errors>
                {/* <small style="opacity:0.4;">丨</small> */}
                {config.readonly ? (
                  <Button type="primary" onClick={close}>
                    确定
                  </Button>
                ) : (
                  <>
                    <Button onClick={onBeforeCancel}>{config.cancelText || '取消'}</Button>
                    <Button
                      type="primary"
                      onClick={() => onConfirm(false)}
                      // @ts-ignore
                      onContextmenu={onConfirmContextmenu}
                      loading={loading.value}
                    >
                      {config.okText || '保存'}
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div
            class="jsf-modal-content ui-scrollbar"
              style={{
                width: typeof config.width === 'number' ? `${config.width}px` : config.width,
                '--jsf-width': typeof config.width === 'number' ? `${config.width}px` : config.width,
                '--jsf-ui-field-label-width': `${config.labelWidth ?? 80}px`
              }}
            >
              <SchemaForm
                theme={config.theme ?? 'standard'}
                key={formKey.value}
                schema={schemaRef.value}
                value={data}
                onChange={onChange}
                errorSchema={errorSchema.value}
                readonly={config.readonly ? true : false}
              />
            </div>
            {/* <div class="jsf-modal-footer">
              <Button onClick={onCancel}>取消</Button>
              <Button type="primary" onClick={onConfirm} loading={loading.value}>
                确定
              </Button>
            </div> */}
          </div>
        )
      }
    }
  })
  return Content
}

const useSchemaFormModal = (config: UseSchemaFormModalConfig) => {
  const Content = useSchemaForm(config)

  const modal = useModal({
    title: null,
    wrapClassName: config.fullScreen ? 'jsf-modal-fullscreen-wrapper' : 'jsf-modal-wrapper',
    content: <Content onClose={() => modal.destroy()} />,
    // centered: true,
    closable: false,
    maskClosable: false,
    onCancel: () => {
      config.onCancel?.()
    }
  })

  Content.close = () => {
    modal.destroy()
  }
  return { Content }
}

export default useSchemaFormModal
