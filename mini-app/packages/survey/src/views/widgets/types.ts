import { computed, DefineComponent, type PropType } from 'vue'
import type { SurveyFormItem } from '../../form'

export const CommonSurveyWidgetPropsDefine = {
  item: {
    type: Object as PropType<SurveyFormItem>,
    required: true,
    default: () => {
      {
      }
    }
  }
}

export const useAnswerValue = <T = any>(item: SurveyFormItem, defaultValue?: any) => {
  return computed({
    get: (): T => {
      return item.answer ?? defaultValue
    },
    set: (v: T) => {
      return item.setAnswer(v)
    }
  })
}

export type SurveyWidgetManifest = {
  key: string
  render: DefineComponent<typeof CommonSurveyWidgetPropsDefine, any, any>
  format?: (data: any) => any
  retrieve?: (data: any) => any
  validate?: (item: SurveyFormItem) => boolean | { valid: boolean; message?: string }
}

export const defineManifest = (manifest: SurveyWidgetManifest) => manifest

export type RemoveAnswer = {
  content: string
  contentExtend: string
  questionIsMultiple: 0 | 1
  questionSort: number
  questionTitle: string
  questionType: number
}
