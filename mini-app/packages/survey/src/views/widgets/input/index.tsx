import { computed, defineComponent } from 'vue'
import { CommonSurveyWidgetPropsDefine, defineManifest, RemoveAnswer, useAnswerValue } from '../ types'
import { Input as NativeInput } from '@tarojs/components'
import './style.scss'
import { ANSWER_VALUE_FIELD, WIDGET_INPUT } from '../../../constants'
import { getTextValueValidator, validateTextValue } from '../../../utils'

export const Input = defineComponent({
  props: CommonSurveyWidgetPropsDefine,
  setup(props) {
    const placeholder = computed(() => {
      return props.item?.config.placeholder || '请输入内容'
    })
    const answer = useAnswerValue(props.item)
    const onChange = e => {
      answer.value = e.detail.value
    }

    return () => {
      return (
        <div class="sw_input">
          <NativeInput
            class="sw_input__input"
            placeholder={placeholder.value}
            value={answer.value}
            onInput={onChange}
          />
        </div>
      )
    }
  }
})

export const manifest = defineManifest({
  key: WIDGET_INPUT,
  render: Input,
  validate: item => {
    if (item.answer) {
      // 校验文本类型
      if (item.config.type) {
        const res = validateTextValue(item.answer, item.config.type)
        if (!res) {
          const t = getTextValueValidator(item.config.type)
          return {
            valid: false,
            message: `输入格式为：${t?.formatter || t?.label}`
          }
        }
      }
      return true
    }
    return true
  },
  format: (data: string) => {
    return {
      [ANSWER_VALUE_FIELD]: data ?? ''
    }
  },
  retrieve: (answer: RemoveAnswer) => {
    return answer[ANSWER_VALUE_FIELD]
  }
})
