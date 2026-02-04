import { h, reactive, ref } from 'vue'
import type { Schema } from '../types'
import useModal from './useModal'
import { Button, message } from '@pkg/ui'
import { SchemaForm, validateForm, type ErrorSchema } from '@pkg/jsf'

export interface SchemaFormModalOptions {
  title: string
  schema: Schema
  data?: any
  width?: number | string
  fullScreen?: boolean
  readonly?: boolean
  onChange?: (data: any) => void
  onOk?: (data: any) => Promise<any>
  onCancel?: () => void
}

export default function useSchemaFormModal(options: SchemaFormModalOptions) {
  const form = reactive<any>({ ...(options.data ?? {}) })
  const submitting = ref(false)
  const errorSchema = reactive<ErrorSchema>({ valid: true, errorMap: {} })

  const Content = () => {
    return h(SchemaForm as any, {
      schema: options.schema as any,
      value: form,
      readonly: !!options.readonly,
      errorSchema,
      onChange: (v: any) => {
        // SchemaForm 传回的是变更后的引用，这里保持与原始 form 同步
        Object.assign(form, v)
        options.onChange?.({ ...form })
      }
    })
  }

  const controller = useModal({
    title: options.title,
    width: options.fullScreen ? '100%' : (options.width ?? 620),
    persistent: true,
    content: () => Content?.(),
    actions: () => {
      const UiBtn = Button as any
      if (options.readonly) {
        return h('div', { class: 'w-full flex justify-end' }, [
          h(UiBtn, { onClick: () => controller.close() }, { default: () => '关闭' })
        ])
      }
      const onCancel = () => {
        if (submitting.value) return
        options.onCancel?.()
        controller.close()
      }
      const onOk = async () => {
        if (submitting.value) return
        // 提交前执行一次全量校验
        const result = validateForm(options.schema as any, form)
        errorSchema.valid = result.valid
        errorSchema.errorMap = result.errorMap
        if (!result.valid) {
          message.error('请完善必填项或修正表单错误')
          return
        }
        submitting.value = true
        try {
          const res = await options.onOk?.({ ...form })
          // 仅在成功时关闭（返回值结构由调用方决定 useCrud 已处理）
          if (res === undefined || (res && (res.code === 200 || res.success))) {
            controller.close()
          }
        } catch (_e) {
          // 失败时保持弹窗打开，交由外部错误提示
        } finally {
          submitting.value = false
        }
      }
      return h('div', { class: 'w-full flex justify-end gap-2' }, [
        h(UiBtn, { variant: 'text', disabled: submitting.value, onClick: onCancel }, { default: () => '取消' }),
        h(UiBtn, {
          color: 'primary',
          loading: submitting.value,
          disabled: submitting.value,
          onClick: onOk
        }, { default: () => '确定' })
      ])
    }
  })
  // controller.open 不存在；Modal.open 已立即显示，无需手动打开

  return {
    close: () => controller.close()
  }
}
