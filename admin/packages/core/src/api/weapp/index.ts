import useAppStore from '../../stores/app'
import request, { type ResponseBody } from '../request'
import type { IWechatAccountRecord } from './types'

// 回调微信小程序授权码，完成授权
export const postWeappAuthCallback = (authCode: string) => {
  return request({
    url: '//open/authCallback',
    method: 'post',
    data: {
      authCode: authCode
    }
  })
}

/**
 * 获取微信公众号授权链接
 * @param accountId - 复用的公众号ID
 */
export const getWechatOfficialAccountAuthURL = (accountId: string) => {
  return request({
    url: '//open/fastRegisterAuthUrl',
    method: 'get',
    params: {
      account_id: accountId
    }
  })
}

/**
 * 回调微信公众号授权码，完成授权
 * @param options.accountId - 复用的公众号ID
 * @param options.ticket - 公众号扫码授权的凭证
 */
export const postWechatOfficialAccountAuthCallback = (options: { accountId: string; ticket: string }) => {
  return request({
    url: '//open/fastRegisterAuthCallback',
    method: 'post',
    params: {
      account_id: options.accountId
    },
    data: {
      scene: useAppStore().scene,
      ticket: options.ticket
    }
  })
}

/** 获取微信账号列表 */
export const getWechatAccountList = (): ResponseBody<IWechatAccountRecord> => {
  return request({
    url: '//account',
    method: 'get',
    params: {
      scene: useAppStore().scene,
      status: 1
    }
  })
}

/** 获取微信账户详情 */
export const getWechatAccountDetail = (id: string) => {
  return request<IWechatAccountRecord>({
    url: '//account',
    method: 'get',
    params: {
      scene: useAppStore().scene,
      id
    }
  })
}

/** 获取小程序基础信息 */
export const getWeappBasicInfo = (accountId: string) => {
  return request({
    url: `//miniapp/${accountId}/info/basic`,
    method: 'get'
  })
}

/** 获取小程序版本信息 */
export const getWeappVersionInfo = (accountId: string) => {
  return request({
    url: `//miniapp/${accountId}/info/version`,
    method: 'get'
  })
}

interface ICreateEnterpriseWeappOptions {
  /**
   * 企业代码
   */
  code: string
  /**
   * 企业代码类型
   */
  codeType: string
  /**
   * 第三方联系电话
   */
  componentPhone?: string
  /**
   * 法人姓名（绑定银行卡）
   */
  legalPersonaName: string
  /**
   * 企业法人微信号
   */
  legalPersonaWechat: string
  /**
   * 企业名称
   */
  name: string
  /**
   * 小程序场景
   */
  scene: string
}
export const createEnterpriseWeapp = (options: ICreateEnterpriseWeappOptions): ResponseBody<any> => {
  return request({
    url: '//open/fastRegisterMiniprogram',
    method: 'post',
    data: options
  })
}

/**
 * 生产小程序体验版并上传代码
 * @param accountId - 微信账号id
 */
export const upgradeTrailWeapp = (accountId: string) => {
  return request({
    url: `//miniapp/${accountId}/commit`,
    method: 'post'
  })
}

/** 提交小程序审核 */
export const auditWeapp = (accountId: string) => {
  return request({
    url: `//${accountId}/version/submit/audit`,
    method: 'post'
  })
}

/** 发布已审核通过小程序 */
export const releaseWeapp = (accountId: string) => {
  return request({
    url: `//${accountId}/version/release`,
    method: 'post'
  })
}

/**
 * 获取体验版小程序码
 * @param version - 版本号
 * @returns
 */
export const getTrialWeappQRCode = (version: string) => {
  return request({
    url: `//miniapp/${version}/trialQRCode`,
    method: 'get'
  })
}

/**
 * 获取公众号二维码凭证
 */
export const getWechatQRCodeTicket = () => {
  return request({
    url: '//open/fastRegisterQRCodeTicket',
    method: 'get'
  })
}

export const checkWechatQRCodeTicketStatus = (ticket: string) => {
  return request({
    url: `//open/fastRegisterQRCodeResult/${ticket}`,
    method: 'get'
  })
}

interface ICreateTrialWeappOptions {
  name: string
  scene?: string
  ticket: string
}
export const createTrialWeapp = (options: ICreateTrialWeappOptions) => {
  return request({
    url: '//open/fastRegisterBetaMiniprogram',
    method: 'post',
    data: {
      scene: useAppStore().scene,
      ...options
    }
  })
}

/** 更新用户隐私保护协议 */
export const updatePrivacy = (accountId: string) => {
  return request({
    url: `//${accountId}/version/update/privacy`,
    method: 'POST'
  })
}

/** 获取业务域名下载链接 */
export const getWebviewAuthFile = (accountId: string): ResponseBody<any> => {
  return request({
    url: `//miniapp/${accountId}/webViewDomain/confirmFile`,
    method: 'GET'
  })
}

/** 配置业务域名 */
export const updateWebviewUrls = (accountId: string, domains: string[]): ResponseBody<any> => {
  return request({
    url: `//miniapp/${accountId}/webViewDomain`,
    method: 'POST',
    data: {
      domains
    }
  })
}
