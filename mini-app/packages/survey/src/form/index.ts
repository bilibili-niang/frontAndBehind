import { clamp, merge } from 'lodash-es'
import { generateDefaultFormSettings, SurveyFormSettings } from './settings'
import { generateDefaultFormStyles, SurveyFormStyles } from './styles'
import { manifestMap } from '../views/widgets'
import {
  ANSWER_EXTRA_FIELD,
  ANSWER_VALUE_FIELD,
  ERROR_MESSAGE_REQUIRED,
  WIDGET_CHECKBOX,
  WIDGET_FILE_UPLOADER,
  WIDGET_OPTIONS
} from '../constants'
import { useToast } from '@anteng/core'

interface SurveyFormItemOptions {
  $id: string
  key:
    | 'radio'
    | 'checkbox'
    | 'select'
    | 'text'
    | 'textarea'
    | 'number'
    | 'date-range'
    | 'date'
    | 'time-range'
    | 'time'
    | 'rate'
    | (string & {})
  name: string
  required: boolean
  description: string
  config: any
  answer?: any | null
  $remote_answer?: any
}

class SurveyFormItem {
  $id: string
  $formId: string
  // private $form: SurveyForm | null = null
  key: SurveyFormItemOptions['key']
  name = ''
  required = true
  description = ''
  manifest: any = null // TODO 补充类型定义
  config: { [key: string]: any } = {}

  answer: any = null
  $remote_answer: any = null
  errors: string[] = []

  constructor(form: SurveyForm, options: SurveyFormItemOptions) {
    this.$formId = form.$id
    this.key = options.key
    Object.keys(this).forEach(key => {
      if (options[key] !== undefined) {
        ;(this[key as keyof SurveyFormItemOptions] as any) = options[key]!
      }
    })

    this.manifest = manifestMap[this.key]
    this.config = merge(this.manifest?.default?.(), this.config)

    // 恢复远程服务器答案
    this.$remote_answer = options.$remote_answer
    this.retrieve(options.$remote_answer)
  }

  // 小程序端内实例循环引用会导致 props 注入失败？
  // 这里使用 get 来处理，不知道会有其他问题没有..
  get $form() {
    return forms[this.$formId]
  }

  /** 当前节点在所属表单列表内的下标索引 */
  get index() {
    return this.$form?.items.indexOf(this) ?? -1
  }
  /**
   * 序号字符串
   * 注意：不一定等于 index + 1，因为：
   * 1. （未支持）有些 item 不参与序号排列，如：分割线、段落说明；
   * 2. （未支持）从某一题重新开始计算序号
   * 3. （未支持）分页独立计算序号
   * */
  get indexLabel() {
    return this.index > -1 ? String(this.index + 1).padStart(2, '0') : ''
  }

  /** 控件定义 */
  get widgetDefine() {
    return WIDGET_OPTIONS.find(item => item.value === this.key)
  }

  get type() {
    return (this.widgetDefine as any)?.type
  }

  /** 控件渲染组件 */
  // get widgetRender() {
  //   return this.manifest?.render || WidgetError
  // }

  /** 前置节点列表 */
  get previousItems() {
    const items = this.$form?.items ?? []
    const index = items.indexOf(this)
    if (index > 0) {
      return items.slice(0, index)
    }
    return []
  }
  /** 前置节点列表 */
  get nextItems() {
    const items = this.$form?.items ?? []
    const index = items.indexOf(this)
    if (index > 0) {
      return items.slice(index + 1)
    }
    return []
  }

  /** 设置答案 */
  setAnswer(v: any) {
    this.answer = v
    // 如果存在错误，立即校验
    if (this.errors.length > 0) {
      this.validate()
    }
  }

