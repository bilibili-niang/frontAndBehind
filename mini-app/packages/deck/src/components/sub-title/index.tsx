import { PropType, defineComponent } from 'vue'
import './style.scss'
import { DeckComponentConfig } from '../types'

type SubTitleConfig = {
  title: {
    text?: string
    color?: string
    fontSize?: number | string
  }
  subtitle?: {
    enable?: boolean
    text?: string
    color?: string
    fontSize?: number | string
    placement?: 'bottom' | 'left' | 'right' | 'top'
  }
}

export default defineComponent({
  name: 'c_sub-title',
  props: {
    config: {
      type: Object as PropType<DeckComponentConfig<SubTitleConfig>>,
      required: true
    }
  },
  setup(props) {
    return () => {
      const titleCfg = props?.config?.title || {}
      const subCfg = props?.config?.subtitle || {}

      const showSub = subCfg?.enable ?? true
      const align = (props?.config as any)?.align || 'center'
      const placement = subCfg?.placement || 'bottom'

      const titleText = titleCfg?.text || '主标题'
      const subText = subCfg?.text || '副标题'

      const titleStyle: any = {
        color: titleCfg?.color || '#1f1f1f',
        fontSize:
          typeof titleCfg?.fontSize === 'number' ? `${titleCfg.fontSize}px` : titleCfg?.fontSize || '18px'
      }
      const subStyle: any = {
        color: subCfg?.color || '#999999',
        fontSize: typeof subCfg?.fontSize === 'number' ? `${subCfg.fontSize}px` : subCfg?.fontSize || '12px'
      }

      const TitleSpan = <span class="st-title" style={titleStyle}>{titleText}</span>
      const SubSpan = showSub ? (
        <span class="st-subtitle" style={subStyle}>
          {subText}
        </span>
      ) : null

      if (placement === 'left') {
        return <div class={['c_sub-title', '--row', '--left', `align-${align}`].join(' ')}>{SubSpan}{TitleSpan}</div>
      }
      if (placement === 'right') {
        return <div class={['c_sub-title', '--row', '--right', `align-${align}`].join(' ')}>{TitleSpan}{SubSpan}</div>
      }
      if (placement === 'top') {
        return <div class={['c_sub-title', '--col', '--top', `align-${align}`].join(' ')}>{SubSpan}{TitleSpan}</div>
      }
      return <div class={['c_sub-title', '--col', '--bottom', `align-${align}`].join(' ')}>{TitleSpan}{SubSpan}</div>
    }
  }
})