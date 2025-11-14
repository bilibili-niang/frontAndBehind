import { PaginationData, request, RequestPagination } from '@anteng/core'
import { SurveyDetail } from './types'

/** 获取问卷详情 */
export const $getSurveyDetail = (id: string) => {
  return request<SurveyDetail>({
    url: `/kuoka-enterprise-wap/questionnaire/${id}`,
    method: 'get',
    withMerchantId: true
  })
}

export interface SubmitSurveyOptions {
  /** 商户id */
  merchantId: string
  /** 问卷id */
  questionnaireId: string
  /** 开始时间：从第一题加载完成后开始计时 */
  startTime: string
  /** 完成时间：提交答案时间 */
  endTime: string
  /** 答案信息 */
  answerInfo: {
    /** 问题序号 */
    questionSort: number
    /** 问题类型 */
    questionType: number
    /** 问题名称 */
    questionTitle: string
    /** 是否多选 */
    questionIsMultiple: number
    /** 回答内容 */
    content: string
    /** 附加内容 */
    extraContent: string
  }
}

/** 开始问卷 */
export const $startSurvey = (questionnaireId: string) => {
  return request({
    url: `/kuoka-enterprise-wap/questionnaireRecord/start/${questionnaireId}`,
    method: 'post',
    withMerchantId: true,
    data: {
      questionnaireId
    }
  })
}

/** 提交问卷 */
export const $submitSurvey = (options: SubmitSurveyOptions) => {
  return request({
    url: '/kuoka-enterprise-wap/questionnaireRecord',
    method: 'put',
    data: options
  })
}

/** 获取问卷列表 */
export const $getSurveyList = (
  params: RequestPagination<{
    name?: string
    id?: string
  }>
) => {
  return request<PaginationData<any>>({
    url: '/kuoka-enterprise-wap/questionnaire',
    method: 'get',
    withMerchantId: true,
    params
  })
}

/** 获取问卷远程答题记录 */
export const $getSurveyAnswerRecord = (surveyId: string) => {
  return request({
    url: `/kuoka-enterprise-wap/questionnaire/${surveyId}/myRecord`,
    method: 'get',
    withMerchantId: true
  })
}
