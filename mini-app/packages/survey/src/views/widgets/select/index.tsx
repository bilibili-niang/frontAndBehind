import { computed, defineComponent } from 'vue'
import { CommonSurveyWidgetPropsDefine, RemoveAnswer, useAnswerValue } from '../ types'
import './style.scss'
import { Icon, Radio } from '@pkg/ui'
import { useModal } from '@pkg/core'
import { ANSWER_VALUE_FIELD } from '../../../constants'

export const Select = defineComponent({
  props: CommonSurveyWidgetPropsDefine,
  setup(props) {
    const options = computed<SelectOptionItem[]>(() => {
      return (props.item?.config.options ?? [])
        .filter((item: any) => item)
        .map((item: any) => {
          return {
            ...item
          }
        })
    })

    const answer = useAnswerValue(props.item)

    const onChange = (v: any) => {
      answer.value = v
    }

    const onSelect = () => {
      const modal = useModal({
        title: '请选择',
        height: 'auto',
        content: () => {
          return (
            <div class="sw_select__list">
              {props.item?.config.options?.map(item => {
                return (
                  <div
                    class="sw_select__item"
                    onClick={() => {
                      modal.close()
                      onChange(item.value)
                    }}
                  >
                    <Radio checked={item.value === answer.value}></Radio>
                    <div class="text">{item.value}</div>
                  </div>
                )
              })}
            </div>
          )
        }
      })
    }

    return () => {
      return (
        <div class="sw_select" onClick={onSelect}>
          {!answer.value ? (
            <div class="sw_select__placeholder">请选择内容</div>
          ) : (
            <div class="sw_select__value">{answer.value}</div>
          )}
          <Icon name="right" />
        </div>
      )
    }
  }
})

type SelectOptionItem = {
  value: string
  description: string
}
type SelectConfig = {
  options: SelectOptionItem[]
}

export const manifest = {
  format: (data: any) => {
    return {
      [ANSWER_VALUE_FIELD]: data
    }
  },
  retrieve: (answer: RemoveAnswer) => {
    return answer[ANSWER_VALUE_FIELD]
  },
  render: Select
}
