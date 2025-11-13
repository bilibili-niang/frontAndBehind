import { useRichTextEditor } from '@anteng/core'
import { computed, defineComponent } from 'vue'
import './style.scss'
import { CommonWidgetPropsDefine } from '../../../../types/widget'

export default defineComponent({
  name: 'w_rich-text',
  props: CommonWidgetPropsDefine,
  setup(props) {
    const handleEdit = () => {
      useRichTextEditor({
        content: props.value,
        onConfirm: (content: string) => {
          props.onChange(content)
        }
      })
    }
    const hasNoContent = computed(() => !(props.value?.length > 0))
    return () => {
      return (
        <div class="w_rich-text">
          {hasNoContent.value ? (
            <div class="w_rich-text__preview--empty clickable" onClick={handleEdit}>
              <div class="w_rich-text__toolbar">
                {hasNoContent.value && <span>暂无内容，请 </span>}
                <a class="clickable" href="javascript:void(0);">
                  &nbsp;<iconpark-icon name="edit"></iconpark-icon>&nbsp;编辑
                </a>
              </div>
            </div>
          ) : (
            <>
              <div class="w_rich-text__toolbar">
                {hasNoContent.value && <span>暂无内容，请 </span>}
                <a class="clickable" href="javascript:void(0);" onClick={handleEdit}>
                  &nbsp;<iconpark-icon name="edit"></iconpark-icon>&nbsp;编辑内容
                </a>
              </div>
      <div class="w_rich-text__preview ui-scrollbar">
                <div class="w_rich-text__content" v-html={props.value}></div>
              </div>
            </>
          )}
        </div>
      )
    }
  }
})
