import { computed, defineComponent, PropType, withModifiers } from 'vue'
import './style.scss'
import Icon from '../icon'
import { renderAnyNode } from '@pkg/utils'
import { useCopyText } from '@pkg/core'

type InfoListItem = {
  /** 标签 */
  label?: any
  /** 帮助，在 label 后显示问号按钮 */
  helper?: () => void
  value?: any
  /** 是否显示右箭头 */
  arrow?: boolean
  /** 前节点插槽 */
  prepend?: any
  /** 后节点插槽 */
  append?: any
  /** 自定义渲染，使用后其余属性将无效 */
  customRender?: any
  /** 节点点击 */
  onClick?: () => void
  /** value 点击 */
  onValueClick?: () => void
  copy?: string
  hidden?: Boolean
}

export default defineComponent({
  name: 'c_info-list',
  props: {
    align: {
      type: String as PropType<'left' | 'right'>,
      default: 'right'
    },
    customTitle: {},
    title: {},
    titleAction: String,
    onTitleActionClick: {
      type: Function as PropType<() => void>
    },
    list: {
      type: Array as PropType<InfoListItem[]>,
      required: true
    },
    pure: Boolean
  },
  setup(props) {
    const list = computed(() => (props.list || []).filter(item => !item.hidden))

    const Title: any = () => {
      if (props.customTitle) {
        return renderAnyNode(props.customTitle)
      }
      if (props.title) {
        return (
          <div class="c_info-list__title">
            {renderAnyNode(props.title)}
            {props.titleAction && (
              <div class="c_info-list__title-action" onClick={props.onTitleActionClick}>
                {props.titleAction}
                <Icon name="right" />
              </div>
            )}
          </div>
        )
      }
      return null
    }

    return () => {
      return (
        <div class={['c_info-list', props.pure && 'c_info-list--pure', `c_info-list--${props.align}`]}>
          <Title />
          {list.value.map(item => {
            if (item.customRender) {
              try {
                const Comp = renderAnyNode(item.customRender)
                return Comp && <div class="c_info-list__item">{Comp}</div>
              } catch {}
            }
            return (
              <div class="c_info-list__item" onClick={item.onClick}>
                {item.prepend && <div class="c_info-list__prepend">{renderAnyNode(item.prepend)}</div>}
                <div class="c_info-list__main">
                  <div class="c_info-list__label">
                    {item.label}{' '}
                    {item.helper && (
                      <Icon class="c_info-list__helper" name="help" onClick={withModifiers(item.helper, ['stop'])} />
                    )}
                  </div>
                  <div
                    class="c_info-list__value"
                    onClick={item.onValueClick ? withModifiers(item.onValueClick, ['stop']) : undefined}
                  >
                    {renderAnyNode(item.value)}
                  </div>
                  {item.arrow && <Icon class="c_info-list__arrow" name="right" />}
                  {item.copy && (
                    <Icon
                      class="c_info-list__copy"
                      name="copy"
                      onClick={withModifiers(() => {
                        useCopyText(item.copy)
                      }, ['stop'])}
                    />
                  )}
                </div>
                {item.append && <div class="c_info-list__append">{renderAnyNode(item.append)}</div>}
              </div>
            )
          })}
        </div>
      )
    }
  }
})
