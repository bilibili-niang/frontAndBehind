import { computed, defineComponent, withModifiers } from 'vue'
import { getIndexLabel } from '@anteng-shared/utils'
import './style.scss'

import { ANSWER_EXTRA_FIELD, ANSWER_VALUE_FIELD, ERROR_MESSAGE_REQUIRED, WIDGET_CHECKBOX } from '../../../constants'
import { CommonSurveyWidgetPropsDefine, defineManifest, RemoveAnswer, useAnswerValue } from '../ types'
import { Input } from '@tarojs/components'
import { useToast } from '@anteng/core'
import { getTextValueValidator, validateTextValue } from '../../../utils'

export const Checkbox = defineComponent({
  props: CommonSurveyWidgetPropsDefine,
  setup(props) {
    const indexType = computed<'number' | 'letter'>(() => 'letter')
    const indexMap = computed(() => {
      return options.value.map((item, index) => {
        if (indexType.value === 'letter') {
          return getIndexLabel(index)
        }
        return index + 1
      })
    })

    const min = computed(() => {
      if (props.item?.config?.limit?.min > 0) {
        return props.item!.config.limit.min
      }
      return props.item?.required ? 1 : 0
    })

    const max = computed(() => {
      const m = props.item?.config?.limit?.max
      return m >= min.value ? m : +Infinity
    })

    const limitText = computed(() => {
      if (min.value > 1 && max.value === min.value) {
        return `请选择 ${max.value} 项`
      }
      return [
        min.value > 1 ? `最少选择 ${min.value} 项` : '',
        max.value !== +Infinity ? `最多选择 ${max.value} 项` : ''
      ]
        .filter(i => i)
        .join('，')
    })

    const options = computed<CheckboxOptionItem[]>(() => {
      return (props.item?.config.options ?? [])
        .filter((item: any) => item)
        .map((item: any) => {
          return {
            ...item
          }
        })
    })

    const answer = useAnswerValue<{ value: string; extra: string }[]>(props.item, [])

    const onItemClick = (item: (typeof options.value)[number]) => {
      const index = answer.value.findIndex(a => a.value === item.value)
      if (index > -1) {
        answer.value.splice(index, 1)
      } else {
        if (answer.value.length >= max.value) {
          useToast(`最多可选 ${max.value} 项`)
          return void 0
        }
        answer.value.push({
          value: item.value,
          extra: ''
        })
      }
      answer.value = answer.value
    }

    const onInput = (item: (typeof options.value)[number], e: any) => {
      const target = answer.value.find(a => a.value === item.value)
      if (target) {
        target.extra = e.detail.value
      }
      answer.value = answer.value
    }

    return () => {
      return (
        <div class="sw_checkbox-group">
          {limitText.value && <div class="sw_checkbox__tip">{limitText.value}</div>}
          {options.value.map((item, index) => {
            const target = answer.value.find(a => a.value === item.value)
            const checked = !!target
            const showExtra = checked && item.extraEnable
            return (
              <div
                class={['sw_checkbox clickable', checked && 'checked']}
                onClick={() => {
                  onItemClick(item)
                }}
              >
                <div class="sw_checkbox__button"></div>
                <div class="sw_checkbox__content">
                  {indexMap.value[index]}. {item.value}{' '}
                  {showExtra &&
                    (item.extra?.required ? (
                      <span class="sw_checkbox__required">[必填]</span>
                    ) : (
                      <span class="sw_checkbox__optional">[选填]</span>
                    ))}
                  <div class="sw_checkbox__desc">{item.description}</div>
                  {showExtra && (
                    <div class="sw_checkbox__extra sw_input">
                      <Input
                        class="sw_input__input"
                        // @ts-ignore
                        onClick={withModifiers(() => {}, ['stop'])}
                        maxlength={item.extra?.maxLength}
                        placeholder={item.extra?.placeholder}
                        value={target?.extra}
                        onInput={e => {
                          onInput(item, e)
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )
    }
  }
})

type CheckboxOptionItem = {
  value: string
  description: string
  extraEnable?: boolean
  extra?: {
    type?: string
    required?: boolean
    placeholder?: string
    minLength?: number
    maxLength?: number
  }
}
type CheckboxConfig = {
  options: CheckboxOptionItem[]
}

export const manifest = defineManifest({
  key: WIDGET_CHECKBOX,
  format: (data: any) => {
    return {
      [ANSWER_VALUE_FIELD]: data.map(item => item.value ?? '')?.join(','),
      [ANSWER_EXTRA_FIELD]: data.map(item => item.extra ?? '')?.join(',')
    }
  },
  retrieve: (answer: RemoveAnswer) => {
    const value = answer[ANSWER_VALUE_FIELD].split(',')
    const extra = answer[ANSWER_EXTRA_FIELD].split(',')
    return value.map((item, index) => {
      return {
        value: item,
        extra: extra[index]
      }
    })
  },
  render: Checkbox,
  validate: item => {
    if (item.required && !(item.answer?.length > 0)) {
      // 错误1，必填时，未填写
      return { valid: false, message: ERROR_MESSAGE_REQUIRED }
    }

    const min = (() => {
      if (item?.config?.limit?.min > 0) {
        return item!.config.limit.min
      }
      return item?.required ? 1 : 0
    })()

    const max = (() => {
      const m = item?.config?.limit?.max
      return m >= min ? m : +Infinity
    })()

    if (item.answer?.length < min) {
      // 错误2，选择数量少
      return { valid: false, message: `至少选择 ${min} 项` }
    }

    if (item.answer?.length > max) {
      // 错误3，选择数量多
      return { valid: false, message: `最多可选 ${max} 项` }
    }

    // 遍历检查填空是否必填
    const requiredExtra = item.answer?.find(i => {
      if (i.extra) return false
      const option = item.config?.options.find(j => i.value === j.value)
      return option?.extraEnable && option?.extra?.required
    })

    // 错误4，附加值必填时未填写
    if (requiredExtra) return { valid: false, message: `选项【${requiredExtra.value}】附加值为必填` }

    // 错误5，附加值长度错误
    const lengthErrors = item.answer
      ?.map(i => {
        const option = item.config?.options.find(j => i.value === j.value)

        // 附加值长度错误
        if (option.extraEnable) {
          // 未填写时不校验
          if (i.extra.length > 0) {
            if (option.extra?.minLength && i.extra.length < option.extra.minLength) {
              return {
                valid: false,
                message: `选项【${option.value}】附加值至少填写 ${option.extra.minLength} 字`
              }
            }
            if (option.extra?.maxLength && i.extra.length > option.extra.maxLength) {
              return {
                valid: false,
                message: `选项【${option.value}】附加值最多填写 ${option.extra.maxLength} 字`
              }
            }
            // 校验文本类型
            if (option.extra?.type) {
              const res = validateTextValue(i.extra, option.extra.type)
              if (!res) {
                const t = getTextValueValidator(option.extra.type)
                return {
                  valid: false,
                  message: `选项【${option.value}】附加值格式为：${t?.formatter || t?.label}`
                }
              }
            }
          }
        }
      })
      .filter(i => i)

    if (lengthErrors[0]) {
      return lengthErrors[0]
    }

    return true
  }
})
