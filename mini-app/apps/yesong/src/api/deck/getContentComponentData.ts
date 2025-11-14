import request, { REQUEST_DOMAIN } from '../request'

export interface IContentComponentOptions {
  type: string
  [key: string]: any
}

const getContentComponentData = (payload: IContentComponentOptions | IContentComponentOptions[]) => {
  return new Promise((resolve, reject) => {
    request({
      baseURL: REQUEST_DOMAIN,
      url: '/anteng-microstore-decorate-wap/m/decorate/component/data',
      method: 'POST',
      data: Array.isArray(payload)
        ? payload.map((item) => {
            return { ...item, location: '118.038413,24.621946' }
          })
        : [{ ...payload, location: '118.038413,24.621946' }]
    })
      .then((res) => {
        resolve(Array.isArray(payload) ? res.data : res.data[0])
      })
      .catch(reject)
  })
}

export default getContentComponentData
