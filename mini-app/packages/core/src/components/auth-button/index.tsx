import { defineComponent, PropType } from 'vue'
import { Button } from '@anteng/ui'
import { withPermission } from '../../stores/permission'

export interface AuthButtonProps {
  /** 权限代码，支持字符串、数组或对象形式 */
  perm?: string | string[] | { and?: string[]; or?: string[] }
  /** 无权限时的处理方式：hide-隐藏，disable-禁用 */
  hiddenMode?: 'hide' | 'disable'
  /** 按钮文案，用于权限点收集 */
  label?: string
  /** 按钮所属页面路径，用于权限点收集 */
  pagePath?: string
}

/**
 * 带权限控制的按钮组件
 * 基于现有的 withPermission 和 usePermissionStore 实现
 * 支持权限点自动收集用于后端同步
 */
const _AuthButton = defineComponent({
  name: 'AuthButton',
  props: {
    perm: {
      type: [String, Array, Object] as PropType<AuthButtonProps['perm']>,
      required: true
    },
    hiddenMode: {
      type: String as PropType<AuthButtonProps['hiddenMode']>,
      default: 'hide'
    },
    label: {
      type: String
    },
    pagePath: {
      type: String
    }
  },
  setup(props, { slots, attrs }) {
    // 收集权限点信息（开发模式下）
    if (import.meta.env.DEV && props.perm) {
      const permissionInfo = {
        perm: props.perm,
        label: props.label || attrs.children || '未知按钮',
        pagePath: props.pagePath || window.location.pathname,
        timestamp: Date.now()
      }

      // 存储到全局对象供扫描脚本使用
      if (!window.__null_PERMISSIONS__) {
        window.__null_PERMISSIONS__ = []
      }
      window.__null_PERMISSIONS__.push(permissionInfo)
    }

    return () => {
      // 是否全局关闭按钮权限控制
      if (import.meta.env.VITE_APP_USE_BUTTON_PERMISSION == 'false') {
        console.log('不使用按钮权限控制')
        return <Button {...props} {...attrs} v-slots={slots} />
      }

      // 有权限：正常渲染按钮
      const allowed = withPermission(props.perm!, () => <Button {...attrs} v-slots={slots} />)
      if (allowed) return allowed

      // 无权限：按 props.hiddenMode 决定隐藏或禁用，默认隐藏
      if (props.hiddenMode === 'disable') {
        // 显式屏蔽点击，避免某些场景下事件仍被触发（如父级监听或库内部行为）
        const disabledAttrs = { ...(attrs as any), onClick: undefined, title: (attrs as any)?.title ?? '无权限' }
        const stop = (e: Event) => {
          e.preventDefault?.()
          e.stopPropagation?.()
          // @ts-ignore
          e.stopImmediatePropagation?.()
          return false
        }
        return (
          <span onClick={stop} onMousedown={stop} onDblclick={stop} onKeydown={stop} style="display:inline-block;">
            <Button {...(disabledAttrs as any)} disabled v-slots={slots} />
          </span>
        )
      }
      return null
    }
  }
})

// 允许在 TSX 中传入任意 Button 支持的属性（如 type/size/danger 等）
// 不改变运行时，仅放宽类型检查
export const AuthButton = _AuthButton as unknown as new () => { $props: any }

export default AuthButton

// 声明全局类型
declare global {
  interface Window {
    __null_PERMISSIONS__?: Array<{
      perm: string | string[] | { and?: string[]; or?: string[] }
      label: string
      pagePath: string
      timestamp: number
    }>
  }
}
