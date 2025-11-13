// 周一到周日的选择
import { defineComponent, ref, watch } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { Checkbox, CheckboxGroup } from '@anteng/ui'

const days = [
  { label: '一', value: 1 },
  { label: '二', value: 2 },
  { label: '三', value: 3 },
  { label: '四', value: 4 },
  { label: '五', value: 5 },
  { label: '六', value: 6 },
  { label: '日', value: 0 }
]

export default defineComponent({
  name: 'DayPicker',
  props: CommonWidgetPropsDefine,
  setup(props) {
    const _value = ref<number[]>([])

    const init = () => {
      _value.value = props.value
    }

    watch(
      () => _value.value,
      (newVal) => {
        props.onChange(newVal)
      }
    )

    init()

    return () => {
      return (
        <div class="OpenDay">
          <CheckboxGroup
            value={_value.value}
            onChange={(e: number[]) => {
              _value.value = e.sort((a, b) => {
                if (a === 0) return 1
                if (b === 0) return -1
                return a - b
              })
            }}
          >
            {days.map((item) => {
              return <Checkbox value={item.value}>{item.label}</Checkbox>
            })}
            &emsp;
            <a
              onClick={() => {
                _value.value = days.map((i) => i.value)
              }}
            >
              全选
            </a>
            &emsp;
            <a
              onClick={() => {
                _value.value = days.slice(-2).map((i) => i.value)
              }}
            >
              周末
            </a>
          </CheckboxGroup>
        </div>
      )
    }
  }
})
