// 点单列表（可交互）
import { computed, defineComponent, onMounted, ref } from 'vue'
import { Image, Text, View } from '@tarojs/components'
import { ScrollTab, ScrollTabItem, SearchBar, Icon } from '@pkg/ui'
import { BasePage, useToast, Spin, useModal } from '@pkg/core'
import GoodsItem from '../../../../components/goods-item'
import { buildCoffeeImgUrl } from '../../../../utils/test'
import './index.scss'
import { useGoodsSkuModal } from '../../../../hooks'
import type { SkuItem } from '../../../../hooks/useGoodsSku/utils'

definePageConfig({
  enableShareAppMessage: true,
  navigationStyle: 'custom',
  disableScroll: true
})

type CoffeeItem = {
  id: string
  name: string
  price: number
  listPrice?: number
  image: string
}

const categories = ['全部', '手冲咖啡', '现磨咖啡', '时尚甜点', '冰淇淋']

export default defineComponent({
  name: 'CoffeeOrderPage',
  setup() {
    const current = ref(0)
    const keyword = ref('')
    const bannerImg = ref(buildCoffeeImgUrl(1))
    const loading = ref(false)

    // 构建本地假数据（结合项目已有思路）
    const IMG_COUNT = 6
    const buildItems = (prefix: string, startIndex = 1, count = 8): CoffeeItem[] => {
      const list: CoffeeItem[] = []
      for (let i = 0; i < count; i++) {
        const idx = startIndex + i
        const imgIndex = ((idx - 1) % IMG_COUNT) + 1
        list.push({
          id: `${prefix}-${idx}`,
          name: `${prefix}经典咖啡 ${idx}`,
          price: 18 + (idx % 5) * 2,
          listPrice: 26 + (idx % 5) * 2,
          // 预先计算并缓存稳定的图片 URL，渲染时不再调用函数
          image: buildCoffeeImgUrl(imgIndex)
        })
      }
      return list
    }

    const allItems = ref<CoffeeItem[]>([])

    // 店铺切换（演示）
    const shops = [
      { id: 'shop-1', name: '海淀总店' },
      { id: 'shop-2', name: '朝阳新城店' },
      { id: 'shop-3', name: '西直门店' }
    ]
    const currentShop = ref(shops[0])
    const showShopSelector = () => {
      const modal = useModal({
        placement: 'bottom',
        height: 'auto',
        title: '选择店铺',
        content: () => (
          <View class="shop-selector">
            {shops.map(s => (
              <View
                class={['shop-selector__item', s.id === currentShop.value.id && 'active']}
                onClick={async () => {
                  currentShop.value = s
                  // 根据店铺简单切换头图（演示）
                  bannerImg.value = buildCoffeeImgUrl(s.id === 'shop-1' ? 1 : s.id === 'shop-2' ? 2 : 3)
                  // 重新加载当前类目的商品（演示复用本地假数据）
                  loading.value = true
                  allItems.value = await fetchFakeItems(categories[current.value])
                  loading.value = false
                  modal.close()
                }}
              >
                <Text class="name">{s.name}</Text>
                {s.id === currentShop.value.id && <Text class="checked">当前</Text>}
              </View>
            ))}
          </View>
        )
      })
    }

    // 构造假的请求，模拟不同分类的数据加载
    const fetchFakeItems = (cat: string): Promise<CoffeeItem[]> => {
      return new Promise(resolve => {
        setTimeout(() => {
          if (cat === '手冲咖啡') {
            resolve(buildItems('手冲', 1, 8))
          } else if (cat === '现磨咖啡') {
            resolve(buildItems('现磨', 1, 10))
          } else if (cat === '时尚甜点') {
            resolve(buildItems('甜点', 1, 6))
          } else if (cat === '冰淇淋') {
            resolve(buildItems('冰淇淋', 1, 6))
          } else {
            resolve([
              ...buildItems('现磨', 1, 6),
              ...buildItems('手冲', 1, 6),
              ...buildItems('甜点', 1, 4)
            ])
          }
        }, 200)
      })
    }

    // 首次加载使用 Promise 的假数据，避免初始渲染抖动
    onMounted(async () => {
      loading.value = true
      allItems.value = await fetchFakeItems('全部')
      loading.value = false
    })

    const filtered = computed(() => {
      const k = keyword.value.trim()
      const base = allItems.value
      return k ? base.filter(i => i.name.includes(k)) : base
    })

    // 两列布局
    const twoCols = computed(() => {
      const left: CoffeeItem[] = []
      const right: CoffeeItem[] = []
      filtered.value.forEach((item, idx) => {
        (idx % 2 === 0 ? left : right).push(item)
      })
      return [left, right]
    })

    // 每个商品的数量
    const counts = ref<Record<string, number>>({})
    const getCount = (id: string) => counts.value[id] ?? 1
    const onOrder = (item: CoffeeItem) => {
      const c = getCount(item.id)
      useToast(`已选择「${item.name}」x${c}`)
    }

    // 详情弹窗：构造演示 SKU 数据并唤起规格选择弹窗
    const buildDemoSkus = (goodsId: string, defaultImage?: string): SkuItem[] => {
      const sizes = [
        { id: 'size-l', name: '大杯' },
        { id: 'size-m', name: '中杯' },
        { id: 'size-s', name: '小杯' }
      ]
      const sugars = [
        { id: 'sugar-full', name: '全糖' },
        { id: 'sugar-70', name: '七分' },
        { id: 'sugar-none', name: '去糖' }
      ]
      const temps = [
        { id: 'temp-hot', name: '热' },
        { id: 'temp-ice', name: '冰' }
      ]

      const skus: SkuItem[] = []
      let sort = 100
      sizes.forEach(size => {
        sugars.forEach(sugar => {
          temps.forEach(temp => {
            const id = `${goodsId}-${size.id}-${sugar.id}-${temp.id}`
            const basePrice = 20
            const priceDelta = (size.id === 'size-l' ? 4 : size.id === 'size-m' ? 2 : 0) + (temp.id === 'temp-ice' ? 2 : 0)
            const price = (basePrice + priceDelta) * 100
            const listPrice = price + 400
            skus.push({
              id,
              goodsId,
              specCode: `${size.id}|${sugar.id}|${temp.id}`,
              underlinePrice: listPrice,
              price,
              cost: price - 300,
              stock: 99,
              weight: 0,
              sort: sort--,
              path: '',
              specs: [
                { k: '杯型', kId: 'size', v: size.name, vId: size.id, image: defaultImage },
                { k: '糖分', kId: 'sugar', v: sugar.name, vId: sugar.id },
                { k: '温度', kId: 'temp', v: temp.name, vId: temp.id }
              ]
            })
          })
        })
      })
      return skus
    }

    const showDetail = (item: CoffeeItem) => {
      const skus = buildDemoSkus(item.id, item.image)
      useGoodsSkuModal({
        skus,
        defaultImage: item.image,
        actions: [
          {
            text: '加入购物车',
            type: 'primary',
            onClick: data => {
              useToast(`已加入购物车：${item.name} x${data.count}`)
            }
          }
        ]
      })
    }

    return () => (
      <BasePage
        navigator={{
          navigatorStyle: 'blank',
          immersive: true,
          title: '',
          fixedTitle: '我要点单',
          navigationBarTextStyleFixed: 'black',
          navigationBarBackgroundColorFixed: 'rgba(255, 255, 255, 0)',
          navigationBarBackgroundColor: 'rgba(0, 0, 0, 0)',
        }}
        navigatorPlaceholder={true}
        useScrollView={true}
      >
        <View class="coffee-order">
          {/* 顶部标题与简单操作区 */}
          <View class="coffee-order__header">
            <Text class="coffee-order__title">我要点单</Text>
            <View class="coffee-order__shop-btn" onClick={showShopSelector}>
              <Text class="label">{currentShop.value.name}</Text>
              <Icon name="right" class="switch-icon" />
            </View>
          </View>

          {/* 头图 */}
          <View class="coffee-order__banner" onClick={() => showDetail({
            id: 'banner-coffee',
            name: '招牌拿铁',
            price: 22,
            listPrice: 28,
            image: bannerImg.value
          })}>
            <Image class="coffee-order__banner-img" mode="aspectFill" src={bannerImg.value}></Image>
          </View>

          {/* 分类标签 */}
          <View class="coffee-order__tabs">
            <ScrollTab current={current.value}>
              {categories.map((label, i) => (
                <ScrollTabItem key={label}>
                  <View
                    class={`coffee-order__tab ${current.value === i ? 'is-active' : ''}`}
                    onClick={async () => {
                      current.value = i
                      const cat = categories[i]
                      loading.value = true
                      allItems.value = await fetchFakeItems(cat)
                      loading.value = false
                    }}
                  >
                    {label}
                  </View>
                </ScrollTabItem>
              ))}
            </ScrollTab>
          </View>

          {/* 搜索 */}
          <View class="coffee-order__search">
            <SearchBar
              placeholder="您想喝点什么？"
              value={keyword.value}
              onChange={(v: string) => (keyword.value = v)}
              onSearch={(v: string) => (keyword.value = v)}
              shape="round"
              background="#ffffff"
            />
          </View>

          {/* 系列标题 */}
          <View class="coffee-order__section-title">
            {categories[current.value] === '全部' ? '热门推荐' : `${categories[current.value]}系列`}
          </View>

          {/* 两列商品列表 */}
          {loading.value ? (
            <View class="coffee-order__loading">
              <Spin />
            </View>
          ) : (
            <View class="coffee-order__grid">
              {twoCols.value.map((col, colIdx) => (
                <View class="coffee-order__col" key={colIdx}>
                  {col.map(item => (
                    <View class="coffee-order__card" key={item.id}>
                      <GoodsItem
                        type="vertical"
                        image={item.image}
                        name={item.name}
                        price={item.price}
                        listPrice={item.listPrice}
                        action={
                          <View class="coffee-order__actions">
                            {/*<CountStepper
                             min={1}
                             max={9}
                             value={getCount(item.id)}
                             onChange={(v: number) => setCount(item.id, v)}
                             />*/}
                            <View class="coffee-order__buy" onClick={() => onOrder(item)}>
                              马上订购
                            </View>
                          </View>
                        }
                        // @ts-ignore
                        onClick={() => showDetail(item)}
                      />
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>
      </BasePage>
    )
  }
})
