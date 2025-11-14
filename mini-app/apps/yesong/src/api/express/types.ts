/**
 * 物流信息
 */
export interface IExpressInfo {
  /** 快递公司代码 */
  expressCode: string
  /** 快递公司名称 */
  expressCompanyName: string
  /** 快递公司Logo */
  expressCompanyLogo: string
  /** 快递单号 */
  number: string
  /** 物流状态 */
  logisticsStatus: string
  /** 物流状态描述 */
  logisticsStatusDesc: string
  /** 最后一条消息 */
  theLastMessage: string
  /** 最后更新时间 */
  theLastTime: string
  /** 消耗时间 */
  takeTime: string
  /** 快递员姓名 */
  courier: string
  /** 快递员电话 */
  courierPhone: string
  /** 物流轨迹详情 */
  logisticsTraceDetails: LogisticsTraceDetail[]
}

/**
 * 物流轨迹详情
 */
interface LogisticsTraceDetail {
  /** 区域代码 */
  areaCode: string
  /** 区域名称 */
  areaName: string
  /** 子物流状态 */
  subLogisticsStatus: string
  /** 时间 */
  time: number
  /** 物流状态 */
  logisticsStatus: string
  /** 描述 */
  desc: string
}
