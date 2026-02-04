import { computed, defineComponent, onUnmounted, PropType, ref, watch } from 'vue'
import './style.scss'

import getGoodsList from '../../../api/deck-comps/getGoodsList'
import { navigateToGoodsDetail } from '../../../router'
import { COMMON_STATUS_OFF } from '../../../constants'
import { DeckComponentConfig } from '@pkg/deck'
import { formatPrice, withUnit } from '@pkg/utils'
import Title from '@pkg/deck/src/components/title'
import { clamp } from 'lodash-es'
import useAction from '../../../hooks/useAction'
import { onPageHide, onPageShow } from '@pkg/core'

function groupArray<T>(arr: T[], columns: number): T[][] {
  const result: T[][] = new Array(columns).fill(null).map(() => [])
  for (let i = 0; i < arr.length; i++) {
    const columnIndex = i % columns
    result[columnIndex].push(arr[i])
  }
  return result
}

export default defineComponent({
  name: 'c_goods-list',
  props: {
    comp: {
      type: Object as PropType<DeckComponentConfig>,
      required: true
    },
    config: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const list = computed(() => {
      return props.comp.config.goodsList
        .map(item => {
          const target = cacheMap.value.get(item?.goods?.id)
          if (target && target.status !== COMMON_STATUS_OFF) {
            const [integer, decimal] = formatPrice(target.priceMin).split('.')
            return {
              id: target.id,
              name: target.title,
              image: target.coverImages?.[0],
              price: target.priceMin,
              listPrice: target.underlinePrice,
              integer,
              decimal
            }
          }

          return null
        })
        .filter(item => item)
    })
    const clos = computed(() => {
      return groupArray(list.value, 2)
    })

    const cacheMap = ref(new Map())

    const getData = () => {
      const goodsIds = props.comp.config.goodsList
        .map(item => item?.goods?.id)
        .filter(item => item && !cacheMap.value.get(item))
      if (goodsIds.length > 0) {
        getGoodsList(goodsIds).then(res => {
          res.data.forEach((goods: any) => {
            if (goods) {
              cacheMap.value.set(goods.id, goods)
            }
          })
        })
      }
    }

    watch(
      () => props.comp.config.goodsList,
      () => {
        getData()
      },
      { immediate: true, deep: true }
    )

    const title = computed(() => {
      const { title, titleEnable = false } = props.config
      return titleEnable ? title : null
    })

    const groups = computed(() => {
      return groupArray(list.value, 3)
    })

    const styleRef = computed(() => {
      const style = props.comp.config?.style

      const linearGradientEnable = style?.linearGradientEnable ?? false
      const {
        deg = 180,
        from = 'rgba(255, 0, 0, 0.1)',
        to = 'rgba(255, 255, 255, 0.1)',
        fromStop = 0,
        toStop = 100
      } = style?.linearGradient || {}

      const {
        enable: borderEnable = false,
        shape: borderShape = 'solid',
        width: borderWidth = 1,
        color: borderColor = '#000000'
      } = style?.border || {}

      const { backgroundColor: labelBg = '#ff5656', color: labelColor = '#ffffff' } = style?.label || {}
      const { backgroundColor: priceBg = '#fce2c4', color: priceColor = '#ff5656' } = style?.price || {}

      return {
        backgroundImage: linearGradientEnable
          ? `linear-gradient(${deg}deg, ${from} ${fromStop}%, ${to} ${toStop}%)`
          : 'none',
        ...(borderEnable
          ? {
              borderWidth: withUnit(borderWidth),
              borderStyle: borderShape,
              borderColor: borderColor
            }
          : {}),

        '--label-bg': labelBg,
        '--label-color': labelColor,
        '--price-bg': priceBg,
        '--price-color': priceColor
      }
    })

    const bgStyle = computed(() => {
      const style = props.comp.config?.style
      const { backgroundEnable = false, background = {} } = style || {}
      if (!backgroundEnable) {
        return null
      }
      return {
        bg: {
          backgroundImage: `url(${background.image})`
        },
        placeholder: {
          height: withUnit(background.paddingTop)
        }
      }
    })

    const Bg = () => <div class="d_goods-swiper__bg" style={bgStyle.value?.bg}></div>
    const TopTitle = () => (title.value ? <Title class="d_goods-swiper__title" config={props.config.title} /> : null)
    const Placeholder = () => <div class="top-placeholder" style={bgStyle.value?.placeholder}></div>

    const Header = () => {
      const p = props.comp.config?.style?.background.paddingPlacement
      return p === 0 ? (
        <>
          <Placeholder />
          <TopTitle />
        </>
      ) : (
        <>
          <TopTitle />
          <Placeholder />
        </>
      )
    }

    const play = computed(() => {
      const play = props.config.play
      const { interval = 3, parallaxEnable = true, parallax = 0.5 } = play
      return {
        interval: interval * 1000,
        parallax: parallaxEnable ? parallax * 1000 : 0
      }
    })

    const onItemClick = (item: any) => {
      if (props.config.commonActionEnable && props.config.commonAction) {
        useAction(props.config.commonAction)
      } else {
        navigateToGoodsDetail(item.id)
      }
    }

    return () => {
      return (
        <div class="d_goods-swiper" style={styleRef.value}>
          <Bg />
          <Header />
          <div class="d_goods-swiper__content">
            {groups.value.map((group, index, arr) => {
              return (
                <GoodsSwiperCol
                  style={{
                    // 为什么 + 0.01 ？因为小程序里 0 * 时长会有异常。
                    '--parallax': (play.value.parallax > 0 ? index : 0) + 0.01
                  }}
                  class={index === arr.length - 1 && 'last'}
                  list={group}
                  index={index}
                  label={props.config.label}
                  {...play.value}
                  onItemClick={onItemClick}
                />
              )
            })}
          </div>
        </div>
      )
    }
  }
})

