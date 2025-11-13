import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import './code.scss'

export default defineComponent({
  name: '',
  props: {
    value: {
      type: String,
      required: true
    }
  },
  emits: {
    change: (value: string) => true
  },
  setup(props, { emit }) {
    const isFocused = ref(true)
    const inputRef = ref()
    const inputValue = ref(props.value ?? '')
    let lastInputValue = ''

    watch(
      () => props.value,
      () => {
        inputValue.value = props.value
      }
    )

    const COUNT = 6

    const list = computed(() => {
      return inputValue.value
        .slice(0, COUNT)
        .split('')
        .concat(new Array(COUNT).fill(''))
        .slice(0, COUNT)
    })

    const onItemClick = () => {
      focus()
      inputValue.value = list.value.join('')
      setTimeout(() => {
        isFocused.value = true
      })
    }

    const focus = () => {
      isFocused.value = true
      inputRef.value.focus?.()
    }

    onMounted(() => {
      focus()
    })

    const onInput = (e: any) => {
      const value = e.target?.value ?? ''
      lastInputValue = inputValue.value
      if (/^\d{0,6}$/.test(value)) {
        inputValue.value = value
      } else {
        inputValue.value = ''
      }
      emit('change', inputValue.value)
    }
    const onBlur = () => {
      isFocused.value = false
    }
    return () => {
      return (
        <div class="c_auth-code">
          {list.value.map((item, index) => {
            const isItemFocused =
              isFocused.value &&
              (inputValue.value.length === index ||
                (inputValue.value.length >= COUNT ? COUNT - 1 : inputValue.value.length) === index)
            return (
              <div
                class={['c_auth-code__item number-font', isItemFocused && 'focus']}
                key={index}
                onClick={onItemClick}
              >
                {item}
              </div>
            )
          })}

          <input
            ref={inputRef}
            class="c_auth-code__input"
            type="digit"
            value={inputValue.value}
            maxlength={COUNT}
            adjust-position={false}
            onInput={onInput}
            onBlur={onBlur}
          />
        </div>
      )
    }
  }
})
