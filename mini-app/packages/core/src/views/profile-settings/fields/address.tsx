import { computed, defineComponent, ref } from 'vue'
import { useChooseAddress } from '../../../hooks'
import Wrap, { commonProfileWidgetPropsDefine } from '../wrap'
import { useUserStore } from '../../../stores'

export default defineComponent({
  props: {
    ...commonProfileWidgetPropsDefine
  },
  setup(props) {
    const address = ref(props.value)

    const addressText = computed(() => {
      if (!address.value) return ''
      const { province, city, district } = address.value
      return [province, city, district].join(' ')
    })

    const onSelect = () => {
      useChooseAddress({
        longitude: address.value?.longitude ?? useUserStore().userLocation?.longitude,
        latitude: address.value?.latitude ?? useUserStore().userLocation?.latitude,
        onSuccess: res => {
          address.value = res
          props.onChange?.(address.value)
        }
      })
    }

    return () => {
      return (
        <Wrap label="地区" required={props.required} onClick={onSelect}>
          <div>{address.value ? addressText.value : <div class="placeholder">未填写</div>}</div>
        </Wrap>
      )
    }
  }
})
