import { defineComponent, ref, withModifiers, watch, computed } from 'vue'
import './style.scss'
import { Button, Icon, Input } from '@anteng/ui'
import { type AddressData, useAddressSelector } from '@anteng/core'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { getWidgetConfig } from '../../../../utils/widget'

export default defineComponent({
  name: 'Widget_AddressSelector',
  props: CommonWidgetPropsDefine,
  setup(props) {
    const state = ref<AddressData | null>(null)

    watch(
      () => props.value,
      () => {
        state.value = {
          name: props.value?.name ?? '',
          address: props.value?.address ?? '',
          city: props.value?.city ?? '',
          longitude: props.value?.longitude ?? (null as unknown as number),
          latitude: props.value?.latitude ?? (null as unknown as number)
        }
      },
      {
        immediate: true,
        deep: true
      }
    )

    const onSelect = () => {
      useAddressSelector({
        longitude: props.value?.longitude,
        latitude: props.value?.latitude,
        onSuccess: (data) => {
          state.value = data
          props.onChange(data)
        }
      })
    }

    const placeholder = getWidgetConfig(props.schema, 'placeholder') ?? '请选择地址'
    const onFocus = () => {
      if (!props.value?.address) {
        onSelect()
      }
    }
    const onInputChange = (e: any) => {
      if (state.value?.longitude) {
        state.value.address = e.target.value
        props.onChange(state.value)
      }
    }

    const withLocation = getWidgetConfig(props.schema, 'withLocation')

    const hasLocation = computed(() => !!state.value?.longitude && !!state.value?.latitude)

    return () => {
      const location = hasLocation.value ? `${state.value?.latitude},${state.value?.longitude}` : ''
      return (
        <>
          <div class="w_address-selector" onClick={onFocus}>
            <Input
              class="w_address-selector__input"
              placeholder={placeholder}
              {...props.config?.inputProps}
              value={state.value?.address}
              prefix={withLocation && <span style="opacity:0.4">详细地址：</span>}
              onChange={onInputChange}
            />
            {props.value && (
              <Icon
                class="w_address-selector__clear"
                name="error-fill"
                onClick={withModifiers(() => {
                  state.value = null
                  props.onChange(state.value)
                }, ['stop'])}
              />
            )}
            <Button class="w_address-selector__button" type="default" onClick={withModifiers(onSelect, ['stop'])}>
              选择
            </Button>
          </div>
          {withLocation && (
            <Input
              style="margin-top:8px;"
              prefix={<span style="opacity:0.4">地理坐标：</span>}
              placeholder="根据选择地址自动计算"
              readonly
              value={location}
            />
          )}
        </>
      )
    }
  }
})
