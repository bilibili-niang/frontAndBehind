import { defineComponent, ref } from 'vue'
import { Icon, InputNumber, Tooltip } from '@pkg/ui'
import './style.scss'
import { CommonWidgetPropsDefine } from '../../../../types/widget'

export default defineComponent({
  name: 'Widget_Padding',
  props: CommonWidgetPropsDefine,
  setup(props) {
    const initialValue = (props.value || []) as number[]
    const isIndependent = ref(initialValue.filter((item) => item !== initialValue[0]).length !== 0)
    const handleChange = (index: number, v: number) => {
      const value = (props.value || [0, 0, 0, 0]) as [number, number, number, number]
      if (isIndependent.value) {
        value[index] = v > 0 ? v : 0
      } else {
        value.splice(0, 4, v, v, v, v)
      }
      props.onChange(value)
    }
    const triggerChange = (e: Event, index: number) => {
      if (!(Number((e.target as HTMLInputElement).value) > 0)) {
        handleChange(index, 0)
      }
    }

    return () => {
      const v = (props.value as any) || [0, 0, 0, 0]
      return (
        <div class="widget-border-radius">
          <Tooltip title={isIndependent.value ? '独立圆角' : '圆角'}>
            <div
              class={['widget-border-radius__toggler clickable']}
              onClick={() => (isIndependent.value = !isIndependent.value)}
            >
              {isIndependent.value ? (
                <Icon class="__icon --a" style="font-size: 20px;" name="border-radius-all" />
              ) : (
                <Icon class="__icon --a" name="border-radius" />
              )}

            </div>
          </Tooltip>
          <div class="widget-border-radius__input">
            <div class="widget-border-radius__row">
              <InputNumber
                class="__input --r"
                value={v[0]}
                onFocus={(e) => (e.target as any).select()}
                onChange={(v: any) => handleChange(0, v)}
                onBlur={(e) => triggerChange(e, 0)}
                onPressEnter={(e) => triggerChange(e, 0)}
                min={0}
                max={10000}
                controls={false}
              />
              <Icon class="__icon --a" name="border-radius" />
              <Icon class="__icon --b" name="border-radius" />
              <InputNumber
                class="__input --l"
                value={v[1]}
                onFocus={(e) => (e.target as any).select()}
                onChange={(v: any) => handleChange(1, v)}
                onBlur={(e) => triggerChange(e, 1)}
                onPressEnter={(e) => triggerChange(e, 1)}
                min={0}
                max={10000}
                controls={false}
              />
            </div>
            <div class="widget-border-radius__row">
              <InputNumber
                class="__input --r"
                value={v[3]}
                onFocus={(e) => (e.target as any).select()}
                onChange={(v: any) => handleChange(3, v)}
                onBlur={(e) => triggerChange(e, 3)}
                onPressEnter={(e) => triggerChange(e, 3)}
                min={0}
                max={10000}
                controls={false}
              />
              <Icon class="__icon --d" name="border-radius" />
              <Icon class="__icon --c" name="border-radius" />
              <InputNumber
                class="__input --l"
                value={v[2]}
                onFocus={(e) => (e.target as any).select()}
                onChange={(v: any) => handleChange(2, v)}
                onBlur={(e) => triggerChange(e, 2)}
                onPressEnter={(e) => triggerChange(e, 2)}
                min={0}
                max={10000}
                controls={false}
              />
            </div>
            <div class="lock-icon" v-show={!isIndependent.value}>
              <Icon name="lock" />
            </div>
          </div>
        </div>
      )
    }
  }
})
