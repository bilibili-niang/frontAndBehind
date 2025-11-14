import { useToast } from '@anteng/core'
import { computed, defineComponent, PropType, ref, watch } from 'vue'
import './style.scss'

export default defineComponent({
  name: 'c_count-stepper',
  props: {
    value: {
      type: Number,
      required: true
    },
    min: {
      type: Number,
      default: 1
    },
    max: {
      type: Number
    },
    minMessage: {
      type: String
    },
    maxMessage: {
      type: String
    },
    size: {
      type: String as PropType<'small' | 'normal'>,
      default: 'normal'
    }
  },
  emits: {
    change: (value: number) => true
  },
  setup(props, { emit }) {
    const count = ref(props.value ?? 0)
    const minCount = computed(() => (props.min > 1 ? props.min : 1) || 1)
    const maxCount = computed(() => {
      if (props.max && props.max < minCount.value) return minCount.value
      return props.max ?? null
    })

    watch(
      () => props.value,
      () => {
        count.value = props.value
      }
    )

    const triggerChange = () => {
      emit('change', count.value)
    }

    const onDecrease = () => {
      const v = count.value - 1
      if (v < minCount.value) {
        props.minMessage && useToast(props.minMessage)
        return void 0
      }
      count.value = v
      triggerChange()
    }

    const onIncrease = () => {
      const v = count.value + 1
      if (maxCount.value && v > maxCount.value) {
        props.maxMessage && useToast(props.maxMessage)
        return void 0
      }
      count.value = v
      triggerChange()
    }

    return () => {
      return (
        <div class={['c_count-stepper', `c_count-stepper--${props.size}`]}>
          <div class={['decrease', count.value <= minCount.value && 'disabled']} onClick={onDecrease}>
            －
          </div>
          <div class="count">{count.value}</div>
          <div class={['increase', maxCount.value && count.value >= maxCount.value && 'disabled']} onClick={onIncrease}>
            ＋
          </div>
        </div>
      )
    }
  }
})
