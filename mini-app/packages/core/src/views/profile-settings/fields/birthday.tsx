import { Picker } from '@tarojs/components'
import dayjs from 'dayjs'
import { computed, defineComponent, ref } from 'vue'
import Wrap, { commonProfileWidgetPropsDefine } from '../wrap'

export default defineComponent({
  props: {
    ...commonProfileWidgetPropsDefine
  },
  setup(props) {
    const birthday = ref(props.value || '')
    const birthdayText = computed(() => {
      return dayjs(birthday.value).format('YYYY 年 MM 月 DD 日')
    })

    const today = dayjs().format('YYYY-MM-DD')

    const onChange = (e: any) => {
      birthday.value = e.detail.value
      props.onChange?.(birthday.value)
    }
    return () => {
      return (
        <Picker mode="date" start="1950-01-01" end={today} value={birthday.value} onChange={onChange}>
          <Wrap label="生日" required={props.required}>
            {birthday.value ? birthdayText.value : <div class="placeholder">未填写</div>}
          </Wrap>
        </Picker>
      )
    }
  }
})
