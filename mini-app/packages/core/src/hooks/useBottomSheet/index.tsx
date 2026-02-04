import { renderAnyNode } from '@pkg/utils'
import './style.scss'
import { clamp, minBy, sortBy, sortedIndex } from 'lodash-es'
import { computed, defineComponent, nextTick, ref, watch } from 'vue'
import { ComputedValue, useAppStore, useComputedValue } from '@pkg/core'
import { storeToRefs } from 'pinia'
import { MovableArea, MovableView, ScrollView } from '@tarojs/components'

function findClosestNumber(array: number[], target: number) {
  return minBy(array, num => Math.abs(num - target))
}

function findSurroundingValues(arr: number[], v: number): [prev: number | null, next: number | null] {
  // 先对数组进行排序（如果输入的数组已经排序可以省略这一步）
  const sortedArr = sortBy(arr)

  // 使用 lodash 的 sortedIndex 方法找到 v 应该插入的位置
  const index = sortedIndex(sortedArr, v)

  // 获取前一个值和后一个值
  const prev = index > 0 ? sortedArr[index - 1] : null
  const next = index < sortedArr.length ? sortedArr[index] : null

  return [prev, next]
}

// 1. 跟随手势

export const useBottomSheet = (options?: {
  initialSize?: number
  /** 最大尺寸：相对于父容器，默认：1 */
  maxSize?: ComputedValue<number>
  /** 最小尺寸：相对于父容器，默认：0.25 */
  minSize?: ComputedValue<number>
  snapEnable?: ComputedValue<boolean>
  snapSizes?: ComputedValue<number[]>
  toolbarVisible?: ComputedValue<boolean>
  toolbarVisibleSizes?: ComputedValue<number[]>
  backdropFilterSize?: ComputedValue<number>
  onSizeChange?: (state: { pixels: number; size: number }) => void
  onTouchStart?: (e: TouchEvent) => void
  onTouchEnd?: (e: TouchEvent) => void
  onTouchMove?: (e: TouchEvent) => void
  navigator?: boolean
}) => {
  const appStore = useAppStore()
  const { systemInfo, commonNavigatorHeight } = storeToRefs(appStore)

  /** 最小尺寸：相对于父容器 */
  const minSize = useComputedValue(options?.minSize ?? 0.25, v => clamp(v, 0, 1))
  /** 最大尺寸：相对于父容器 */
  const maxSize = useComputedValue(options?.maxSize ?? 1, v => clamp(v, 0, 1))

  watch(
    () => [minSize.value, maxSize.value],
    () => {
      size.value = size.value > maxSize.value ? maxSize.value : size.value < minSize.value ? minSize.value : size.value
    }
  )

  /** 是否开启吸附 */
  const snapEnable = useComputedValue(options?.snapEnable ?? true)
  /** 吸附尺寸 */
  const snapSizes = useComputedValue(options?.snapSizes ?? [])
  /** toolbar 是否可见 */
  const toolbarVisible = useComputedValue(
    options?.toolbarVisible ?? true,
    v => v && size.value >= toolbarVisibleSizes.value[0] && size.value <= toolbarVisibleSizes.value[1]
  )

  /** toolbar 可见范围 */
  const toolbarVisibleSizes = useComputedValue(options?.toolbarVisibleSizes ?? [0.1, 0.9])

  /** 弥散模糊 */
  const backdropFilter = useComputedValue(options?.backdropFilterSize ?? 0.9, v => size.value >= v)

  /** 尺寸 */
  const size = ref(0)

  const vh = systemInfo.value.screenHeight - commonNavigatorHeight.value

  const offsetY = computed(() => {
    return (1 - size.value) * vh
  })

  const offsetYWithoutContent = computed(() => {
    return vh
  })

  const visible = ref(true)
  const setVisible = (v: boolean) => {
    return (visible.value = v)
  }

  /** 更新尺寸, [0, 1] */
  const updateSize = (newSize: number | string) => {
    if (typeof newSize === 'string') {
      if (newSize === 'max') {
        size.value = maxSize.value
      } else if (newSize === 'min') {
        size.value = minSize.value
      } else {
        console.error('bottomSheet.updateSize：非法字符串，仅支持 “min”、“max”')
      }
      return void 0
    }

    if (newSize > 1) {
      // 传入的值大于 1，视作具体像素值
      const _newSize = clamp(newSize / vh, minSize.value, maxSize.value)
      size.value = _newSize
      return void 0
    }

    const _newSize = clamp(newSize, minSize.value, maxSize.value)
    size.value = _newSize
    // useToast(size.value.toString())
    return void 0
  }

  updateSize(options?.initialSize ?? 0)

  /** 是否允许拖拽 */
  const dragEnable = ref(true)
  /** 开启拖拽 */
  const enableDrag = () => {
    dragEnable.value = true
  }
  /** 禁用拖拽 */
  const disableDrag = () => {
    dragEnable.value = false
  }

  const isLayerActive = ref(false)
  const isDragging = ref(false)

  let _scrollTop = 0
  const scrollTop = ref(0)
  const onScroll = e => {
    _scrollTop = e.detail.scrollTop
    // console.log(scrollTop)
  }
  const scrollToTop = () => {
    scrollTop.value = -Math.random() * 1
    nextTick(() => {
      scrollTop.value = 0
    })
  }

  let _offsetY = offsetY.value
  let startY = offsetY.value
  let endY = offsetY.value
  let startTs = 0
  let endTs = 0
  let dragTimer: NodeJS.Timeout
  const onDragging = e => {
    if (e.detail.source === '') {
      // 产生移动的原因为：设置 y 的值，不做处理
      return void 0
    }
    _offsetY = e.detail.y
    // clearTimeout(dragTimer)
    // dragTimer = setTimeout(() => handleDragEnd(_offsetY), 100)
  }

  const handleDragEnd = (y: number, speed?: number) => {
    if (!dragEnable.value) return void 0
    let s = clamp(1 - y / vh, minSize.value, maxSize.value)
    const os = s
    if (Math.abs(speed || 0) >= 0.8) {
      const [prev, next] = findSurroundingValues([minSize.value, ...snapSizes.value, maxSize.value], s)
      if (speed! > 0) {
        s = prev ?? s
      } else {
        s = next ?? s
      }
    } else {
      // 吸附最近的。
      s = findClosestNumber([minSize.value, ...snapSizes.value, maxSize.value], s) ?? s
    }
    // console.log(os, s, speed, _scrollTop)
    size.value = s + 0.00001
    clearTimeout(dragTimer)
    dragTimer = setTimeout(() => {
      size.value = s
      // useToast(`${(size.value * 100).toFixed(2)}, ${speed?.toFixed(2)}`)
    })
  }

  const onTouchStart = e => {
    clearTimeout(dragTimer)
    _offsetY = (1 - clamp(size.value, minSize.value, maxSize.value)) * vh
    startY = e.changedTouches[0].clientY
    startTs = +new Date()
  }
  const onTouchEnd = e => {
    endY = e.changedTouches[0].clientY
    endTs = +new Date()
    // 滑动距离至少超过 20px
    if (Math.abs(endY - startY) > 20) {
      handleDragEnd(_offsetY, _scrollTop > 10 ? 0 : (endY - startY) / (endTs - startTs))
    }
  }

  const BottomSheet = defineComponent({
    props: {
      toolbar: {},
      content: {},
      prepend: {}
    },
    setup(props, { slots }) {
      const appStore = useAppStore()
      const { commonNavigatorStyle } = storeToRefs(appStore)

      return () => {
        const Toolbar = props.toolbar ? renderAnyNode(props.toolbar) : null
        const Content = props.content ? renderAnyNode(props.content) : slots.default?.()
        const Prepend = props.prepend && size.value < 0.6 ? renderAnyNode(props.prepend) : null

        return (
          <MovableArea class={['use-bottom-sheet-area', !visible.value && 'hidden']}>
            {backdropFilter.value && <div class="use-bottom-sheet-backdrop-filter"></div>}
            {options?.navigator && (
              <div
                class={['use-bottom-sheet-navigator', size.value >= 1 && 'visible']}
                style={commonNavigatorStyle.value}
                onClick={() => {
                  updateSize('min')
                  scrollToTop()
                }}
              >
                <div class="icon"></div>
                <div class="text">返回地图页</div>
              </div>
            )}
            <MovableView
              class={[
                'use-bottom-sheet-view',
                size.value >= maxSize.value ? 'max' : size.value <= minSize.value ? 'min' : null,
                !Content && 'no-content'
              ]}
              x={0}
              y={Content ? offsetY.value : offsetYWithoutContent.value}
              direction="vertical"
              inertia={false} // 惯性滑动
              outOfBounds={true}
              scale={false}
              scaleMin={1}
              scaleMax={1}
              scaleValue={1}
              animation={true}
              damping={40}
              friction={5}
              disabled={!dragEnable.value}
              onChange={onDragging}
              onTouchstart={onTouchStart}
              onTouchend={onTouchEnd}
            >
              {Toolbar && (
                <div class={['use-bottom-sheet__toolbar', backdropFilter.value && 'hidden']}>
                  <div class="use-bottom-sheet__toolbar-content">{Toolbar}</div>
                </div>
              )}
              <div
                class={[
                  'use-bottom-sheet__drag-bar',
                  size.value >= maxSize.value ? 'down' : null,
                  !dragEnable.value && 'disabled'
                ]}
              ></div>
              {Prepend && <div class="use-bottom-sheet__prepend">{Prepend}</div>}
              <ScrollView
                class="use-bottom-sheet-scroll"
                scrollX={false}
                scrollY={size.value >= maxSize.value - 0.1}
                onScroll={onScroll}
                scrollTop={scrollTop.value}
              >
                {Content}
              </ScrollView>
            </MovableView>
          </MovableArea>
        )
      }
    }
  })
  return {
    BottomSheet,
    isBottomSheetActive: isLayerActive,
    size,
    updateSize,

    dragEnable,
    enableDrag,
    disableDrag,

    visible,
    setVisible
  }
}
