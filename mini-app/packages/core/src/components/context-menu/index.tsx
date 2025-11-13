import { defineComponent, reactive, computed, type PropType, type ComputedRef } from 'vue'
import './style.scss'
import { PREFIX_CLS } from '@anteng/config'
import { Icon } from '@anteng/ui'

export interface ContextMenuItem {
  /** 唯一的key */
  key: string
  /** 名称 */
  title: string | any
  hidden?: boolean
  /** 图标 */
  icon?: string
  iconfont?: string
  iconfontPrefix?: string
  /** 是否在前面添加分割线 */
  divider?: boolean
  /** 是否在底部添加分割线 */
  dividerBottom?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 快捷键命令 */
  command?: string | any
  /** 快捷键命令 MacOs 系统 */
  commandMac?: string | any
  /** 快捷键命令 Windows 系统 */
  commandWin?: string | any
  /** 处理函数，自动执行 */
  checked?: boolean | ComputedRef<boolean>
  handler?: () => void
  onHover?: () => void
  onBlur?: () => void
  /** 子菜单 */
  children?: ContextMenuItem[]
}

export interface ContextMenuConfig {
  x?: number
  y?: number
  list: ContextMenuItem[]
  onClose?: (...arg: any) => void
}

const MenuItem = defineComponent({
  name: 'LegoContextMenuItem',
  props: {
    item: {
      type: Object as PropType<ContextMenuItem>,
      required: true
    }
  },
  setup(props) {
    return () => {
      const item = props.item
      const hasChildren = item.children?.length! > 0
      const isDisabled = !!item.disabled

      const handleClick = (e: MouseEvent) => {
        item.handler?.()
      }

      const handleHover = () => {
        item.onHover?.()
      }
      const handleBlur = () => {
        item.onBlur?.()
      }

      const isChecked = typeof item.checked === 'boolean' ? item.checked : !!item.checked?.value

      return (
        <>
          {item.divider && <i class="context-menu__divider"></i>}
          <div class={['context-menu__item-wrapper clickable', isDisabled && '--disabled']}>
            <div
              class={['context-menu__item', isDisabled ? 'cursor-not-allowed' : 'clickable']}
              onMousedown={handleClick}
              onMouseenter={handleHover}
              onMouseleave={handleBlur}
            >
              <i class="context-menu__icon">
                {isChecked ? (
                  <iconpark-icon name="check-small"></iconpark-icon>
                ) : item.icon ? (
                  <iconpark-icon name={item.icon}></iconpark-icon>
                ) : item.iconfont ? (
                  <Icon prefix={item.iconfontPrefix} name={item.iconfont} />
                ) : null}
              </i>
              <span class="context-menu__title">{item.title}</span>

              {hasChildren ? (
                <iconpark-icon class="context-menu__arrow" name="drop-arrow"></iconpark-icon>
              ) : (
                <span class="context-menu__command">{item.command}</span>
              )}
            </div>
            {hasChildren && <ContextMenu config={{ x: 174, y: -6, list: item.children! }} />}
          </div>
          {item.dividerBottom && <i class="context-menu__divider"></i>}
        </>
      )
    }
  }
})

const ContextMenu = defineComponent({
  name: 'LegoContextMenu',
  props: {
    config: {
      type: Object as PropType<ContextMenuConfig>,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { slots, emit, expose }) {
    const state = reactive({
      x: props.config.x ?? 0,
      y: props.config.y ?? 0,
      centered: false
    })

    const style = computed(() => {
      return `
        top: ${state.y}px;
        left: ${state.x}px;
      `
    })

    return () => {
      return (
        <div class={`${PREFIX_CLS}-context-menu cursor-default`} style={style.value}>
          {props.config.list.map((item) => {
            return !item.hidden && <MenuItem item={item} />
          })}
        </div>
      )
    }
  }
})

export default ContextMenu
