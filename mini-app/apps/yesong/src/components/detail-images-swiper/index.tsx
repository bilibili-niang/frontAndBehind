import { Image, Swiper, SwiperItem } from '@tarojs/components'
import { PropType, computed, defineComponent, reactive } from 'vue'
import './style.scss'
import { usePreviewImages } from '@pkg/core'

export default defineComponent({
  name: 'CommonDetailSwiper',
  props: {
    images: {
      type: Array as PropType<string[]>,
      required: true
    }
  },
  setup(props) {
    const images = computed(() => {
      return Array.isArray(props.images) ? props.images : []
    })
    const swiperState = reactive({
      current: 0
    })
    return () => {
      return (
        <div
          class="detail-images-swiper"
          onClick={() =>
            usePreviewImages({
              urls: images.value,
              current: swiperState.current
            })
          }
        >
          <Swiper
            class="swiper"
            adjustHeight="current"
            circular={true}
            autoplay={false}
            onChange={e => {
              swiperState.current = e.detail.current
            }}
          >
            {images.value?.map(image => {
              return (
                <SwiperItem class="swiper-item">
                  <Image class="detail-images-swiper__image" mode="aspectFill" src={image} />
                </SwiperItem>
              )
            })}
          </Swiper>
          <div class="indicator">
            <span class="current">{swiperState.current + 1}</span>
            <span class="slash">／</span>
            <span class="total">{images.value?.length}</span>
          </div>
        </div>
      )
    }
  }
})
