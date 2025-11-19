import request from '../request'

/** 获取系统页面版本 */
const getSystemPagesVersion = () => {
  return request({
    url: '/anteng-microstore-decorate-wap/m/decorate/system/all',
    withMerchantId: true,
    params: {
      origin: 1
    }
  })
}

export default getSystemPagesVersion
