/** 问卷设置 */
export interface SurveyFormSettings {
  base: {
    /** 问卷名称 */
    name: string
    /** 描述信息 */
    description: string
    /** 问卷采集时间 */
    collectionTime: [string, string]
  }
  display: {
    /** 是否显示题目编号 */
    showIndex: boolean
    /** 题目是否分页显示 */
    showPagination: boolean
    /** 题目是否可回退，开启分页后有效 */
    returnable: boolean
  }
  share: {
    /** 开启分享 */
    enable: boolean
    /** 分享标题，不填则默认为问卷名称 */
    title: string
    /** 分享副标题 */
    subtitle: string
    /** 分享缩略图 */
    image: string
  }
}

export const generateDefaultFormSettings = (): SurveyFormSettings => ({
  base: {
    name: '',
    description:
      '为了给您提供更好的服务，希望您能抽出几分钟时间，将您的感受和建议告诉我们，我们非常重视每位用户的宝贵意见，期待您的参与！现在我们就马上开始吧！',
    collectionTime: ['', '']
  },
  display: {
    showIndex: true,
    showPagination: false,
    returnable: true
  },
  share: {
    enable: true,
    title: '',
    subtitle: '',
    image: ''
  }
})
