import request from '../request'

// 获取用户海报列表
export const getPosterList = params => {
  return request({
    url: '/anteng-microstore-shop-wap/m/user-poster',
    method: 'get',
    params,
    withMerchantId: true
  })
}
// 新建
export const createPoster = data => {
  return request({
    url: '/anteng-microstore-shop-wap/m/user-poster',
    method: 'post',
    withMerchantId: true,
    data
  })
}
// 删除
export const deletePoster = id => {
  return request({
    url: `/anteng-microstore-shop-wap/m/user-poster/${id}`,
    method: 'delete'
  })
}
// 更新
export const updatePoster = (id, data) => {
  return request({
    url: `/anteng-microstore-shop-wap/m/user-poster/${id}`,
    data,
    method: 'PUT'
  })
}
