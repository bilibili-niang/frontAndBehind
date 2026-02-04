import { PropType, computed, defineComponent, withModifiers } from 'vue'
import './style.scss'
import useAction, { Action } from '../../../hooks/useAction'
import TextSlider from '../../text-slider'
import Iconfont from '@pkg/core/src/components/iconfont'
import { DeckComponentConfig } from '@pkg/deck'

interface ISearchData {
  placeholder: string
  keywords: { text: string }[]
  tagsEnable: boolean
  tags: {
    text: string
    action: Action | null
  }[]
  tagStyle: {
    color: string
    background: string
  }
}

export default defineComponent({
  props: {
    comp: {
      type: Object as PropType<any>,
      required: false
    },
    config: {
      type: Object as PropType<DeckComponentConfig<ISearchData>>,
      required: true
    }
  },
  setup(props) {

    console.log('[DeckSearch] props:', props)
    console.log('[DeckSearch] raw config:', props?.config)
    console.log('[DeckSearch] raw comp:', (props as any)?.comp)

    const cfg = computed<ISearchData>(() => {
      const c = (props?.config as any) || (props as any)?.comp?.config || {}
      return c as ISearchData
    })

    const keywords = computed(() => {
      return cfg.value?.keywords ?? []
    })

    const tags = computed(() => {
      return cfg.value?.tags ?? []
    })
    const tagVisible = computed(() => tags.value.length > 0 && !!cfg.value?.tagsEnable)
    const tagStyle = computed(() => {
      if (!cfg.value?.tagStyle) {
        return undefined
      }
      const { color, background } = cfg.value.tagStyle
      return {
        color,
        background
      }
    })
    const onTagClick = (tag: ISearchData['tags'][number]) => {
      if (tag.action && tag.action.key) {
        useAction(tag.action)
      } else {
        useAction({
          key: 'search',
          config: {
            keywords: tag.text
          }
        })
      }
    }
    return () => {
      return (
        <div
          class="d_search"
          onClick={() =>
            useAction({
              key: 'search'
            })
          }
        >
          <div class="d_search-bar">
            {/* <iconpark-icon class="d_search-bar__icon" name="search"></iconpark-icon> */}
            <div class="d_search-bar__icon">
              <Iconfont name="search" />
            </div>
            {keywords.value.length === 0 && (
              <div class="d_search-bar__placeholder">{cfg.value?.placeholder ?? '搜索你感兴趣的内容'}</div>
            )}
            <div class="d_search-bar__slider">
              <TextSlider
                list={keywords.value.map((item, index) => (
                  <div
                    class="d_search-bar__slider-item"
                    onClick={withModifiers(
                      () =>
                        useAction({
                          key: 'search',
                          config: {
                            keywords: item.text
                          }
                        }),
                      ['stop']
                    )}
                  >
                    {item.text}
                  </div>
                ))}
              />
            </div>
          </div>
          {tagVisible.value && (
            <div class="d_search-bar__tags scroller--hidden">
              {tags.value.map(tag => (
                <div
                  class="d_search-bar__tag"
                  style={tagStyle.value}
                  onClick={withModifiers(() => onTagClick(tag), ['stop'])}
                >
                  {tag?.text}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
  }
})
