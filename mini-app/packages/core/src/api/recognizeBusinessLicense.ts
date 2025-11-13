import request from './request'

export interface IBusinessLicense {
  /**
   * 营业场所/住所
   */
  businessAddress: string
  /**
   * 经营范围
   */
  businessScope: string
  /**
   * 组成形式
   */
  companyForm: string
  /**
   * 营业名称
   */
  companyName: string
  /**
   * 类型
   */
  companyType: string
  /**
   * 统一社会信用代码
   */
  creditCode: string
  /**
   * 法人/负责人
   */
  legalPerson: string
  /**
   * 注册资本
   */
  registeredCapital: string
  /**
   * 注册日期
   */
  registrationDate: string
  /**
   * 格式化营业期限起始日期
   */
  validFromDate: string
  /**
   * 营业期限
   */
  validPeriod: string
  /**
   * 格式化营业期限终止日期
   */
  validToDate: string
}

/** 识别营业执照信息 */
export default (url: string) => {
  return request({
    url: '/null-cornerstone-system/image/recognizeBusinessLicense',
    params: {
      url
    },
    method: 'GET'
  })
}
