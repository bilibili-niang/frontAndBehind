import { defineComponent, PropType } from 'vue'
import './style.scss'
import { DeckComponent } from '../../../stores/canvas'

export { default as manifest } from './manifest'

export default defineComponent({
  props: {
    comp: {
      type: Object as PropType<DeckComponent<{}>>,
      required: true
    },
    config: {
      type: Object as PropType<{}>,
      required: true
    }
  },
  setup(props) {
    const cfg = props.config as any

    return () => {
      const titleCfg = cfg?.title || {}
      const subCfg = cfg?.subtitle || {}
      const showSub = subCfg?.enable ?? true

      const align = cfg?.align || 'center'
      const placement = subCfg?.placement || 'bottom'

      const titleText = titleCfg?.text || '主标题'
      const subText = subCfg?.text || '副标题'

      const titleStyle: any = {
        color: titleCfg?.color || '#1f1f1f',
        fontSize: typeof titleCfg?.fontSize === 'number' ? `${titleCfg.fontSize}px` : titleCfg?.fontSize || '18px'
      }
      const subStyle: any = {
        color: subCfg?.color || '#999999',
        fontSize: typeof subCfg?.fontSize === 'number' ? `${subCfg.fontSize}px` : subCfg?.fontSize || '12px'
      }

      const Row = (leftFirst: boolean) => (
        <div class={['c_sub-title', '--row', leftFirst ? '--left' : '--right', `align-${align}`].join(' ')}>
          {leftFirst ? (
            <>
              {showSub && <span class="st-subtitle" style={subStyle}>{subText}</span>}
              <span class="st-title" style={titleStyle}>{titleText}</span>
            </>
          ) : (
            <>
              <span class="st-title" style={titleStyle}>{titleText}</span>
              {showSub && <span class="st-subtitle" style={subStyle}>{subText}</span>}
            </>
          )}
        </div>
      )

      const Col = (topFirst: boolean) => (
        <div class={['c_sub-title', '--col', topFirst ? '--top' : '--bottom', `align-${align}`].join(' ')}>
          {topFirst ? (
            <>
              {showSub && <span class="st-subtitle" style={subStyle}>{subText}</span>}
              <span class="st-title" style={titleStyle}>{titleText}</span>
            </>
          ) : (
            <>
              <span class="st-title" style={titleStyle}>{titleText}</span>
              {showSub && <span class="st-subtitle" style={subStyle}>{subText}</span>}
            </>
          )}
        </div>
      )

      if (placement === 'left') return Row(true)
      if (placement === 'right') return Row(false)
      if (placement === 'top') return Col(true)
      // default: bottom
      return Col(false)
    }
  }
})
