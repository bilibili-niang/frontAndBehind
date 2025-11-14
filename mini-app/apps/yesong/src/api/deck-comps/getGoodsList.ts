import request from '../request'

export default (goodsIds: string[]) => {
  return request({
    url: '/anteng-microstore-decorate-wap/m/decorate/component/goods',
    method: 'post',
    data: [...goodsIds]
  })
}
