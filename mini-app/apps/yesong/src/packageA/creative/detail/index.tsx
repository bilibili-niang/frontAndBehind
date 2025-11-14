import './style.scss'
import { computed, defineComponent, ref } from 'vue'
import { BasePage, useToast } from '@anteng/core'
import { Image, Swiper, SwiperItem, Text, View } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import { buildImgUrl } from '../../../utils/test'
import GoodsItem from '../../../components/goods-item'
import { navigateToCreativeDetail } from '../../../router'

definePageConfig({
  navigationStyle: 'custom',
  disableScroll: false
})

export default defineComponent({
  name: 'CreativeDetailPage',
  setup() {
    const router = useRouter()
    const rawId = router.params.id ?? 'creative-1'
    const idOnce = decodeURIComponent(rawId)
    let id = idOnce
    try {
      id = decodeURIComponent(idOnce)
    } catch (err) {
      id = idOnce
    }

    // 演示数据（可替换为真实接口）
    const rawName = (router.params as any).name || (router.params as any).title || ''
    const displayName = rawName ? decodeURIComponent(rawName) : `文创商品 · ${id}`
    const name = ref(displayName)
    const price = ref(59)
    const listPrice = ref(89)
    const images = ref([buildImgUrl(1), buildImgUrl(2), buildImgUrl(3)])
    const sold = ref(128)
    const stock = ref(36)
    const brand = ref('野松文创')
    const tags = ref(['限定', '原创插画', '环保材质'])
    const desc = ref('灵感与温度结合的文创周边，采用环保材质与原创插画，适合礼赠与日常使用。')

    // 规格选择（示例）
    const colors = ['奶油白', '可可棕', '海盐蓝']
    const sizes = ['S', 'M', 'L']
    const selectedColor = ref(colors[0])
    const selectedSize = ref(sizes[1])

    const recommend = computed(() => {
      const items = [] as any[]
      const count = 8
      for (let i = 1; i <= count; i++) {
        items.push({
          id: `creative-reco-${i}`,
          name: `文创周边 ${i}`,
          price: 49 + i,
          listPrice: 69 + i,
          image: buildImgUrl((i % 9) + 1)
        })
      }
      return items
    })

    const onBuy = () => {
      useToast('已加入选购清单')
    }

    return () => (
      <BasePage
        navigator={{
          title: '',
          immersive: true,
          navigationBarBackgroundColor: 'rgba(0,0,0,0)',
          navigationBarBackgroundColorFixed: 'rgba(0,0,0,0)',
          navigationBarTextStyle: 'black',
          navigationBarTextStyleFixed: 'black'
        }}
      >
        <div class="creative-detail">
          {/* 图集 */}
          <View class="creative-detail__gallery">
            <Swiper class="gallery-swiper" indicatorDots autoplay>
              {images.value.map((img, idx) => (
                <SwiperItem key={idx}>
                  <Image class="image" mode="aspectFill" src={img}/>
                </SwiperItem>
              ))}
            </Swiper>
            <View class="gallery__badges">
              <View class="badge">{brand.value}</View>
              {tags.value.map(t => (
                <View key={t} class="badge light">{t}</View>
              ))}
            </View>
          </View>

          {/* 基本信息 */}
          <View class="creative-detail__info">
            <View class="name">{name.value}</View>
            <View class="meta">
              <Text>已售 {sold.value}</Text>
              <Text class="dot">·</Text>
              <Text>库存 {stock.value}</Text>
            </View>
            <View class="price number-font">
              <View class="yen">¥</View>
              {price.value}
              <View class="list">¥{listPrice.value}</View>
            </View>
          </View>

          {/* 规格选择 */}
          <View class="creative-detail__spec">
            <View class="spec__title">颜色选择</View>
            <View class="spec__options">
              {colors.map(c => (
                <View
                  key={c}
                  class={['spec__option', selectedColor.value === c ? 'active' : ''].join(' ')}
                  onClick={() => (selectedColor.value = c)}
                >
                  {c}
                </View>
              ))}
            </View>
            <View class="spec__title">尺码选择</View>
            <View class="spec__options">
              {sizes.map(s => (
                <View
                  key={s}
                  class={['spec__option', selectedSize.value === s ? 'active' : ''].join(' ')}
                  onClick={() => (selectedSize.value = s)}
                >
                  {s}
                </View>
              ))}
            </View>
          </View>

          {/* 文案 */}
          <View class="creative-detail__desc">
            <View class="desc">{desc.value}</View>
            <View class="features">
              <View class="feature">原创插画，温柔配色，治愈系氛围。</View>
              <View class="feature">食品级材质，安心接触，耐用易清洁。</View>
              <View class="feature">适合礼盒搭配，节日与纪念日精心之选。</View>
            </View>
          </View>

          {/* 品牌故事 */}
          <View class="creative-detail__brand">
            <Image class="avatar" mode="aspectFill" src={buildImgUrl(9)}/>
            <View class="content">
              <View class="title">品牌故事 · {brand.value}</View>
              <View class="summary">致力于把自然与生活的细节，变成可触摸的温度。</View>
            </View>
          </View>

          {/* 推荐 */}
          <View class="creative-detail__recommend">
            <View class="section-title">你可能还喜欢</View>
            <View class="cards">
              {recommend.value.map(item => (
                <GoodsItem
                  key={item.id}
                  type="vertical"
                  image={item.image}
                  name={item.name}
                  price={item.price}
                  listPrice={item.listPrice}
                  // @ts-ignore
          onClick={() => navigateToCreativeDetail(item.id, item.name)}
                />
              ))}
            </View>
          </View>

          {/* 底部操作栏 */}
          <View class="creative-detail__actions">
            <View class="actions__price">
              <Text class="yen">¥</Text>
              <Text class="number-font">{price.value}</Text>
            </View>
            <View class="btn ghost" onClick={() => useToast('已加入收藏')}>收藏</View>
            <View class="btn" onClick={onBuy}>立即选购</View>
          </View>
        </div>
      </BasePage>
    )
  }
})