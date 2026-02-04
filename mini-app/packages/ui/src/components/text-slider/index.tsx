import { computed, defineComponent, onUnmounted, ref, watch } from 'vue'
import './style.scss'
import { uuid } from '@pkg/utils'

export default defineComponent({
  name: 'TextSlider',
  props: {
    list: {
      type: Array,
      required: true
    },
    interval: {
      type: Number,
      default: 3000
    },
    current: {
      type: Number,
      default: 0
    },
    autoplay: {
      type: Boolean,
      default: true
    }
  },
  emits: {
    change: (index: number) => true
  },
  setup(props, { emit }) {
    const listRef = computed(() => {
      return Array.isArray(props.list) ? props.list : []
    })
    const count = computed(() => listRef.value.length)

    const interval = computed(() => props.interval ?? 3000)

    const currentIndex = ref(props.current ?? 0)
    const actualIndex = ref(currentIndex.value)
    const circular = ref(false)
    const locked = ref(false)

    watch(
      () => props.current,
      () => {
        toggle(props.current ?? 0)
      }
    )

    const toggle = (index: number) => {
      const nextIndex = index % (listRef.value.length * 2)
      if (nextIndex === currentIndex.value) return void 0
      if (locked.value || circular.value) return void 0
      const isBack = nextIndex - currentIndex.value < 0
      const actualNextIndex = isBack ? (count.value + nextIndex) % count.value : nextIndex % count.value
      currentIndex.value = nextIndex
      actualIndex.value = actualNextIndex
      locked.value = true
      const isCircular = actualNextIndex !== nextIndex
      emit('change', isCircular ? actualNextIndex : currentIndex.value)
      setTimeout(
        () => {
          if (isCircular) {
            currentIndex.value = actualNextIndex
            circular.value = true
            setTimeout(() => {
              circular.value = false
              locked.value = false
            }, 64)
          } else {
            locked.value = false
          }
        },
        isCircular ? 332 : 400
      )
    }

    const next = () => {
      toggle(currentIndex.value + 1)
    }
    const previous = () => {
      toggle(currentIndex.value - 1)
    }

    const autoplayTimer = ref()
    const autoplay = () => {
      clearTimeout(autoplayTimer.value)
      if (!(listRef.value.length > 1)) {
        return void 0
      }
      autoplayTimer.value = setTimeout(() => {
        next()
        autoplay()
      }, interval.value)
    }

    onUnmounted(() => {
      // 清除定时器，防止内存泄漏
      clearTimeout(autoplayTimer.value)
    })

    watch(
      () => listRef.value.length,
      () => {
        if (!listRef.value[actualIndex.value]) {
          currentIndex.value = 0
          actualIndex.value = 0
        }
      },
      { immediate: true }
    )

    watch(
      () => props.autoplay,
      () => {
        clearTimeout(autoplayTimer.value)
        if (props.autoplay) {
          autoplay()
        }
      },
      { immediate: true }
    )

    const sliderStyle = computed(() => {
      if (circular.value) {
        return {
          transform:
            currentIndex.value === count.value - 1
              ? `translate3d(0, ${-count.value * 100 + 100}%, 0)`
              : 'translate3d(0, 0, 0)',
          transition: 'all 0s'
        }
      }
      return {
        transform: `translate3d(0, ${-currentIndex.value * 100}%, 0)`
      }
    })

    const SlideItem = (content: any, index: number) => {
      return (
        <div
          class="n-text-slider-item"
          key={uuid()}
          style={{
            transform: `translate3d(0, ${index * 100}%, 0)`
          }}
        >
          {content}
        </div>
      )
    }

    const sliders = computed(() => {
      const list = listRef.value
      return [SlideItem(list[count.value - 1], -1), list.map(SlideItem), SlideItem(list[0], count.value)]
    })

    return () => {
      return (
        <div class="n-text-slider-wrapper">
          <div class="n-text-slider" style={sliderStyle.value}>
            {sliders.value}
          </div>
        </div>
      )
    }
  }
})
