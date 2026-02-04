// 点单列表（可交互）
import { defineComponent, ref, computed, withModifiers } from 'vue'
import { BasePage, useToast } from '@pkg/core'
import './index.scss'
import GoodsItem from '../../../../components/goods-item'
import { Image, ScrollView } from '@tarojs/components'
import { buildCoffeeImgUrl } from '../../../../utils/test'
import { useGoodsSkuModal } from '../../../../hooks'
import type { SkuItem } from '../../../../hooks/useGoodsSku/utils'

definePageConfig({
  enableShareAppMessage: true,
  navigationStyle: 'custom',
  disableScroll: true
})
export default defineComponent({
  name: 'CoffeeOrderPage',
  setup() {
    // 视图切换：菜单 / 订单
    const currentView = ref<'menu' | 'orders'>('menu')
    const toggleView = (view: 'menu' | 'orders') => {
      currentView.value = view
    }
    const categories = ref([
      { id: 'xianmo', name: '现磨咖啡' },
      { id: 'shouchong', name: '手冲咖啡' },
      { id: 'qiaokeli', name: '巧克力味' },
      { id: 'matcha', name: '抹茶系列' },
      { id: 'dessert', name: '小吃甜品' },
      { id: 'bread', name: '现烤面包' }
    ])
    const activeIndex = ref(2)
    type CoffeeItem = {
      id: string
      name: string
      desc: string
      price: number
      listPrice?: number
      image: string
    }

    const IMG_COUNT = 6
    const buildItems = (prefix: string, startIndex = 1, count = 6): CoffeeItem[] => {
      const list: CoffeeItem[] = []
      for (let i = 0; i < count; i++) {
        const idx = startIndex + i
        const imgIndex = ((idx - 1) % IMG_COUNT) + 1
        list.push({
          id: `${prefix}-${idx}`,
          name: `${prefix}咖啡 ${idx}`,
          desc: idx % 2 === 0 ? '中杯/热/不加糖' : '大杯/冰/三分糖',
          price: 18.8,
          listPrice: 22,
          image: buildCoffeeImgUrl(imgIndex)
        })
      }
      return list
    }

    const datasets: Record<string, CoffeeItem[]> = {
      xianmo: buildItems('现磨', 1, 6),
      shouchong: buildItems('手冲', 1, 6),
      qiaokeli: buildItems('巧克力味', 1, 6),
      matcha: buildItems('抹茶', 1, 6),
      dessert: buildItems('甜品', 1, 6),
      bread: buildItems('面包', 1, 6)
    }

    const goods = computed(() => {
      const current = categories.value[activeIndex.value]
      return datasets[current.id] || []
    })

    const bannerImg = computed(() => buildCoffeeImgUrl(((activeIndex.value % IMG_COUNT) + 1)))

    const onChangeCategory = (idx: number) => {
      activeIndex.value = idx
    }

    const onAdd = (id: string) => {
      // 这里可接入购物车逻辑，目前为占位行为
      console.log('add goods', id)
    }

    // 构造演示规格（与 coffeeHome 保持一致）
    const buildDemoSkus = (goodsId: string, defaultImage: string) => {
      const sizes = [
        { id: 'size-s', name: '小杯' },
        { id: 'size-m', name: '中杯' },
        { id: 'size-l', name: '大杯' }
      ]
      const sugars = [
        { id: 'sugar-0', name: '不加糖' },
        { id: 'sugar-3', name: '三分糖' },
        { id: 'sugar-5', name: '半糖' }
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

    // 虚构订单列表数据
    type OrderStatus = '待支付' | '制作中' | '已完成' | '已取消'
    type OrderItem = {
      id: string
      no: string
      title: string
      count: number
      amount: number
      status: OrderStatus
      time: string
    }
    const orders = ref<OrderItem[]>([
      { id: 'o-1001', no: '202311120001', title: '巧克力拿铁等3件', count: 3, amount: 56.4, status: '待支付', time: '15:05' },
      { id: 'o-1002', no: '202311120002', title: '现磨美式等2件', count: 2, amount: 32.0, status: '制作中', time: '14:58' },
      { id: 'o-1003', no: '202311120003', title: '手冲耶加等1件', count: 1, amount: 22.0, status: '已完成', time: '13:41' },
      { id: 'o-1004', no: '202311120004', title: '抹茶拿铁等2件', count: 2, amount: 39.8, status: '已取消', time: '12:20' }
    ])
    const onOrderAction = (order: OrderItem) => {
      console.log('order action', order.id, order.status)
    }

    return () => (
      <BasePage
        navigator={{
          navigatorStyle: 'blank',
          immersive: true,
          title: '',
          navigationBarBackgroundColorFixed: 'rgba(0,0,0,0)'
        }}
        navigatorPlaceholder={true}
        useScrollView={false}
      >
        <div class="coffee-order-page">
          <div class="coffee-order-page__header">
            <div class="coffee-order-page__tabs">
              <div
                class={['coffee-order-page__tab', currentView.value === 'menu' && 'is-active']}
                onClick={() => toggleView('menu')}
              >
                菜单
              </div>
              <div
                class={['coffee-order-page__tab', currentView.value === 'orders' && 'is-active']}
                onClick={() => toggleView('orders')}
              >
                订单
              </div>
            </div>
            <div class="coffee-order-page__header-actions"></div>
          </div>

          {currentView.value === 'menu' ? (
            <div class="coffee-order-page__body">
              <div class="coffee-order-page__left">
                {categories.value.map((c, idx) => (
                  <div
                    key={c.id}
                    class={['coffee-order-page__cat-item', idx === activeIndex.value ? 'is-active' : '']}
                    onClick={() => onChangeCategory(idx)}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
              <div class="coffee-order-page__right">
                <div class="coffee-order-page__banner">
                  <Image class="image" mode="aspectFill" src={bannerImg.value} />
                </div>
                <div class="coffee-order-page__list">
                  <ScrollView scrollY class="coffee-order-page__list-scroll">
                    {goods.value.map(item => (
                      <div class="coffee-order-page__list-item" key={item.id} onClick={() => showDetail(item)}>
                        <GoodsItem
                          type="horizontal"
                          image={item.image}
                          name={item.name}
                          desc={item.desc}
                          price={item.price}
                          listPrice={item.listPrice}
                          action={
                            <div class="coffee-order-page__add" onClick={withModifiers(() => onAdd(item.id), ['stop'])}>
                              +
                            </div>
                          }
                        />
                      </div>
                    ))}
                  </ScrollView>
                </div>
              </div>
            </div>
          ) : (
            <div class="coffee-order-page__orders">
              <ScrollView scrollY class="coffee-order-page__order-scroll">
                {orders.value.map(o => (
                  <div class="coffee-order-page__order-card" key={o.id}>
                    <div class="coffee-order-page__order-main">
                      <div class="coffee-order-page__order-title">{o.title}</div>
                      <div class="coffee-order-page__order-sub">
                        <span>单号：{o.no}</span>
                        <span>· 件数：{o.count}</span>
                        <span>· 时间：{o.time}</span>
                      </div>
                    </div>
                    <div class="coffee-order-page__order-side">
                      <div class="coffee-order-page__order-amount">¥{o.amount.toFixed(1)}</div>
                      <div
                        class={['coffee-order-page__order-action', `status-${o.status}`]}
                        onClick={() => onOrderAction(o)}
                      >
                        {o.status}
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollView>
            </div>
          )}
        </div>
      </BasePage>
    )
  }
})