  /** 校验答案 */
  validate() {
    const errors: string[] = []
    if (this.required && !this.answer) {
      // 小程序不支持文件上传，后续优化使用 webview
      if (process.env.TARO_ENV === 'weapp' && this.key === WIDGET_FILE_UPLOADER) {
        return void 0
      }
      errors.push(ERROR_MESSAGE_REQUIRED)
    }

    const res = this.manifest.validate?.(this)

    if (res !== undefined) {
      if (res === false) {
        errors.push('作答有误，请检查此题')
      } else if (res.valid === false) {
        errors.push(res.message)
      }
    }

    this.errors = errors
    return errors.length === 0
  }
  format() {
    let v = {}
    try {
      v = this.manifest.format?.(this.answer) ?? {}
    } catch (err) {
      console.log(err)
    }

    return {
      questionSort: this.index,
      questionType: this.type,
      questionTitle: this.name,
      questionIsMultiple: this.key === WIDGET_CHECKBOX ? 1 : 0,
      [ANSWER_VALUE_FIELD]: '',
      [ANSWER_EXTRA_FIELD]: '',
      ...v
    }
  }

  retrieve($remote_answer: any) {
    try {
      const res = this.manifest.retrieve?.($remote_answer)
      // console.log($remote_answer, '======>>>>>>>>>', res)
      console.log($remote_answer.questionTitle, '>>>', res)
      this.answer = res
    } catch (err) {}
  }
}

/* ------------------------------------ 华 ----------------------------------- */
/* ------------------------------------ 丽 ----------------------------------- */
/* ------------------------------------ 的 ----------------------------------- */
/* ------------------------------------ 分 ----------------------------------- */
/* ------------------------------------ 割 ----------------------------------- */
/* ------------------------------------ 线 ----------------------------------- */

export interface SurveyFormOptions {
  $id?: string
  name?: string
  description?: string
  settings?: SurveyFormSettings
  styles?: SurveyFormStyles
  items?: SurveyFormItemOptions[]
}

export interface SurveyFormSnapshot extends SurveyFormOptions {}

// FIXME 这里会导致内存无法释放，要找个时机删除不需要的数据
const forms = {}

class SurveyForm {
  $id: string
  name: string = '未命名问卷'
  description: string = ''
  items: SurveyFormItem[] = []
  treeMap: any // TODO 支持树形结构关系
  settings: SurveyFormSettings = generateDefaultFormSettings()
  styles: SurveyFormStyles = generateDefaultFormStyles()
  pagination = {
    current: 0
    // 当前仅支持一页一题，之后再改造
    // pages: []
  }

  constructor(options: SurveyFormOptions) {
    this.retrieveSnapshot(options)
    forms[this.$id] = this
  }
  /** 恢复快照 */
  retrieveSnapshot(options: SurveyFormOptions) {
    this.$id = options.$id ?? this.$id
    options.name && (this.name = options.name)
    options.description && (this.description = options.description)
    this.settings = merge(this.settings, options.settings)
    this.styles = merge(this.styles, options.styles)
    this.items = (options.items || [])?.map(item => {
      return new SurveyFormItem(this, item)
    })
    console.log('恢复快照', options, this)
  }

  validate() {
    return this.items.map(item => item.validate())
  }

  format() {
    const results = this.items.map(item => item.validate())
    if (results.includes(false)) {
      useToast('请检查答案')
      return void 0
    }
    const answerInfo = this.items.map(item => {
      return {
        ...item.format(),
        id: item.$remote_answer?.id ?? 0
      }
    })
    return answerInfo
  }

  get estimateDuration() {
    // 每题 15 秒
    return Math.ceil(0.25 * this.items.length)
  }

  nextPage() {
    this.pagination.current = Math.min(this.items.length - 1, this.pagination.current + 1)
    return this.pagination.current
  }

  prevPage() {
    this.pagination.current = Math.max(0, this.pagination.current - 1)
    return this.pagination.current
  }

  setPage(index: number) {
    this.pagination.current = clamp(index, 0, this.items.length - 1)
    return this.pagination.current
  }

  get currentPage(): SurveyFormItem | undefined {
    return this.items[this.pagination.current]
  }

  get currentProgress() {
    return clamp(this.pagination.current / this.items.length, 0, 1)
  }
}

export { SurveyForm, SurveyFormItem }