const GoodsSwiperCol = defineComponent({
  props: {
    list: {
      type: Array,
      required: true
    },
    isActive: Boolean,
    index: {
      type: Number,
      default: 0
    },
    interval: {
      type: Number,
      default: 3000
    },
    parallax: {
      type: Number,
      default: 500
    },
    label: {
      type: String
    }
  },
  emits: {
    itemClick: (item: any) => true
  },
  setup(props, { emit }) {
    const list = computed<any[]>(() => props.list)

    /** 运行滑动，数量至少 2 个 */
    const enableSlide = computed(() => list.value.length > 1)

    const doubleList = computed(() => {
      if (!enableSlide.value) return list.value
      return [
        ...list.value,
        ...list.value,
        // 只有三张的时候要多插入 1 张，防止滑动到最后一张的时候有空白
        ...(list.value.length === 3 ? [list.value[0]] : [])
      ]
    })

    const current = ref(0)

    watch(
      () => doubleList.value,
      () => {
        if (list.value.length > 2 && current.value === 0) {
          current.value = list.value.length
        } else if (list.value.length <= 2) {
          current.value = 0
        }
      },
      { immediate: true }
    )

    const onToggle = (index: number) => {
      if (isSliding.value) return void 0

      isSliding.value = true
      current.value = index

      setTimeout(onSlidEnd, DURATION + 300)
    }

    /** 滑动动画结束 */
    const onSlidEnd = () => {
      setTimeout(
        () => {
          // 滑动到 n + 1 时候，取消过渡，瞬间切换回 1
          if (current.value > list.value.length) {
            current.value = current.value % list.value.length
            noTransition.value = true
            setTimeout(() => {
              noTransition.value = false
              isSliding.value = false
            }, 32)
          } else if (current.value === 0) {
            // 滑动到 0 的时候，取消过渡，瞬间切换到 n（保证 前、后 都有内容不会露馅）
            current.value = list.value.length
            noTransition.value = true
            setTimeout(() => {
              noTransition.value = false
              isSliding.value = false
            }, 32)
          } else {
            isSliding.value = false
          }
        },
        parallax.value > 0 ? parallax.value * 3 + 32 : 0
      )
    }

    // const toPreviousOne = () => {
    //   onToggle(current.value - 1)
    // }

    const toNextOne = () => {
      onToggle(current.value + 1)
    }

    /** 滑动中？禁止切换操作 */
    const isSliding = ref(false)

    /** 禁用过渡、动画，用于无缝衔接 */
    const noTransition = ref(false)

    const DURATION = 600

    let autoplayTimer: NodeJS.Timeout

    const interval = computed(() => props.interval)
    const parallax = computed(() => props.parallax)

    /** 是否允许自动播放，数量至少 3 个 */
    const autoplayEnable = computed(() => enableSlide.value)
    const autoplayInterval = computed(() => clamp(interval.value, 2000, 10000))

    /** 自动播放 */
    const autoplay = () => {
      clearTimeout(autoplayTimer)

      if (props.isActive) {
        // 编辑时不自动播放
        return void 0
      }

      if (autoplayEnable.value) {
        autoplayTimer = setTimeout(() => {
          toNextOne()
          autoplay()
        }, autoplayInterval.value)
      }
    }

    watch(() => [autoplayEnable.value, autoplayInterval.value, props.isActive], autoplay, {
      immediate: true
    })

    /** 停止自动播放 */
    const stopAutoplay = () => {
      clearTimeout(autoplayTimer)
    }

    // 页面离开时暂停播放
    onPageHide(() => {
      stopAutoplay()
    })

    // 页面进入时开启播放
    onPageShow(() => {
      autoplay()
    })

    const onItemClick = (index: number) => {
      const target = list.value[index % list.value.length]
      emit('itemClick', target)
    }

    onUnmounted(() => {
      stopAutoplay()
    })

    return () => {
      return (
        <div
          class={['d_goods-swiper__col', isSliding.value && 'sliding', noTransition.value && 'no-transition']}
          style={{
            '--offset': -current.value
          }}
        >
          <div class="d_goods-swiper__col-content">
            <div class="d_goods-swiper__image">
              <div class="image-track">
                {doubleList.value.map((item, index, arr) => {
                  const length = list.value.length
                  const isActive = index % length === current.value % length
                  return (
                    <div
                      class={['item', isActive && 'active']}
                      style={{
                        backgroundImage: `url(${item.image})`
                      }}
                      onClick={() => {
                        onItemClick(index)
                      }}
                    ></div>
                  )
                })}
              </div>
            </div>
            <div class="d_goods-swiper__price">
              {props.label && <div class="tag">{props.label}</div>}
              <div class="price-track">
                {doubleList.value.map((item, index, arr) => {
                  const length = list.value.length
                  const isActive = index % length === current.value % length
                  return (
                    <div
                      class={['item number-font', isActive && 'active']}
                      onClick={() => {
                        onItemClick(index)
                      }}
                    >
                      <div class="yen">&yen;</div>
                      <div class="integer">{item.integer}</div>
                      {item.decimal?.length > 0 && <div class="decimal">.{item.decimal}</div>}
                    </div>
                  )
                })}
              </div>
              <div class="flash-light"></div>
            </div>
          </div>
        </div>
      )
    }
  }
})
