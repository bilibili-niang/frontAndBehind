import request from '../request'
// 获取资讯列表
export const getInformationList = (params: any) => {
  return request({
    url: '/anteng-microstore-shop-wap/m/community/info',
    method: 'get',
    withMerchantId: true,
    params
  })
}

// 获取资讯详情
export const getInformationDetail = (id: string) => {
  return request({
    url: `/anteng-microstore-shop-wap/m/community/info/${id}`,
    method: 'get',
    withMerchantId: true
  })
}

// 资讯组件的接口
export const getInformationComponent = (id: string) => {
  return request({
    url: `/anteng-microstore-shop-wap/m/community/info/${id}/component`,
    method: 'get',
    withMerchantId: true
  })
}
