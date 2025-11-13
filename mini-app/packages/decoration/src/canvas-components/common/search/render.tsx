import { PropType, computed, defineComponent } from 'vue'
import './style.scss'
import { DeckComponent } from '../../../stores/canvas'
import { useAction, type ActionItem } from '@anteng/core'
import TextSlider from '../../../canvas-components/components/text-slider'

export { default as manifest } from './manifest'

const ACTION_KEY_SEARCH = 'search'

interface ISearchData {
  placeholder: string
  enableKeywords: boolean
  keywords: {
    text: string
  }[]
  tagsEnable: boolean
  tags: {
    text: string
    action: ActionItem | null
  }[]
  tagStyle: {
    color: string
    background: string
  }
}

export default defineComponent({
  props: {
    comp: {
      type: Object as PropType<DeckComponent<ISearchData>>,
      required: true
    },
    config: {
      type: Object as PropType<ISearchData>,
      required: true
    }
  },
  setup(props) {
    const placeholder = computed(() => props.config?.placeholder)
    const keywords = computed(() => {
      if (!props.config.enableKeywords) return []
      return props.comp.config.keywords ?? []
    })

    const tags = computed(() => {
      return props.comp.config.tags ?? []
    })
    const tagVisible = computed(() => tags.value.length > 0 && props.comp.config.tagsEnable)
    const tagStyle = computed(() => {
      if (!props.comp.config.tagStyle) {
        return undefined
      }
      const { color, background } = props.comp.config.tagStyle
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
          key: ACTION_KEY_SEARCH,
          config: {
            keywords: tag.text
          }
        })
      }
    }
    return () => {
      return (
        <div class="c_search">
          <div class="c_search-bar">
            <iconpark-icon class="c_search-bar__icon" name="search"></iconpark-icon>

            {keywords.value.length > 0 ? (
              <div class="c_search-bar__slider">
                <TextSlider
                  list={keywords.value.map((item, index) => (
                    <div
                      class="c_search-bar__slider-item"
                      onClick={() => useAction({ key: ACTION_KEY_SEARCH })}
                    >
                      {item.text}
                    </div>
                  ))}
                />
              </div>
            ) : (
              <div class="c_search-bar__placeholder">{placeholder.value}</div>
            )}
          </div>
          {tagVisible.value && (
            <div class="c_search-bar__tags scroller--hidden">
              {tags.value.map((tag) => (
                <div
                  class="c_search-bar__tag"
                  style={tagStyle.value}
                  onClick={() => onTagClick(tag)}
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
