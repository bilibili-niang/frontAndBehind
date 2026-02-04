import { computed, defineComponent, PropType } from 'vue'
import manifest from './manifest'
import Title from '@pkg/decoration/src/canvas-components/common/title/render'
import './style.scss'
import Image1 from './temp/1.png'
import Image2 from './temp/2.png'
import Image3 from './temp/3.png'
import Image4 from './temp/4.png'
import Image5 from './temp/5.png'
import Image6 from './temp/6.png'
import { chunk } from 'lodash'

import { DeckComponent, withUnit } from '@pkg/decoration'

export { manifest }

const mockData = [
  { id: 4, image: Image4, name: '这是名称', desc: '这是描述信息' },
  { id: 5, image: Image5, name: '这是名称这是名称这是名称', desc: '这是描述信息' },
  {
    id: 6,
    image: Image6,
    name: '这是名称',
    desc: '这是描述信息这是描述信息这是描述信息这是描述信息'
  },
  { id: 1, image: Image1, name: '这是名称', desc: '这是描述信息' },
  { id: 2, image: Image2, name: '这是名称', desc: '这是描述信息' },
  { id: 3, image: Image3, name: '这是名称', desc: '这是描述信息' }
]

export default defineComponent({
  name: '',
  props: {
    comp: {
      type: Object as PropType<DeckComponent>,
      required: true
    },
    config: {
      type: Object as PropType<any>,
      required: true
    }
  },
  setup(props) {
    // const data = ref([
    //   { id: 4, image: Image4, name: '这是名称', desc: '这是描述信息' },
    //   { id: 5, image: Image5, name: '这是名称这是名称这是名称', desc: '这是描述信息' },
    //   {
    //     id: 6,
    //     image: Image6,
    //     name: '这是名称',
    //     desc: '这是描述信息这是描述信息这是描述信息这是描述信息'
    //   },
    //   { id: 1, image: Image1, name: '这是名称', desc: '这是描述信息' },
    //   { id: 2, image: Image2, name: '这是名称', desc: '这是描述信息' },
    //   { id: 3, image: Image3, name: '这是名称', desc: '这是描述信息' }
    // ])

    const data = computed(() => {
      const list = (props.comp.config.data || []) as any[]
      if (list.length === 0) return mockData
      return list.map((item, index) => {
        if (!item) {
          return {
            image: '',
            name: '尚未配置数据',
            desc: '请在左侧面板配置数据',
            action: null
          } as any
        }

        return {
          ...item,
          image: item.image?.url,
          name: item.title,
          desc: item.subtitle,
          action: item.action
        }
      })
    })

    const rows = computed(() => {
      const col = props.config.col

      const chunks = chunk(data.value, col)
      if (chunks.length > 1) {
        const lastChunk = chunks[chunks.length - 1]

        if (lastChunk.length < col) {
          const remaining = col - lastChunk.length
          const filledChunk = [...lastChunk, ...Array(remaining).fill(null)]
          chunks[chunks.length - 1] = filledChunk
        }
      }

      return chunks
    })

    const imageRatio = computed(() => {
      const { width = 3, height = 4 } = props.config.ratio
      return height / width
    })
    const imageStyle = computed(() => {
      return {
        paddingBottom: `calc(${imageRatio.value} * 100%)`,
        objectFit: props.config.ratio?.objectFit,
        backgroundSize: props.config.ratio?.objectFit,
        borderRadius: props.config.borderRadius?.map((i: number) => withUnit(i)).join(' ')
      }
    })

    const textColor = computed(() =>
      props.config.text?.placement === 'bottom'
        ? props.config.text?.colorBottom
        : props.config.text?.colorUnder
    )

    return () => {
      return (
        <div class="d_images-side-slide-wrap">
          {props.comp.config.titleEnable && (
            <Title comp={null as unknown as any} config={props.comp.config.title} />
          )}
          <div
            class={['d_images-side-slide scroller', `text-${props.config.text?.placement}`]}
            style={{
              '--gap': withUnit(props.config.gap ?? 8)
            }}
          >
            {rows.value.map((row) => {
              return (
                <div class="d_images-side-slide__row">
                  {row.map((item, index, arr) => {
                    if (!item) return null
                    const hasText = Boolean(item.name || item.desc)

                    const { linearGradientEnable = true, linearGradient = {} } = item

                    const _linearGradient = Object.assign(
                      {
                        color: '#000',
                        end: 40
                      },
                      linearGradient
                    )

                    const { color, end } = _linearGradient

                    const gradient = {
                      '--gradient': linearGradientEnable
                        ? `linear-gradient(to top, ${color}, rgba(0, 0, 0, 0) ${end}%)`
                        : 'none'
                    }

                    return (
                      <>
                        <div
                          class={['d_images-side-slide__item', !hasText && 'no-text']}
                          style={{
                            width: withUnit(props.config.itemWidth),
                            flexGrow: props.config.flexGrow ? 1 : 0,
                            ...gradient
                          }}
                        >
                          {item && (
                            <>
                              <div
                                class="d_images-side-slide__item-image"
                                style={{
                                  ...imageStyle.value
                                }}
                              >
                                {item.image ? (
                                  <img src={item.image} />
                                ) : (
                                  <div class="img-placeholder color-disabled flex-center">
                                    请配置图片
                                  </div>
                                )}
                              </div>

                              {hasText && (
                                <div
                                  class="d_images-side-slide__item-text"
                                  style={{ color: textColor.value }}
                                >
                                  <div class="d_images-side-slide__item-name">{item.name}</div>
                                  <div class="d_images-side-slide__item-desc">{item.desc}</div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        {index < arr.length - 1 && <div class="gap"></div>}
                      </>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  }
})
