import { ResponseData } from '@anteng/core'
import request from '../request'
import { ORIGIN_STORE } from '@anteng/config'

const RequestQueue: Record<string, Promise<ResponseData<any>>> = {}

/** 获取系统页面 */
const requestGetSystemPage = (key: string) => {
  if (RequestQueue[key] !== undefined) {
    return RequestQueue[key]
  }

  const task = request({
    url: '/anteng-microstore-decorate-wap/m/decorate/system',
    withMerchantId: true,
    params: {
      origin: ORIGIN_STORE,
      key
    }
  })

  RequestQueue[key] = task

  task.finally(() => {
    delete RequestQueue[key]
  })

  return task
}

export default requestGetSystemPage
