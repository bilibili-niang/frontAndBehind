export interface ICouponAuditRecord {
  /**
   * 核销店员名称
   */
  assistantName: string
  /**
   * 核销店员手机号
   */
  assistantPhone: string
  /**
   * 核销店员id
   */
  assistantUserId: string
  /**
   * 卡券编码
   */
  cardNo: string
  /**
   * 核销时间
   */
  createTime: string
  /**
   * 商品id
   */
  goodsId: string
  /**
   * 商品图片
   */
  goodsImages: string[]
  /**
   * 商品名称
   */
  goodsName: string
  /**
   * 商品skuid
   */
  goodsStockId: string
  /**
   * 商品sku名称
   */
  goodsStockName: string
  /**
   * 核销记录id
   */
  id: string
  /**
   * 子订单号
   */
  orderNo: string
  /**
   * 核销流水号
   */
  recordNo: string
  /**
   * 门店id
   */
  storeId: string
  /**
   * 门店名称
   */
  storeName: string
  [property: string]: any
}
