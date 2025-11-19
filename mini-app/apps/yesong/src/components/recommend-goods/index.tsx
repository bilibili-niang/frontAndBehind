import { computed, defineComponent, onMounted, ref } from 'vue'
import GoodsItem from '../goods-item'
import './style.scss'
import { Swiper, SwiperItem } from '@tarojs/components'
import Taro from '@tarojs/taro'

export default defineComponent({
  name: 'RecommendGoods',
  setup() {
    const pages = ref([1, 2, 3, 4])
    const currentPage = ref(0)
    const onSwipeChange = e => {
      currentPage.value = e.detail.current
    }

    const pagesHeight = ref<number[]>([])
    const pageHeight = computed(() => {
      return pagesHeight.value[currentPage.value]
    })

    let retryCount = 0
    const getPagesHeight = () => {
      Taro.createSelectorQuery()
        .selectAll('.c_recommend-goods__cnt')
        .boundingClientRect((res: any[]) => {
          pagesHeight.value = res.map(item => item.height)
          if (retryCount < 5 && res.length < pages.value.length) {
            retryCount++
            setTimeout(getPagesHeight, 32)
          }
        })
        .exec()
    }

    onMounted(getPagesHeight)

    const indicatorThumbStyle = computed(() => {
      const ratio = currentPage.value / (pages.value.length - 1)
      const width = 1 / pages.value.length
      return {
        width: `${width * 100}%`,
        left: `${ratio * 100}%`,
        transform: `translate3d(${-ratio * 100}%, 0, 0)`
      }
    })
    return () => {
      return (
        <div class="c_recommend-goods">
          <div
            class="c_recommend-goods__list"
            style={{
              height: pageHeight.value + 'px'
            }}
          >
            <Swiper
              class="swiper"
              adjustHeight="current"
              onChange={onSwipeChange}
            >
              {pages.value.map((item, index) => {
                return (
                  <SwiperItem class="swiper-item">
                    <div class="c_recommend-goods__cnt">
                      <GoodsItem />
                      <GoodsItem />
                      <GoodsItem />
                      <GoodsItem />
                      <GoodsItem />
                      <GoodsItem />
                    </div>
                  </SwiperItem>
                )
              })}
            </Swiper>
          </div>
          <div class="c_recommend-goods__indicator">
            <div class="c_recommend-goods__track">
              <div class="c_recommend-goods__thumb" style={indicatorThumbStyle.value}></div>
            </div>
          </div>
        </div>
      )
    }
  }
})
