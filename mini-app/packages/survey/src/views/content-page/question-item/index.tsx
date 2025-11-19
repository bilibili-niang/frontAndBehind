import { defineComponent, type PropType } from 'vue'
import type { SurveyFormItem } from '../../../form'
import './style.scss'
import { useSurveyFormStore } from '../../../stores/form'
import { storeToRefs } from 'pinia'
import { DEFAULT_QUESTION_NAME } from '../../../constants'
import RenderError from './error'
import { manifestMap } from '../../widgets'
import { formatHtmlUnit } from '@anteng/utils'

export default defineComponent({
  name: '',
  props: {
    index: {
      type: Number
    },
    item: {
      type: Object as PropType<SurveyFormItem>,
      required: true
    }
  },
  setup(props) {
    const formStore = useSurveyFormStore()
    const { showIndex } = storeToRefs(formStore)

    return () => {
      const item = props.item
      const Render = manifestMap[item.key]?.render ?? RenderError
      return (
        <div class={['question-item', showIndex.value && 'show-index']} id={`question-${item.$id}`}>
          <div class="question-item-anchor">{/* 用于滚动定位，无任何内容，不可删除 */}</div>
          <div class="question-item__title">
            {showIndex.value && item.indexLabel && (
              <div class="question-item__index number-font">{item.indexLabel}.&nbsp;</div>
            )}

            <div class="text">
              {item.required && <div class="question-item__required">必填</div>}
              {item.name || DEFAULT_QUESTION_NAME}
            </div>
          </div>
          {item.errors.length > 0 && <div class="question-item__error">{item.errors[0]}</div>}
          {item.description && <div class="question-item__desc" v-html={formatHtmlUnit(item.description || '')}></div>}
          <Render item={item} />
        </div>
      )
    }
  }
})
