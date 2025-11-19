import { EmptyStatus, onPageHide, onPageShow, usePopup } from '@anteng/core'
import { computed, defineComponent, inject, onMounted, PropType, ref, watch, withModifiers } from 'vue'
import './style.scss'
import { withUnit } from '@anteng/utils'
import Image from '../image'
import { Icon } from '@anteng/ui'
import Taro from '@tarojs/taro'
import dayjs from 'dayjs'
import { clamp } from 'lodash-es'

export default defineComponent({
  name: 'd_image-modal',
  props: {
    comp: {
      type: Object
    },
    config: {
      type: Object as PropType<ImageModalConfig>,
      required: true
    }
  },
  setup(props) {
    const basePageKey = inject('basePageKey') as string

    const image = props.config?.image?.image?.url

    onMounted(() => {
      if (image) {
        useImageModal({ ...props.config, id: props.comp?.id }, basePageKey)
      }
    })

    onPageShow(() => {
      // 页面回来时「立即」重新开始属于当前页面的弹窗继续播放
      play(basePageKey, true)
    })

    onPageHide(() => {
      // 页面离开时阻止属于当前页面的弹窗继续播放
      play(undefined)
    })

    // if (process.env.NODE_ENV === 'development') {
    //   return () => (
    //     <div
    //       title={`图片弹窗 - ${props.comp?.id}`}
    //       onClick={() => {
    //         useImageModal({ ...props.config, id: props.comp?.id })
    //       }}
    //     >
    //       点击弹窗
    //     </div>
    //   )
    // }

    return () => {
      // 无需渲染
      return (
        <div title={`图片弹窗 - ${props.comp?.id}`} style="display:none;">
          {/* 放在这里，可以预先加载图片 */}
          <img style="display:none;" src={image} />
        </div>
      )
    }
  }
})

// TODO 如果以后新增有其他类型弹窗呢？也不可同时弹出来！

type ImageModalConfig = {
  $basePageKey?: string
  id: string
  image: any
  style: {
    backgroundColor: string
    backgroundBlur: number
    padding: {
      left: number
      right: number
    }
  }
  rule: {
    mode: 'always' | 'once' | 'interval'
    maxCountEnable: boolean
    maxCount: number
    alwaysLimit: boolean
    interval: {
      value: number
      unit: 'm' | 'h' | 'd'
      clearDay: boolean
    }
    autoCloseEnable: boolean
    autoClose: {
      interval: number
    }
    afterClick: 'close' | 'maintain'
    maskClosable: boolean
  }
}

// 1. 先检测显示与否，过滤出可显示队列
// 2. 将可显示队列出栈，加载图片完成 => 显示
// 3. 当前弹窗关闭之后 => 重复执行步骤 2

const queue: ImageModalConfig[] = []

// 仅在当前启动时的记录缓存，浏览器刷新、小程序重新载入后将清空
const cacheFrequency: {
  [key: string]: ImageModalFrequency | undefined
} = {}

type ImageModalFrequency = {
  count: number
  lastTime: string
}

const useImageModal = (config: ImageModalConfig, basePageKey?: string) => {
  // console.log('弹窗准备：', config)

  const map: {
    [key: string]: ImageModalFrequency | undefined
  } = Taro.getStorageSync('d_image-modal') || {}

  const history = map[config.id]

  const { mode, maxCountEnable, maxCount, interval, alwaysLimit } = config.rule

  if (mode === 'once' && history) {
    // 已经显示过了（有显示记录），不再显示
    return false
  }

  if (mode === 'always' && alwaysLimit && cacheFrequency[config.id]) {
    // 每次，但仅限于应用启动之后的首次
    return false
  }

  if (maxCountEnable && history?.count! >= maxCount) {
    // 已经达到最多显示次数，不再显示
    return false
  }

  if (mode === 'interval' && history) {
    const { value, unit, clearDay } = interval

    const unitMap = {
      m: 'm',
      h: 'h',
      d: 'd'
    }
    const nextTime = dayjs(history.lastTime).add(value, unitMap[unit] as any)
    const now = dayjs()

    // console.log(nextTime.format(), now.format())

    if (now.isAfter(nextTime)) {
      // 已经超过下一次显示的时间，显示
    } else if (unit === 'd' && clearDay) {
      // 在下一次之前，但是开启了 0 点刷新机制
      // 过 0 点刷新 = 距离下一次时间小于 1 天 && 上一次不是今天

      const lastTime = dayjs(history.lastTime)

      // 间隔不小于 1 天，不显示
      if (now.diff(nextTime, 'day') >= 1) {
        return false
      }

      // 同一天，不显示
      if (lastTime.isSame(now, 'day')) {
        return false
      }
    } else {
      // 在下一次之前，不显示
      return false
    }
  }

  if (config.id && queue.some(item => item.id === config.id)) {
    // 队列中已存在，防止重复显示
    return false
  }

  // 入队
  queue.push({ ...config, $basePageKey: basePageKey })

  // 播放
  play(basePageKey)

  return true
}

