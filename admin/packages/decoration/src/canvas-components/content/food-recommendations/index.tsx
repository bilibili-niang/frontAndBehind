import { PropType, defineComponent, computed } from 'vue'
import './style.scss'
import { foodRecommendationsConfig } from './manifest'
import { DeckComponent } from '../../../stores/canvas'
import { withUnit } from '@pkg/decoration'
import { useAction } from '@pkg/core'

export { default as manifest } from './manifest'

export default defineComponent({
  name: 'C_FoodRecommendations',
  props: {
    comp: {
      type: Object as PropType<DeckComponent<foodRecommendationsConfig>>,
      required: true
    }
  },
  setup(props) {
    // 标题样式
    const titleStyle = computed(() => {
      const { titleColor, titleFontSize } = props.comp.config
      return {
        color: titleColor,
        fontSize: withUnit(titleFontSize)
      }
    })
    // 箭头样式
    const arrowStyle = computed(() => {
      const { color, size, offsetX, offsetY } = props.comp.config.arrow
      return {
        color,
        fontSize: withUnit(size),
        transform: `translate3d(${withUnit(offsetX)}, ${withUnit(offsetY)}, 0)`
      }
    })

    // 美食列表
    const foodList = computed(() => {
      const { list } = props.comp.config
      return list
    })
    // 主标题
    const mainTitleStyle = computed(() => {
      const { mainTitleSize, mainTitleColor, mainTitleWeight } = props.comp.config.foodTitle
      return {
        fontSize: withUnit(mainTitleSize),
        color: mainTitleColor,
        fontWeight: mainTitleWeight
      }
    })
    // 副标题
    const subTitleStyle = computed(() => {
      const { subTitleSize, subTitleColor } = props.comp.config.foodTitle
      return {
        fontSize: withUnit(subTitleSize),
        color: subTitleColor
      }
    })
    // 背景渐变色
    const backgroundStyle = computed(() => {
      const { gradientsColor } = props.comp.config.foodTitle
      return {
        background: `linear-gradient(to bottom, transparent, ${gradientsColor})`
      }
    })

    return () => {
      return (
        <div class="c_food-recommendations">
          <div class="c_food-recommendations-title-container">
            <div class="c_food-recommendations-left-title" style={titleStyle.value}>
              美食推荐
            </div>
            {props.comp.config.arrow.enable && (
              <div
                class="c_food-recommendations-right-layout"
                onClick={() => useAction(props.comp.config.arrowAction)}
              >
                <div class="c_title__arrow" style={arrowStyle.value}>
                  <span class="c_title__arrow-text">{props.comp.config.arrow.text}</span>
                  <div class="c_title__arrow-icon iconfont icon-right"></div>
                </div>
              </div>
            )}
          </div>

          <div class="c-food-item-limted">
            <div class="c-food-item-container">
              {foodList.value?.length > 0 &&
                foodList.value?.map((item: any, index) => {
                  return (
                    <div class="c-food-item">
                      <div class="food-cover-image">
                        <div
                          class="food-text-container"
                          style={{ 'background-image': `url(${item?.images[0]})` }}
                        >
                          {props.comp.config.foodTitle.titlePosition === 'inside' && (
                            <div class="c-food-text-container">
                              <div
                                class="c-food-background-image"
                                style={backgroundStyle.value}
                              ></div>
                              <div class="foodName" style={mainTitleStyle.value}>
                                {item?.title}
                              </div>
                              <div class="food-descriptions" style={subTitleStyle.value}>
                                {item?.description}
                              </div>
                            </div>
                          )}
                        </div>

                        {props.comp.config.foodTitle.titlePosition === 'outside' && (
                          <div class="c-food-text-container c-food-text-layout-outside">
                            <div class="foodName" style={mainTitleStyle.value}>
                              {item?.title}
                            </div>
                            <div class="food-descriptions" style={subTitleStyle.value}>
                              {item?.description}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )
    }
  }
})
