import { defineComponent, nextTick, reactive, ref, watch } from 'vue'
import { Input, Tag } from '@anteng/ui'
import './style.scss'
import { CommonWidgetPropsDefine } from '../../../../types/widget'

export default defineComponent({
  name: 'Widget_Tag',
  props: CommonWidgetPropsDefine,
  setup(props) {
    const inputRef = ref()
    const state = reactive({
      tags: props.value?.slice?.(0) || [],
      inputVisible: false,
      inputValue: ''
    })

    const triggerChange = () => {
      props.onChange(state.tags.slice(0))
    }

    watch(
      () => props.value,
      () => {
        state.tags = props.value?.slice?.(0) || []
      }
    )

    const handleClose = (removedTag: string) => {
      const tags = state.tags.filter((tag: string) => tag !== removedTag)
      state.tags = tags
      triggerChange()
    }

    const showInput = () => {
      state.inputVisible = true
      nextTick(() => {
        inputRef.value.focus()
      })
    }

    const handleInputConfirm = () => {
      const inputValue = state.inputValue
      let tags = state.tags
      if (inputValue && tags.indexOf(inputValue) === -1) {
        tags = [...tags, inputValue]
      }
      Object.assign(state, {
        tags,
        inputVisible: false,
        inputValue: ''
      })
      triggerChange()
    }

    return () => {
      const { tags, inputVisible, inputValue } = state
      return (
        <div class="w_tag">
          {tags.map((tag: string) => {
            return (
              <Tag class="w_tag__tag" key={tag} closable onClose={() => handleClose(tag)}>
                {tag}
              </Tag>
            )
          })}
          {inputVisible ? (
            <Input
              class="w_tag__input"
              ref={inputRef}
              // v-model:value={inputValue}
              value={inputValue}
              onChange={(e) => (state.inputValue = e.target.value || '')}
              type="text"
              size="small"
              style={{ width: '78px' }}
              onBlur={handleInputConfirm}
              onKeyup={(e) => {
                if (e.key === 'Enter') {
                  handleInputConfirm()
                }
              }}
            />
          ) : (
            <Tag class="w_tag__tag w_tag__add" onClick={() => showInput()}>
              ＋添加标签
            </Tag>
          )}
        </div>
      )
    }
  }
})
