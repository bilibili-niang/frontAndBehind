export interface SurveyDetail {
  answerEnd: AnswerEnd
  answerPage: AnswerPage
  createTime: string
  createUser: number
  /**
   * 显示设置
   */
  displaySettings: DisplaySettings
  endTime: string
  /**
   * 问卷首页
   */
  homePage: HomePage
  id: number
  isDeleted: number
  merchantId: number
  name: string
  /**
   * 题目内容
   */
  questionContent: QuestionContent[]
  /**
   * 分享设置
   */
  shareSettings: ShareSettings
  startTime: string
  status: number
  tenantId: string
  updateTime: string
  updateUser: number
  [property: string]: any
}

export interface AnswerEnd {
  /**
   * 广告图
   */
  adUrl: string
  /**
   * 按钮文本
   */
  button: AnswerEndButton
  /**
   * 感谢语文本
   */
  thanksText: ThanksText
  /**
   * 问卷封面
   */
  url: string
  [property: string]: any
}

/**
 * 按钮文本
 */
export interface AnswerEndButton {
  /**
   * 按钮底色
   */
  buttonColor: string
  /**
   * 按钮文字
   */
  buttonText: string
  /**
   * 按钮文本颜色
   */
  buttonTextColor: string
  [property: string]: any
}

/**
 * 感谢语文本
 */
export interface ThanksText {
  /**
   * 字体颜色
   */
  color: string
  /**
   * 字号
   */
  fontSize: string
  /**
   * 字体粗细
   */
  fontWeight: string
  [property: string]: any
}

export interface AnswerPage {
  /**
   * 页面背景颜色
   */
  backgroundColor: string
  /**
   * 选项样式
   */
  optionStyle: OptionStyle
  /**
   * 主题色
   */
  themeColor: string
  /**
   * 题干样式
   */
  titleStyle: TitleStyle
  /**
   * 问卷封面
   */
  url: string
  [property: string]: any
}

/**
 * 选项样式
 */
export interface OptionStyle {
  color: string
  fontSize: string
  fontWeight: string
  [property: string]: any
}

/**
 * 题干样式
 */
export interface TitleStyle {
  /**
   * 字体颜色
   */
  color: string
  /**
   * 字号
   */
  fontSize: string
  /**
   * 字体粗细
   */
  fontWeight: string
  [property: string]: any
}

/**
 * 显示设置
 */
export interface DisplaySettings {
  /**
   * 答题过程可否回退
   */
  showBack: boolean
  /**
   * 显示题目序号
   */
  showIndex: boolean
  /**
   * 题目分页显示
   */
  showPage: boolean
  [property: string]: any
}

/**
 * 问卷首页
 */
export interface HomePage {
  /**
   * 按钮文本
   */
  button: HomePageButton
  /**
   * 引导语
   */
  guide: string
  /**
   * 文本样式
   */
  textStyle: string
  /**
   * 问卷标题
   */
  title: string
  /**
   * 问卷封面
   */
  url: string
  [property: string]: any
}

/**
 * 按钮文本
 */
export interface HomePageButton {
  /**
   * 按钮底色
   */
  buttonColor: string
  /**
   * 按钮文字
   */
  buttonText: string
  /**
   * 按钮文本颜色
   */
  buttonTextColor: string
  [property: string]: any
}

export interface QuestionContent {
  /**
   * 内容格式
   */
  contentFormat: number
  /**
   * 显示样式，0-数值 1-多行
   */
  displayStyle: number
  /**
   * 输入框行高
   */
  inputHeight: number
  /**
   * 输入提示
   */
  inputPrompt: string
  /**
   * 选项布局，0-1列 1-2列 2-3列
   */
  layout: number
  /**
   * 选项设置
   */
  options: Option[]
  /**
   * 是否必填，0-否 1-是
   */
  required: number
  /**
   * 可选范围
   */
  scope: string
  /**
   * 题目标题
   */
  topicName: string
  /**
   * 题目类型
   */
  topicType: number
  /**
   * 两级文案
   */
  twoLevelText: string
  [property: string]: any
}

export interface Option {
  /**
   * 选项后增加填空框，0-关闭 1-开启
   */
  addTextbox: number
  /**
   * 内容格式
   */
  contentFormat: number
  /**
   * 选项说明
   */
  optionDesc: string
  /**
   * 选项文本
   */
  optionText: string
  /**
   * 选项值，0-不是必填 1-必填
   */
  optionValue: number
  [property: string]: any
}

/**
 * 分享设置
 */
export interface ShareSettings {
  /**
   * 是否可分享
   */
  shareable: boolean
  /**
   * 分享图片
   */
  shareImg: string
  /**
   * 分享副标题
   */
  shareSubTitle: string
  /**
   * 分享主标题
   */
  shareTitle: string
  [property: string]: any
}
