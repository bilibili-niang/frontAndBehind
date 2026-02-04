import { useMapCenter } from '@pkg/core'
import { CommonWidgetPropsDefine } from '@pkg/jsf'
import { Icon } from '@pkg/ui'
import { computed, defineComponent, withModifiers } from 'vue'

export default defineComponent({
  name: 'W_MapCenter',
  props: CommonWidgetPropsDefine,
  setup(props) {
    const onClick = () => {
      useMapCenter({
        location: props.value,
        onSuccess: (value) => {
          props.onChange(value)
        }
      })
    }

    const onClear = () => {
      props.onChange(null)
    }

    const center = computed(() => {
      if (!props.value) return ''
      try {
        return `${props.value.lat.toFixed(4)}, ${props.value.lng.toFixed(4)}`
      } catch (err) {
        return '无效坐标点'
      }
    })

    return () => {
      return (
        <div class="w_common-selector clickable" onClick={onClick}>
          <div class="w_common-selector__icon">
            <Icon name="location-outline"></Icon>
          </div>
          {props.value?.lat && props.value.lng ? (
            <>
              <div class="w_common-selector__title">{center.value}</div>
              <div class="w_common-selector__icon --checked">
                <iconpark-icon name="check-one"></iconpark-icon>
              </div>
              <div class="w_common-selector__icon --remove" onClick={withModifiers(onClear, ['stop'])}>
                <iconpark-icon name="error"></iconpark-icon>
              </div>
            </>
          ) : (
            <div class="w_common-selector__placeholder">未设置地图中心点</div>
          )}
        </div>
      )
    }
  }
})
