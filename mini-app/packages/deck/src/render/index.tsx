import { computed, defineComponent, PropType } from 'vue'
import './style.scss'
import { comps } from './comps'
import { DeckComponentAttrs, DeckComponentDefine } from '../types'
import Taro from '@tarojs/taro'

export default defineComponent({
  name: '',
  props: {
    components: {
      type: Array as PropType<any[]>,
      required: true
    }
  },
  setup(props) {
    // 通过 attrs 属性计算样式
    const generateContainerStyle = (attrs: DeckComponentAttrs) => {
      return {
        background: attrs.backgroundEnable ? attrs.background : undefined,
        padding: (attrs?.padding || [0, 0, 0, 0]).map(p => Taro.pxTransform(p)).join(' '),
        margin: (attrs?.margin || [0, 0, 0, 0]).map(m => Taro.pxTransform(m)).join(' '),
        // 不传 attrs.opacity 时应按 100% 不透明处理
        opacity: (attrs?.opacity ?? 100) / 100,
        borderRadius: (attrs?.borderRadius || [0, 0, 0, 0]).map(b => Taro.pxTransform(b)).join(' '),
        overflow: (attrs?.overflow || 'visible')
      }
    }

    const components = computed(() => {
      return props.components
    })

    const normalizeKey = (key?: string) => {
      if (!key) return ''
      // 1) 取最后一级（防止带有命名空间，如 common/jump-card）
      let k = key.split('/').pop() as string
      // 2) 下划线转连字符
      k = k.replace(/_/g, '-')
      // 3) 驼峰转连字符
      k = k.replace(/[A-Z]/g, s => '-' + s.toLowerCase()).replace(/^-/, '')
      return k
    }

    return () => {
      return components?.value?.map((item: any, index: number) => {
        const key = item.key!
        const comp: DeckComponentDefine = comps.get(key) || comps.get(normalizeKey(key))
        const containerStyle = {
          ...generateContainerStyle(item.attrs as any),
          ...(item.key === 'anchor'
            ? {
              position: 'sticky' as any,
              top: 'var(--content-safe-height)',
              zIndex: 20
            }
            : {})
        }
        return (
          <div
            onClick={() => {
              if (!comp) {
                console.warn('[Deck] 未注册的组件:', key, '-> 规范化后:', normalizeKey(key))
              }
            }}
            id={`deck-comp-${item.id}`}
            class="deck-comp"
            style={containerStyle}>
            {comp ? <comp comp={item} config={item.config}/> : null}
          </div>
        )
      })
    }
  }
})
