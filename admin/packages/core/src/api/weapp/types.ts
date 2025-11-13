export interface IWechatAccountRecord {
  /**
   * 微信账号 app_id
   */
  appId?: string
  /**
   * 账号id
   */
  id?: number
  /**
   * 合作商 id
   */
  merchantId?: string
  /**
   * 合作商名称
   */
  merchantName?: string
  /**
   * 名称
   */
  name?: string
  /**
   * 账号使用场景
   */
  scene?: string
  /**
   * 来源
   */
  sourceType?: number
  /**
   * 来源说明
   */
  sourceTypeText?: string
  /**
   * 状态
   */
  status?: number
  /**
   * 状态说明
   */
  statusText?: string
  /**
   * 类型
   */
  type?: number
  /**
   * 类型说明
   */
  typeText?: string
  [property: string]: any
}
