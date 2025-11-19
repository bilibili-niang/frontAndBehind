import { computed, defineComponent, ref, watch } from 'vue'
import './style.scss'
import Spin from '../spin'
import { clamp } from 'lodash-es'
import { Image } from '@anteng/deck'

/** 通用启动页组件 */
export default defineComponent({
  name: 'c_launch-page',
  props: {
    page: {
      type: Object,
      required: true
    },
    ready: {
      type: Boolean,
      required: true
    }
  },
  emits: ['finish'],
  setup(props, { slots, emit }) {
    const page = computed(() => {
      return props.page?.decorate?.payload?.page
    })

    const seconds = ref<number>(3)

    let timer: NodeJS.Timeout
    const countdown = () => {
      timer = setTimeout(() => {
        seconds.value--
        if (seconds.value <= 0) {
          emit('finish')
        } else {
          countdown()
        }
      }, 1000)
    }

    const skip = () => {
      clearTimeout(timer)
      emit('finish')
    }

    const countdownEnable = computed(() => {
      return page.value?.countdownEnable ?? false
    })

    watch(
      () => [page.value, countdownEnable.value, props.ready],
      () => {
        if (!props.ready) {
          return void 0
        }
        seconds.value = clamp(Math.round(page.value?.countdown ?? 3), 3, 12)
        if (countdownEnable.value) {
          // 防止服务器页面配置更新时多次触发
          clearTimeout(timer)
          countdown()
        } else {
          emit('finish')
        }
      },
      { immediate: true }
    )

    const intercept = (fn: () => void) => {
      emit('finish', fn)
    }

    return () => {
      if (!page.value) {
        return null
      }
      return (
        <div
          class="p_launch"
          style={{
            backgroundColor: page.value.backgroundColor
          }}
        >
          <div
            class="p_launch-bg"
            style={{
              justifyContent:
                page.value.backgroundPosition === 'top'
                  ? 'flex-start'
                  : page.value.backgroundPosition === 'bottom'
                  ? 'flex-end'
                  : 'center'
            }}
          >
            <div class="p_launch-bg-image" />
            <Image class="p_launch-bg-image" config={{ image: page.value.backgroundImage }} intercept={intercept} />
          </div>
          {countdownEnable.value && (
            <div class="p_launch-skip clickable" onClick={skip}>
              <div class="count-down">{seconds.value}s</div>
              <div class="text">跳过</div>
            </div>
          )}
          {slots.default?.()}
        </div>
      )
      return (
        <div class="c_launch-page">
          <div class="c_launch-page__spin">
            <Spin />
          </div>
          <div class="c_launch-page__logo">{slots.logo?.()}</div>
        </div>
      )
    }
  }
})
