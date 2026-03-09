import request from '../request'

export default (goodsIds: string[]) => {
  return request({
    url: '/ice-microstore-decorate-wap/m/decorate/component/goods',
    method: 'post',
    data: [...goodsIds]
  })
}
