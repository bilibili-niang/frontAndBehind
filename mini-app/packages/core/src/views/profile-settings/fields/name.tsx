import { defineComponent, ref, watch } from 'vue'
import './name.scss'
import { Input } from '@tarojs/components'
import { useModal } from '../../../hooks'
import Wrap, { commonProfileWidgetPropsDefine } from '../wrap'

export default defineComponent({
  props: {
    ...commonProfileWidgetPropsDefine
  },
  setup(props) {
    const name = ref<string>(props.value || '')

    watch(
      () => props.value,
      () => {
        name.value = props.value
      }
    )

    const onEdit = () => {
      edit({
        title: '姓名',
        text: name.value,
        onSuccess: v => {
          name.value = v
          props.onChange?.(name.value)
        }
      })
    }
    return () => {
      return (
        <Wrap label="姓名" required={props.required} onClick={onEdit}>
          <div>{name.value ? name.value : <div class="placeholder">请输入姓名</div>}</div>
        </Wrap>
      )
    }
  }
})

const edit = (options: { title: string; text?: string; onSuccess: (text: string) => void }) => {
  const textRef = ref(options.text ?? '')
  const focus = ref(false)
  setTimeout(() => {
    focus.value = true
  }, 600)

  const confirm = () => {
    options.onSuccess(textRef.value)
    modal.close()
  }

  const modal = useModal({
    title: `${options.text ? '修改' : '设置'}${options.title}`,
    content: () => {
      return (
        <div class="after-sale-edit-amount">
          {/* <div class="tip">请输入{options.title}</div> */}
          <div class="input-wrap">
            <div class="label">{options.title}</div>
            <Input
              class="input"
              autoFocus={focus.value}
              focus={focus.value}
              value={textRef.value}
              alwaysEmbed
              onInput={e => {
                textRef.value = e.detail.value
              }}
              onBlur={() => {
                focus.value = false
              }}
              onConfirm={confirm}
            />
          </div>
          <div class="action" onClick={confirm}>
            确定
          </div>
        </div>
      )
    }
  })
}

export const useModifyText = edit
