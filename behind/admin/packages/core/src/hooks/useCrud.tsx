import { ref, type Ref } from 'vue'
import useSchemaFormModal from './useSchemaFormModal'
import type { SchemaFormModalOptions } from './useSchemaFormModal'
import useRequestErrorMessage from './useRequestErrorMessage'
import { notifySuccess, notifyError, Modal, createModal } from '@pkg/ui'
import { COMMON_STATUS_OFF, COMMON_STATUS_ON } from '../constants'
import type { UseCrudOptions, CommonStatus } from '../types'

const useCrud = <T = any>(options: UseCrudOptions<T>) => {
  const schema = typeof options.schema === 'function' ? options.schema : (type: 'create' | 'update') => options.schema

  const dataRef = ref<T | null>(null)
  const typeRef = ref<'' | 'create' | 'update'>('')

  const onCreate = (
    handler?: (value: T) => void | Promise<any>,
    onCreateSuccess?: (value: T) => void,
    defaultValue?: T
  ) => {
    typeRef.value = 'create'
    dataRef.value = (defaultValue ?? options.defaultValue?.() ?? null) as T | null

    const modalOptions: SchemaFormModalOptions = {
      title: options.createTitle ?? `新建${options.title}`,
      schema: schema('create'),
      data: dataRef.value,
      width: options?.fullScreen ? '100%' : (options.width ?? 620),
      fullScreen: options?.fullScreen,
      onChange: (data: T) => {
        dataRef.value = data as T
        options.onChange?.(data)
      },
      onOk: async (data: T) => {
        const formatedData = options.format?.(data as T) ?? data
        try {
          const res: any = await (handler ?? options.onCreate)?.(formatedData as T)
          if (!res) return Promise.resolve(undefined)
          if (res.code === 200) {
            notifySuccess(res.msg || '创建成功')
            ;(onCreateSuccess ?? options.onCreateSuccess)?.(res.data)
            return Promise.resolve(res)
          } else {
            useRequestErrorMessage(res)
            return Promise.reject(res)
          }
        } catch (err) {
          useRequestErrorMessage(err)
          return Promise.reject(err)
        }
      },
      onCancel: () => {
        typeRef.value = ''
      }
    }

    useSchemaFormModal(modalOptions)
  }

  const onUpdate = (
    value: T,
    handler?: (value: T) => void | Promise<any>,
    onUpdateSuccess?: (value: T) => void,
    prefixText?: string | null
  ) => {
    typeRef.value = 'update'
    dataRef.value = (options.retrieve ? options.retrieve(value) : value) ?? (options.defaultValue?.() as T) ?? null

    const modalOptions: SchemaFormModalOptions = {
      title: options.updateTitle ?? `${prefixText === null ? '' : prefixText || '编辑'}${options.title}`,
      schema: schema('update'),
      data: dataRef.value,
      width: options?.fullScreen ? '100%' : (options.width ?? 620),
      fullScreen: options?.fullScreen,
      onChange: (data: T) => {
        dataRef.value = data as T
        options.onChange?.(data)
      },
      onOk: async (data: T) => {
        const formatedData = options.format?.(data as T) ?? data
        try {
          const res: any = await (handler ?? options.onUpdate)?.(formatedData as T)
          if (!res) return Promise.resolve(undefined)
          if (res.code === 200) {
            notifySuccess(res.msg || '编辑成功')
            ;(onUpdateSuccess ?? options.onUpdateSuccess)?.(res.data)
            return Promise.resolve(res)
          } else {
            useRequestErrorMessage(res)
            return Promise.reject(res)
          }
        } catch (err) {
          useRequestErrorMessage(err)
          return Promise.reject(err)
        }
      },
      onCancel: () => {
        typeRef.value = ''
      }
    }

    useSchemaFormModal(modalOptions)
  }

  const onToggleStatus = async (
    status: CommonStatus,
    handler?: (status: CommonStatus) => void | Promise<any>,
    onToggleSuccess?: (status: CommonStatus) => void
  ) => {
    try {
      const value = status === COMMON_STATUS_ON ? COMMON_STATUS_OFF : COMMON_STATUS_ON
      const res: any = await (handler ?? options.onToggleStatus)?.(value as CommonStatus)
      if (!res) return Promise.resolve(undefined)
      if (res.code === 200) {
        notifySuccess(res.msg || '切换成功')
        ;(onToggleSuccess ?? options.onToggleSuccess)?.(value as CommonStatus)
        return Promise.resolve(res)
      } else {
        useRequestErrorMessage(res)
        return Promise.reject(res)
      }
    } catch (err) {
      useRequestErrorMessage(err)
      return Promise.reject(err)
    }
  }

  const onRemove = (handler?: () => void | Promise<any>, onRemoveSuccess?: (value: any) => void) => {
    Modal.confirm({
      title: options.removeTitle ?? `删除${options.title}`,
      content: '该操作无法撤销，确定要删除吗？',
      onOk: async () => {
        try {
          const res: any = await (handler ?? options.onRemove)?.()
          if (!res) return Promise.resolve(undefined)
          if (res.code === 200) {
            notifySuccess(res.msg || '删除成功')
            ;(onRemoveSuccess ?? options.onRemoveSuccess)?.(res.data)
            return Promise.resolve(res)
          } else {
            useRequestErrorMessage(res)
            return Promise.resolve(res)
          }
        } catch (err) {
          useRequestErrorMessage(err)
          return Promise.resolve(err)
        }
      }
    })
  }

  const onRead = (value: T) => {
    dataRef.value = value as T
    useSchemaFormModal({
      title: `查看${options.title}`,
      schema: schema('update'),
      data: dataRef.value,
      width: options.width ?? 620,
      readonly: true
    })
  }

  return {
    dataRef,
    typeRef,
    onCreate,
    onUpdate,
    onToggleStatus,
    onRemove,
    onRead
  }
}

export default useCrud