let timer: NodeJS.Timeout
const play = (basePageKey?: string, immediate = false) => {
  clearTimeout(timer)

  const currentQueue = queue.filter(item => item.$basePageKey === basePageKey)

  // console.log('本页面队列', currentQueue)

  timer = setTimeout(
    () => {
      const item = currentQueue.shift()

      if (item) {
        queue.splice(queue.indexOf(item), 1)

        openImageModal(item, {
          onClose: () => {
            // 保存历史记录
            storeHistory(item)

            // 继续播放下一个弹窗
            play(basePageKey)
          }
        })
      }
    },
    immediate ? 0 : 320
  )
}

/** 保存历史记录 */
const storeHistory = (item: ImageModalConfig) => {
  if (!item.id) return void 0
  try {
    // console.log('保存弹窗记录：', item)
    const map: {
      [key: string]: ImageModalFrequency | undefined
    } = Taro.getStorageSync('d_image-modal') || {}

    map[item.id] = {
      count: (map[item.id]?.count ?? 0) + 1,
      lastTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
    // 内存缓存
    cacheFrequency[item.id] = map[item.id]
    // 本地缓存
    Taro.setStorageSync('d_image-modal', map)
  } catch (err) {
    console.error('保存弹窗记录失败：', err)
  }
}

export const openImageModal = (
  config: ImageModalConfig,
  options?: {
    onClose?: () => void
  }
) => {
  const style = computed(() => {
    const { backgroundColor, backgroundBlur, padding } = config?.style || {}
    return {
      '--modal-bg': backgroundColor,
      '--modal-bg-blur': `${backgroundBlur}px`,
      '--modal-pdl': withUnit(padding?.left),
      '--modal-pdr': withUnit(padding?.right)
    }
  })

  const image = computed<any>(() => config.image)

  const close = () => {
    cancelCountdown()
    modal.close()
  }

  const { autoCloseEnable, autoClose, maskClosable, afterClick } = config?.rule || {}

  const seconds = ref(autoClose?.interval ?? 10)
  let countdownTimer: NodeJS.Timeout
  const cancelCountdown = () => {
    clearTimeout(countdownTimer)
  }

  const maintain = ref(false)
  watch(
    () => maintain.value,
    () => {
      if (maintain.value) {
        cancelCountdown()
      }
    }
  )

  const countdown = () => {
    clearTimeout(countdownTimer)
    if (autoCloseEnable && !maintain.value) {
      countdownTimer = setTimeout(() => {
        seconds.value = clamp(seconds.value - 1, 0, seconds.value)
        if (seconds.value > 0) {
          countdown()
        } else {
          // 关闭弹窗
          close()
        }
      }, 1000)
    }
  }

  // 立即倒计时
  countdown()

  /** 点击触发后判断是「立即关闭」或「维持显示」 */
  const onActionClick = () => {
    if (afterClick === 'close' && !maintain.value) {
      close()
    } else {
      maintain.value = true
    }
  }

  // 支持长按的情况下，只要手指触摸到图片就立即「维持显示」
  const onTouchstart = () => {
    if (image.value?.image?.type === 'single' && image.value.longPress) {
      maintain.value = true
    }
  }

  const modal = usePopup({
    placement: 'center',
    maskVisible: false,
    maskCloseable: false,
    transition: false,
    onClose: () => {
      cancelCountdown()
      options?.onClose?.()
    },
    content: () => {
      return (
        <div class="d_image-modal" style={style.value}>
          <div
            class="d_image-modal__overlay"
            onClick={withModifiers(() => {
              if (maskClosable) {
                close()
              }
            }, ['stop'])}
          ></div>
          <div
            class={['d_image-modal__content', autoCloseEnable && maintain.value && 'maintain']}
            // onClick={() => {
            //   maintain.value = true
            // }}
          >
            <div class="d_image-modal__image" onTouchstart={onTouchstart}>
              {image.value?.image?.url ? (
                // @ts-ignore
                <Image config={image.value} onAction={onActionClick} />
              ) : (
                <div class="d_image-modal__image-empty">
                  <EmptyStatus description="请配置图片" />
                </div>
              )}
            </div>
            {autoCloseEnable && <div class="d_image-modal__countdown">{seconds.value}Ｓ后自动关闭</div>}
            <div class="d_image-modal__close clickable" onClick={withModifiers(close, ['stop'])}>
              <Icon name="close-round" />
            </div>
          </div>
        </div>
      )
    }
  })
}
