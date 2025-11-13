import request from './request'

/** 获取后台任务列表 */
export const getBackgroundTasks = (options: { current: number; size: number }) => {
  return request({
    url: `/null-cornerstone-system/backgroundTask`,
    method: 'GET',
    params: {
      descs: 'id',
      ...options
    }
  })
}
