import { computed, defineComponent, ref, watch } from 'vue'
import { useModal } from '../../../hooks'
import './gender.scss'
import { CheckedBorder } from '@pkg/ui'
import Taro from '@tarojs/taro'
import Wrap, { commonProfileWidgetPropsDefine } from '../wrap'

const genderOptions = [
  {
    class: 'male',
    value: 1,
    label: '男',
    icon: 'male',
    logo: 'https://dev-cdn.anteng.cn/upload/f20bcbfb1765ed19e79b0d0e7d3269d8.png'
  },
  {
    class: 'female',
    value: 0,
    label: '女',
    icon: 'female',
    logo: 'https://dev-cdn.anteng.cn/upload/eb36a09d3420d8ce2a9743a8afb3cedf.png'
  },
  {
    class: 'secret',
    value: undefined,
    label: '保密',
    logo: 'https://dev-cdn.anteng.cn/upload/0d761b06798212b23a7594bebc3b5f3b.png'
  }
]

export default defineComponent({
  props: {
    ...commonProfileWidgetPropsDefine
  },
  setup(props) {
    const gender = ref<number | undefined>(props.value)

    watch(
      () => props.value,
      () => {
        gender.value = props.value
      }
    )

    const genderText = computed(() => {
      return genderOptions.find(item => item.value === gender.value)?.label
    })

    const onSelect = () => {
      useChooseGender({
        gender: gender.value,
        onSuccess: v => {
          gender.value = v
          props.onChange?.(gender.value)
        }
      })
    }

    return () => {
      return (
        <Wrap label="性别" required={props.required} onClick={onSelect}>
          <div>{gender.value !== undefined ? genderText.value : <div class="placeholder">未填写</div>}</div>
        </Wrap>
      )
    }
  }
})

const useChooseGender = (options?: { gender?: number; onSuccess: (v: number | undefined) => void }) => {
  const gender = ref<number | undefined>(options?.gender)

  const onChange = (v: number | undefined) => {
    gender.value = v
    options?.onSuccess(gender.value)
    modal.close()
    Taro.vibrateShort({
      type: 'medium'
    })
  }

  const modal = useModal({
    title: '选择性别',
    height: 'auto',
    content: () => {
      return (
        <div class="use-choose-gender-modal">
          <div class="list">
            {genderOptions.map(item => {
              const active = gender.value === item.value
              return (
                <div
                  class={['item', item.class, active && 'active']}
                  onClick={() => {
                    onChange(item.value)
                  }}
                >
                  <CheckedBorder checked={active} />
                  <div
                    class="logo"
                    style={{
                      backgroundImage: `url(${item.logo})`
                    }}
                  ></div>
                  <div class="label">{item.label}</div>
                </div>
              )
            })}
          </div>
          <div class="tips">选择真实性别，内容推荐更精准</div>
        </div>
      )
    }
  })
}
