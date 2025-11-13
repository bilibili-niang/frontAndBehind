import { defineComponent, ref, watch } from 'vue'
import { CommonWidgetPropsDefine } from '../../../types/widget'
import { useActionSelector } from '@anteng/core'

const ActionWidget = defineComponent({
  name: 'w_action',
  props: CommonWidgetPropsDefine,
  setup(props, { emit }) {
    const valueRef = ref<any>(props.value ?? null)

    watch(() => props.value, (v) => { valueRef.value = v ?? null }, { deep: true })

    const triggerChange = (v: any) => {
      if (props.onChange) props.onChange(v)
      else emit('change', v)
    }

    const onSelect = () => {
      useActionSelector({
        key: valueRef.value?.key,
        remark: valueRef.value?.remark,
        config: valueRef.value?.config,
        onChange: (res) => { valueRef.value = res; triggerChange(res) }
      })
    }

    const onClear = (e: MouseEvent) => { e.stopPropagation(); valueRef.value = null; triggerChange(null) }

    return () => {
      const text = valueRef.value?.remark || valueRef.value?.key
      return (
        <div class="w_common-selector clickable" onClick={onSelect}>
          <div class="w_common-selector__icon"><iconpark-icon name="click"></iconpark-icon></div>
          {text ? (
            <>
              <div class="w_common-selector__title">{text}</div>
              <div class="w_common-selector__icon --checked"><iconpark-icon name="check-one"></iconpark-icon></div>
              <div class="w_common-selector__icon --remove" onClick={onClear}><iconpark-icon name="error"></iconpark-icon></div>
            </>
          ) : (
            <div class="w_common-selector__placeholder">点击选择 action</div>
          )}
        </div>
      )
    }
  }
})

export default ActionWidget