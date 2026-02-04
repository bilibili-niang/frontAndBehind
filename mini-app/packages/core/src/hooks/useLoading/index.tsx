import usePopup from '../usePopup'
import { defineComponent, onUnmounted, PropType, ref } from 'vue'
import Spin from '../../components/spin'
import './style.scss'
import { Icon } from '@pkg/ui'
import { getPageKey } from '../../utils/router'

const loadingStack: Record<
  string,
  {
    count: number
    close: () => void
  }
> = {}

interface IUseLoadingOptions {
  /** 显示遮罩层，默认false */
  maskVisible?: boolean
  /** 显示Toast层，默认true */
  toastVisible?: boolean
  /**
   * 超时时间，单位 ms， 默认 5000。
   * 超过该时间，运行用户点击关闭按钮关闭loading，且将触发 onCancel 事件
   */
  timeout?: number
  /** 显示文本，默认 “请稍候片刻”，如不希望展示，可以传入 null、空字符串 */
  text?: string | null

  fadeOut?: boolean
}

/** 展示加载态，可累加调用， */
export const useLoading = (options?: IUseLoadingOptions) => {
  const pageKey = getPageKey()
  if (loadingStack[pageKey]) {
    loadingStack[pageKey].count++
    return loadingStack[pageKey].close
  }
  const popup = usePopup({
    content: (
      <GlobalLoading
        toastVisible={(options?.maskVisible || options?.toastVisible) ?? true}
        timeout={options?.timeout}
        text={options?.text}
        onClose={() => {
          // 强制关闭
          delete loadingStack[pageKey]
          popup.close()
        }}
      />
    ),
    placement: 'center',
    maskCloseable: false,
    maskVisible: options?.maskVisible ?? false,
    backward: options?.fadeOut ?? false,
    zIndex: 9999
  })
  loadingStack[pageKey] = {
    count: 1,
    close: () => {
      popup.close()
      delete loadingStack[pageKey]
    }
  }
  return loadingStack[pageKey].close
}

/** 关闭加载态，注意：将会立即关闭，如果需要处理多个异步任务，请使用 useLoading 返回的 loadingEnd */
export const useLoadingEnd = () => {
  // const pageKey = getPageKey()
  // const target = loadingStack[pageKey]
  // if (!target) return void 0
  // target.count--
  // if (!(target.count >= 1)) {
  //   target.close()
  // }
  for (const key in loadingStack) {
    if (loadingStack.hasOwnProperty(key)) {
      const { close } = loadingStack[key]
      close() // 执行 close 方法
      delete loadingStack[key] // 删除对应的记录
    }
  }
}

export const GlobalLoading = defineComponent({
  name: 'GlobalLoading',
  props: {
    toastVisible: {
      type: Boolean,
      default: true
    },
    timeout: {
      type: Number,
      default: 5000
    },
    text: {
      type: String as PropType<string | null>,
      default: '请稍候片刻'
    }
  },
  emits: {
    close: () => true
  },
  setup(props, { emit }) {
    const closeable = ref(false)
    const timer = setTimeout(() => {
      closeable.value = true
    }, props.timeout)
    onUnmounted(() => {
      clearTimeout(timer)
    })

    const close = () => {
      emit('close')
    }

    return () => {
      return (
        <div class={['anteng-global-loading', (props.toastVisible || closeable.value) && 'toast-visible']}>
          <Spin primary={props.toastVisible || closeable.value} />
          <div class="anteng-global-loading__tip">{props.text}</div>
          {closeable.value && <Icon class="anteng-global-loading__close" name="close" onClick={close} />}
        </div>
      )
    }
  }
})
