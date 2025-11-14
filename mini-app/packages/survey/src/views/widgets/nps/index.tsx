import { computed, defineComponent } from 'vue'
import './style.scss'
import { CommonSurveyWidgetPropsDefine, RemoveAnswer, useAnswerValue } from '../ types'
import { ANSWER_VALUE_FIELD } from '../../../constants'

export const NPS = defineComponent({
  props: CommonSurveyWidgetPropsDefine,
  setup(props) {
    const items = computed(() => {
      return Array.from({ length: 10 }).map((_, index) => {
        return index + 1
      })
    })
    props
    const answer = useAnswerValue(props.item)

    const minDesc = computed(() => {
      return props.item!.config.min.text ?? ''
    })
    const maxDesc = computed(() => {
      return props.item!.config.max.text ?? ''
    })
    return () => {
      return (
        <div class="sw_nps">
          <div class="sw_nps-desc">
            <div class="sw_nps-desc-left">{minDesc.value}</div>
            <div class="sw_nps-desc-right">{maxDesc.value}</div>
          </div>
          <div class="sw_nps-list">
            {items.value.map(item => {
              return (
                <div
                  class={['sw_nps-item clickable', item === answer.value && 'active']}
                  onClick={() => {
                    answer.value = item
                  }}
                >
                  {item}
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  }
})

export const manifest = {
  render: NPS,
  format: (data: number) => {
    return {
      [ANSWER_VALUE_FIELD]: data
    }
  },
  retrieve: (answer: RemoveAnswer) => {
    return Number(answer[ANSWER_VALUE_FIELD])
  }
}
