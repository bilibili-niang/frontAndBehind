import './index.scss'
import { defineComponent, h } from 'vue'
import type { PageComponent } from '../../../../../store'
import { useDecorationStore } from '../../../../../store'

export default defineComponent<{ item: PageComponent }>({
  name: 'PageComponentWrapper',
  props: {
    item: { type: Object as any, required: true }
  },
  setup(props) {
    const store = useDecorationStore()

    const toDeckComp = (c: PageComponent) => {
      const disabled = c.enabled === false
      return {
        id: c.id,
        key: c.key,
        name: c.name,
        version: '0.0.0',
        config: c.value,
        attrs: { ...(c.attrs || {}), inheritHidden: disabled },
        hidden: disabled,
        inheritHidden: disabled,
        locked: false
      } as any
    }

    const toContainerStyle = (c: PageComponent) => {
      const a = c.attrs || {}
      const fill = a.fill && (a.fill.enable === true || a.fill.enable === 1) ? a.fill.color : undefined
      const m = a.margin || {}
      const p = a.padding || {}
      const style: Record<string, any> = {}
      if (typeof a.opacity === 'number') {
        style.opacity = a.opacity <= 1 ? Math.max(a.opacity, 0) : Math.min(Math.max(a.opacity, 0), 100) / 100
      }
      if (typeof a.borderRadius === 'number') style.borderRadius = `${a.borderRadius}px`
      if (a.overflow) style.overflow = a.overflow
      if (fill) {
        style.background = fill
      } else if (a.background && a.backgroundEnable) {
        style.background = a.background
      }
      if (a.boxShadow) style.boxShadow = a.boxShadow
      const mTop = Array.isArray(m) ? m[0] : m.top
      const mRight = Array.isArray(m) ? m[1] : m.right
      const mBottom = Array.isArray(m) ? m[2] : m.bottom
      const mLeft = Array.isArray(m) ? m[3] : m.left
      const pTop = Array.isArray(p) ? p[0] : p.top
      const pRight = Array.isArray(p) ? p[1] : p.right
      const pBottom = Array.isArray(p) ? p[2] : p.bottom
      const pLeft = Array.isArray(p) ? p[3] : p.left
      if (typeof mTop === 'number') style.marginTop = `${mTop}px`
      if (typeof mRight === 'number') style.marginRight = `${mRight}px`
      if (typeof mBottom === 'number') style.marginBottom = `${mBottom}px`
      if (typeof mLeft === 'number') style.marginLeft = `${mLeft}px`
      if (typeof pTop === 'number') style.paddingTop = `${pTop}px`
      if (typeof pRight === 'number') style.paddingRight = `${pRight}px`
      if (typeof pBottom === 'number') style.paddingBottom = `${pBottom}px`
      if (typeof pLeft === 'number') style.paddingLeft = `${pLeft}px`
      // 强制容器宽度不超出可用行宽，考虑左右外边距占用的空间
      const hMargin = (typeof mLeft === 'number' ? mLeft : 0) + (typeof mRight === 'number' ? mRight : 0)
      if (hMargin > 0) {
        style.width = `calc(100% - ${hMargin}px)`
      } else {
        style.width = '100%'
      }
      style.maxWidth = '100%'
      style.boxSizing = 'border-box'
      style.overflowX = 'hidden'
      return style
    }

    return () => {
      const c = props.item
      // 禁用的组件不渲染
      if (c.enabled === false) return null
      return (
        <div
          class={[
            'preview-item',
            'cursor-pointer transition-shadow',
            store.activeId === c.id && 'active'
          ]}
          data-id={c.id}
          style={toContainerStyle(c)}
          onClick={() => {
            store.setActive(c.id)
          }}
        >
          {h(c.component, { comp: toDeckComp(c), config: c.value })}
        </div>
      )
    }
  }
})