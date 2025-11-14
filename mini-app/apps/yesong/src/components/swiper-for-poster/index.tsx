// 商品详情页的海报~
import './style.scss'
import { defineComponent, ref } from 'vue'
import { Image, SwiperItem } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { withUnit } from '@anteng/utils'

interface imageItem {
  image: string
  qrcodeSize: number
  qrcodeX: number
  qrcodeY: number
  url: string
}

export default defineComponent({
  name: 'SwiperForPoster',
  props: {
    list: {
      type: Array,
      default: () => []
    },
    save: {
      type: Function,
      default: () => ({})
    },
    qrPath: {
      type: String,
      default: () => ''
    }
  },
  setup(props) {
    // 当前current
    const current = ref(0)

    return () => {
      return (
        <div class="swiper-for-poster">
          <Swiper
            circular
            class="swiper"
            next-margin="25px"
            previous-margin="25px"
            easing-function="linear"
            onChange={e => {
              current.value = e.detail.current
            }}
          >
            {props.list.map((it: imageItem, index) => {
              const qrStyle = {
                left: withUnit(Number(it?.qrcodeX) * 0.9),
                top: withUnit(Number(it?.qrcodeY) * 0.9),
                width: withUnit(it?.qrcodeSize),
                height: withUnit(it?.qrcodeSize)
              }
              return (
                <SwiperItem class="swiper-item-layout">
                  <div
                    class={[
                      'swiper-item-content',
                      props.list.length === 1 && 'width-100',
                      current.value === index && 'active-current'
                    ]}
                    onLongpress={() => {
                      Taro.vibrateShort({
                        type: 'light'
                      })
                      props.save(current.value)
                    }}
                    style={{
                      background: `url(${it.url})`,
                      width: '375px',
                      height: '667px',
                      backgroundSize: 'auto 100%',
                      backgroundPosition: 'center'
                    }}
                  >
                    {props?.qrPath ? <Image style={qrStyle} class="qr-image" src={props.qrPath} /> : <></>}
                    {/*<Image
                      onLongpress={() => {
                        Taro.vibrateShort({
                          type: 'light'
                        })
                        props.save(current.value)
                      }}
                      class="IMediaAlbumItem-image"
                      src={it.url}
                      mode="aspectFit"
                    />*/}
                  </div>
                </SwiperItem>
              )
            })}
          </Swiper>
        </div>
      )
    }
  }
})
