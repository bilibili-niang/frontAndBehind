import { computed, defineComponent, ref, watch } from 'vue'
import './style.scss'
import { uuid } from '@anteng/utils'

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
    }
  },
  setup(props) {
    const listRef = computed(() => {
      return Array.isArray(props.list) ? props.list : []
    })
    const count = computed(() => listRef.value.length)

    const interval = computed(() => props.interval ?? 3000)

    const currentIndex = ref(0)
    const actualIndex = ref(0)
    const circular = ref(false)
    const locked = ref(false)
    const toggle = (nextIndex: number) => {
      if (locked.value) {
        return false
      }
      const isBack = nextIndex - currentIndex.value < 0
      const actualNextIndex = isBack ? (count.value + nextIndex) % count.value : nextIndex % count.value
      currentIndex.value = nextIndex
      actualIndex.value = actualNextIndex
      locked.value = true
      const isCircular = actualNextIndex !== nextIndex
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
    const last = () => {
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

    watch(
      () => listRef.value.length,
      () => {
        if (!listRef.value[actualIndex.value]) {
          currentIndex.value = 0
          actualIndex.value = 0
        }
        autoplay()
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
