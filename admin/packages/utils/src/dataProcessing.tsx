// 数据处理逻辑

import { message, Modal } from '@pkg/ui'
import { useRequestErrorMessage } from '@pkg/core'

/**
 * 通用修改状态,不止是修改状态,还可以修改其他字段
 * @param recordId 将要修改的数据的id
 * @param v 对象或者是布尔值 如果为对象则是修改整个对象,否则只修改状态
 * @param requestFunction 请求函数
 * @param refresh 一般是刷新 请求结束后的function
 */
export const commonUpdate = (recordId: string, v: boolean | object, requestFunction: Function, refresh?: Function) => {
  requestFunction(
    recordId,
    typeof v === 'object'
      ? v
      : {
        status: v ? 1 : 0
      }
  )
    .then((res: any) => {
      if (res.success) {
        message.success(res.msg || '操作成功')
      } else {
        message.info(res.msg)
      }
    })
    .catch(useRequestErrorMessage)
    .finally(() => {
      refresh && refresh()
    })
}

/**
 * 通用删除
 * @param record 删除的数据 包含name和id,tip(默认是删除) customContent 可以用来渲染你想展示的页面内容
 * @param deleteRequest 删除请求函数
 * @param refresh 刷新
 */
export const commonDelete = (
  record: {
    name: string
    id: string
    tip?: string
    customContent?: Function
  },
  deleteRequest: Function,
  refresh: Function
) => {
  const tip = record.tip || '删除'
  Modal.confirm({
    title: `是否确认${tip}`,
    maskClosable: true,
    content: record.customContent?.(record) ? (
      record.customContent(record)
    ) : (
      <>
        确定要{tip} <span class="color-warn">{record.name}</span> 吗？
      </>
    ),
    onOk: () => {
      deleteRequest(record.id)
        .then((res: any) => {
          if (res.success) {
            message.success(res.msg || '操作成功')
          } else {
            useRequestErrorMessage(res)
          }
        })
        .catch(useRequestErrorMessage)
        .finally(() => {
          refresh()
        })
    }
  })
}
