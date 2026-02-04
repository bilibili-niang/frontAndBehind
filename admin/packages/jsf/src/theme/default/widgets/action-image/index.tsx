import { defineComponent, ref, watch } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { ImageWidget } from '../image'
import ActionWidget from '../../../standard/widgets/action'
import type { ImageDefine } from '@pkg/core'

export default defineComponent({
  name: 'JSFWidgetActionImage',
  props: CommonWidgetPropsDefine,
  setup(props) {
    const valueRef = ref<any>(props.value ?? { url: '', width: 0, height: 0, action: null })

    watch(
      () => props.value,
      (v) => {
        valueRef.value = v ?? { url: '', width: 0, height: 0, action: null }
      },
      { deep: true }
    )

    const triggerChange = () => {
      props.onChange?.(valueRef.value)
    }

    return () => {
      const imageValue: ImageDefine = {
        url: valueRef.value?.url ?? '',
        width: valueRef.value?.width ?? 0,
        height: valueRef.value?.height ?? 0
      }

      return (
        <div style="display:flex;flex-direction:column;gap:8px;">
          <ImageWidget
            {...props.schema.config}
            image={imageValue}
            onChange={(img: ImageDefine) => {
              valueRef.value = { ...valueRef.value, url: img.url, width: img.width, height: img.height }
              triggerChange()
            }}
          />

          <ActionWidget
            schema={{ type: 'object' } as any}
            value={valueRef.value?.action}
            onChange={(action: any) => {
              valueRef.value = { ...valueRef.value, action }
              triggerChange()
            }}
          />
        </div>
      )
    }
  }
})