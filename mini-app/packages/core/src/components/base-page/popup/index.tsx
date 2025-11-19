import {
  defineComponent,
  markRaw,
  onBeforeUnmount,
  onUnmounted,
  PropType,
  provide,
  reactive,
  ref,
  watch,
  withModifiers
} from 'vue'
import './style.scss'
import { View } from '@tarojs/components'
import Taro, { nextTick } from '@tarojs/taro'
import { uuid } from '@anteng/utils'
import { withScope } from '../../../hooks'
import emitter from '../../../utils/emitter'

export interface PopupConfig {
  id?: string
  /** 内容 */
  content: any
  /** 出现位置 */
  placement?: 'top' | 'center' | 'bottom'
  /** 是否可以点击遮罩层关闭, 默认 true */
  maskCloseable?: boolean
  /** 是否显示遮罩层, 默认 true */
  maskVisible?: boolean
  /** 是否逆向动画，默认true，若为false则立即关闭 */
  backward?: boolean
  /** 禁止滚动穿透 */
  catchMove?: boolean
  /** z-index */
  zIndex?: number
  /** 关闭回调 */
  onClose?: () => void
  className?: string
  /** 是否过渡 */
  transition?: boolean
}

type PopupItem = PopupConfig & {
  id: string
  visible: boolean
  out: boolean
  mounted: boolean
  close: () => void
}

export type PopupFunc = {
  close: () => void
  update: (config: Partial<PopupConfig>) => void
}

const Popup = defineComponent({
  name: 'Popup',
  setup() {
    // const router = useRouter()
    // console.log(router)
    const list = ref<PopupItem[]>([])
    const tempList = ref<PopupItem[]>([])

    // 因为 数组的 新增、删除 会导致节点重绘，使得 scroll-view 的 scrollTop 变成初始值 0
    // 所以只有等所有的节点都删除后才能清空 list

    watch(
      () => tempList.value.length,
      () => {
        if (tempList.value.length === 0) {
          list.value = []
        }
      }
    )

    onUnmounted(() => {
      list.value.forEach(item => {
        item.onClose?.()
      })
    })

    const onTrigger = (config: PopupConfig, payload: PopupFunc) => {
      const { content } = config
      const item = reactive({
        id: config.id ?? uuid(),
        content: markRaw(content),
        visible: true,
        out: false,
        mounted: false,
        placement: config.placement ?? 'center',
        backward: config.backward,
        maskVisible: config.maskVisible ?? true,
        maskCloseable: config.maskCloseable ?? true,
        zIndex: config.zIndex ?? undefined,
        className: config.className,
        catchMove: config.catchMove ?? true,
        transition: config.transition ?? true,
        close: () => {
          config.onClose?.()
          if (item.backward === false) {
            item.visible = false
            item.out = false
            tempList.value.splice(tempList.value.indexOf(item), 1)
            return void 0
          }
          if (!item.out) {
            item.out = true
            setTimeout(() => {
              item.visible = false
              item.out = false
              tempList.value.splice(tempList.value.indexOf(item), 1)
            }, 300)
          }
        }
      })

      payload.close = item.close
      payload.update = newConfig => {
        Object.assign(item, newConfig)
      }

      list.value.push(item)
      tempList.value.push(item)
      nextTick(() => {
        setTimeout(() => {
          item.mounted = true
        }, 32)
      })
    }

    // 接收全局事件
    const eventName = withScope('popup')
    Taro.eventCenter.on(eventName, onTrigger)
    onBeforeUnmount(() => {
      Taro.eventCenter.off(eventName, onTrigger)
    })

    return () => {
      return (
        <div class="c_popup-list">
          {list.value.map(item => {
            return <PopupContent key={item.id} item={item} />
          })}
        </div>
      )
    }
  }
})

export default Popup

/** 通过 popupId 关闭弹窗 */
export const usePopupClose = (popupId: string) => {
  emitter.trigger(`${popupId}-close`)
}

const PopupContent = defineComponent({
  props: {
    item: {
      type: Object as PropType<PopupItem>,
      required: true
    }
  },
  setup(props) {
    const popupId = `popup-${props.item.id}`
    provide('popupId', popupId)

    emitter.once(`${popupId}-close`, () => {
      props.item.close()
    })

    onUnmounted(() => {
      emitter.off(popupId)
    })

    return () => {
      const item = props.item
      if (!item.visible)
        // ！！！这里结构不能动，且必须使用 <></> 包裹起来
        return (
          <>
            (<View key={item.id} style="display:none;"></View>)
          </>
        )

      return (
        // ！！！这里结构不能动，且必须使用 <></> 包裹起来
        // ！！！<>()</> 括号也不能去掉
        item.visible && (
          <>
            (
            <View
              key={item.id}
              style={{
                zIndex: item.zIndex
              }}
              class={[
                'c_popup',
                (!item.mounted || item.out) && 'c_popup--out',
                `c_popup--${item.placement}`,
                item.className,
                item.transition === false && 'no-transition'
              ]}
              catch-move={item.catchMove}
              onTap={item.catchMove ? (withModifiers(() => {}, ['stop', 'prevent']) as any) : undefined}
              onAnimationstart={() => {}} // 貌似没加这个属性，transition 在 IOS 端会卡顿/失效
              onTransitionend={() => {}}
              hoverClass="none"
            >
              <View
                class={['c_popup__overlay', item.maskVisible === false && 'c_popup__overlay--hidden']}
                onClick={item.maskCloseable === false ? undefined : item.close}
              ></View>
              <div class="c_popup__content">{<item.content />}</div>
            </View>
            )
          </>
        )
      )
    }
  }
})
