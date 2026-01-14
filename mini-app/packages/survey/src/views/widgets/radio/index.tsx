import { computed, defineComponent, withModifiers } from 'vue'
import { getIndexLabel } from '@pkg/shared/utils'
import './style.scss'
import { CommonSurveyWidgetPropsDefine, defineManifest, RemoveAnswer, useAnswerValue } from '../ types'
import { Input } from '@tarojs/components'
import { ANSWER_EXTRA_FIELD, ANSWER_VALUE_FIELD, WIDGET_RADIO } from '../../../constants'
import { getTextValueValidator, validateTextValue } from '../../../utils'

export const Radio = defineComponent({
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

    const options = computed<RadioOptionItem[]>(() => {
      return (props.item?.config.options ?? [])
        .filter((item: any) => item)
        .map((item: any) => {
          return {
            ...item
          }
        })
    })

    const answer = useAnswerValue(props.item, {
      value: '',
      extra: ''
    })

    const onItemClick = (item: (typeof options.value)[number]) => {
      answer.value = {
        value: item.value,
        extra: ''
      }
    }

    const onInput = e => {
      answer.value.extra = e.detail.value
      answer.value = answer.value
    }

    return () => {
      return (
        <div class="sw_radio-group">
          {options.value.map((item, index) => {
            const checked = item.value === answer.value?.value
            const showExtra = checked && item.extraEnable
            return (
              <div
                class={['sw_radio clickable', checked && 'checked']}
                onClick={() => {
                  onItemClick(item)
                }}
              >
                <div class="sw_radio__button"></div>
                <div class="sw_radio__content">
                  {indexMap.value[index]}. {item.value}{' '}
                  {showExtra &&
                    (item.extra?.required ? (
                      <span class="sw_radio__required">[必填]</span>
                    ) : (
                      <span class="sw_radio__optional">[选填]</span>
                    ))}
                  <div class="sw_radio__desc">{item.description}</div>
                  {showExtra && (
                    <div class="sw_radio__extra sw_input">
                      <Input
                        class="sw_input__input"
                        // @ts-ignore
                        onClick={withModifiers(() => {}, ['stop'])}
                        maxlength={item.extra?.maxLength}
                        placeholder={item.extra?.placeholder}
                        value={answer.value?.extra}
                        onInput={onInput}
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

type RadioOptionItem = {
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
type RadioConfig = {
  options: RadioOptionItem[]
}

export const manifest = defineManifest({
  key: WIDGET_RADIO,
  render: Radio,
  format: (data: any) => {
    return {
      [ANSWER_VALUE_FIELD]: data.value,
      [ANSWER_EXTRA_FIELD]: data.extra
    }
  },
  retrieve: (answer: RemoveAnswer) => {
    return {
      value: answer[ANSWER_VALUE_FIELD],
      extra: answer[ANSWER_EXTRA_FIELD]
    }
  },
  validate: item => {
    try {
      if (item.answer) {
        const option = item.config.options.find(i => i.value === item.answer.value)
        if (option?.extraEnable && option?.extra?.required && !item.answer.extra) {
          return { valid: false, message: `选项【${option.value}】附加值为必填` }
        }
        if (option.extraEnable) {
          // 仅填附加值写时校验，长度、类型
          if (item.answer.extra.length > 0) {
            if (option.extra?.minLength && item.answer.extra.length < option.extra.minLength) {
              return {
                valid: false,
                message: `选项【${option.value}】附加值至少填写 ${option.extra.minLength} 字`
              }
            }
            if (option.extra?.maxLength && item.answer.extra.length > option.extra.maxLength) {
              return {
                valid: false,
                message: `选项【${option.value}】附加值最多填写 ${option.extra.maxLength} 字`
              }
            }
            // 校验文本类型
            if (option.extra?.type) {
              const res = validateTextValue(item.answer.extra, option.extra.type)
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
      }
    } catch (err) {}
    return true
  }
})
