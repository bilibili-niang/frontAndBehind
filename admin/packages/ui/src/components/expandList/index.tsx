import './style.scss'
import { defineComponent, Transition } from 'vue'
import Icon from '../icon'
import Button from '../button'
import gsap from 'gsap'

export default defineComponent({
  name: 'UiExpandList',
  props: {
    title: { type: String, required: true },
    icon: { type: String, default: '' },
    count: { type: Number, default: 0 },
    expanded: { type: Boolean, default: false },
    addText: { type: String, default: '添加' },
    items: { type: Array as () => Array<{ id: string, title: string, sub?: string }>, default: () => [] },
    onAdd: { type: Function as any, default: undefined },
    onToggle: { type: Function as any, default: undefined },
    onItemClick: { type: Function as any, default: undefined }
  },
  setup(props) {
    const toggle = (e?: any) => {
      props.onToggle?.()
    }
    const add = (e: any) => {
      e?.stopPropagation?.()
      props.onAdd?.()
    }
    const handleClickItem = (id: string) => {
      props.onItemClick?.(id)
    }
    const onEnter = (el: Element, done: () => void) => {
      gsap.set(el, { height: 0, opacity: 0 })
      gsap.to(el, {
        height: 'auto',
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: done
      })
    }
    const onLeave = (el: Element, done: () => void) => {
      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: done
      })
    }
    return () => (
      <div class="ui-expand-list">
        <div class="ui-expand-list__header" onClick={toggle}>
          <div class="prefix">
            {props.icon && <span class="prefix-icon"><Icon name={props.icon as any} /></span>}
            <span class="title">{props.title}</span>
          </div>
          <div class="suffix">
            {props.count > 0 && <span class="suffix-badge">{props.count}</span>}
            <span class="add-action" onClick={add}>+ {props.addText}</span>
          </div>
          {/* 预览条：始终渲染，通过 CSS 类控制显隐，实现平滑过渡 */}
          {props.count > 0 && (
            <div class={`ui-expand-list__preview ${props.expanded ? 'is-expanded' : ''}`} />
          )}
        </div>
        <Transition
          onEnter={onEnter}
          onLeave={onLeave}
          css={false}
        >
          {props.expanded ? (
            <div class="ui-expand-list__body">
              {props.items.map((it) => (
                <div class="child-card" key={it.id} onClick={(e) => { e.stopPropagation(); handleClickItem(it.id) }}>
                  <div class="child-title">{it.title || '未命名'}</div>
                  {it.sub && <div class="child-sub">{it.sub}</div>}
                </div>
              ))}
            </div>
          ) : null}
        </Transition>
      </div>
    )
  }
})
