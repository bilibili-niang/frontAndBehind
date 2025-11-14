import { computed, defineComponent } from 'vue'
import Title from '../title'
import './style.scss'
import { chunk } from 'lodash-es'
import { withUnit } from '@anteng/utils'
import { Image } from '@tarojs/components'
import { useAction } from '../../hooks/useAction'

export default defineComponent({
  name: '',
  props: {
    config: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const data = computed(() => {
      const list = (props.config.data || []) as any[]
      return list.map((item, index) => {
        return {
          ...item,
          image: item.image?.url,
          name: item.title,
          desc: item.subtitle,
          action: item.action,
          onClick: () => {
            useAction(item.action)
          }
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
      props.config.text?.placement === 'bottom' ? props.config.text?.colorBottom : props.config.text?.colorUnder
    )

    return () => {
      return (
        <div class="d_images-side-slide-wrap">
          {props.config.titleEnable && <Title config={props.config.title} />}
          <div
            class={['d_images-side-slide scroller', `text-${props.config.text?.placement}`]}
            style={{
              '--gap': withUnit(props.config.gap ?? 8)
            }}
          >
            {rows.value.map(row => {
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
                            flexGrow: props.config.flexGrow ? 1 : 0
                          }}
                        >
                          {item && (
                            <>
                              <div
                                class="d_images-side-slide__item-image"
                                style={{
                                  ...imageStyle.value,
                                  ...gradient
                                }}
                                onClick={item.onClick}
                              >
                                {item.image && <Image class="image" src={item.image} mode="aspectFill" />}
                              </div>

                              {hasText && (
                                <div class="d_images-side-slide__item-text" style={{ color: textColor.value }}>
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
