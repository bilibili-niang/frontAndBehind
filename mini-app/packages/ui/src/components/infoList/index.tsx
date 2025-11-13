import { defineComponent, type PropType } from 'vue'
import message from '../message'

type InfoItem = { label: string; value: any; copy?: string }

export default defineComponent({
  name: 'UiInfoList',
  props: {
    list: { type: Array as PropType<InfoItem[]>, required: true }
  },
  setup(props) {
    const onCopy = async (text?: string) => {
      if (!text) return
      try {
        await navigator.clipboard.writeText(text)
        message.success('已复制')
      } catch (e) {
        message.error('复制失败')
      }
    }

    return () => (
      <div class="ui-info-list">
        {props.list.map((item) => (
          <div class="ui-info-list__row">
            <div class="ui-info-list__label">{item.label}</div>
            <div class="ui-info-list__value">{item.value as any}</div>
            {item.copy && (
              <button class="ui-info-list__copy" onClick={() => onCopy(item.copy)}>复制</button>
            )}
          </div>
        ))}
      </div>
    )
  }
})