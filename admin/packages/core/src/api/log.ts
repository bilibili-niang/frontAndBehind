import request, { type RequestPagination } from './request'

/** 获取操作日志列表 */
export const $getOperateLogList = (
  params: RequestPagination<{
    scene?: string
    status?: number
  }>
) => {
  return request({
    url: '/null-cornerstone-system/operateLog',
    method: 'get',
    params
  })
}

/** 获取操作日志过滤选项 */
export const $getOperateLogFilterOptions = () => {
  return request<OperateLogFilterItem[]>({
    url: '/null-cornerstone-system/operateLog/getConditionList',
    method: 'get'
  })
}

export type OperateLogFilterItem = {
  key: string
  label: string
  value: any
  children?: OperateLogFilterItem[]
}
