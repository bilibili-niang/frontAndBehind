// 文创
import { computed, defineComponent, onMounted, ref } from 'vue'
import { Image, Text, View } from '@tarojs/components'
import { BasePage, useToast, Spin } from '@anteng/core'
import { navigateToCreativeDetail } from '../../../../router'
import { ScrollTab, ScrollTabItem, SearchBar } from '@anteng/ui'
import GoodsItem from '../../../../components/goods-item'
import { buildImgUrl } from '../../../../utils/test'
import './index.scss'

definePageConfig({
  enableShareAppMessage: true,
  navigationStyle: 'custom',
  disableScroll: true
})

type CreativeItem = {
  id: string
  name: string
  price: number
  listPrice?: number
  image: string
  tag?: string
}

type StoryItem = {
  id: string
  title: string
  summary: string
  image: string
}

const categories = ['全部', '文创周边', '手作课程', '主题礼盒', '品牌故事']

export default defineComponent({
  name: 'CoffeeWorkShopPage',
  setup() {
    const current = ref(0)
    const keyword = ref('')
    const loading = ref(false)
    const loadingMore = ref(false)
    const bannerImg = ref(buildImgUrl(1))
    const currentCat = ref<string>('全部')
    const nextIndex = ref(1)
    const PAGE_SIZE = 8

    const buildItems = (prefix: string, startIndex = 1, count = 8, tag?: string): CreativeItem[] => {
      const list: CreativeItem[] = []
      for (let i = 0; i < count; i++) {
        const idx = startIndex + i
        list.push({
          id: `${prefix}-${idx}`,
          name: `${prefix} ${idx}`,
          price: 39 + (idx % 4) * 10,
          listPrice: 59 + (idx % 4) * 10,
          image: buildImgUrl(((idx - 1) % 10) + 1),
          tag
        })
      }
      return list
    }

    const allItems = ref<CreativeItem[]>([])
    const storyList = ref<StoryItem[]>([])

    const fetchFakeData = async (cat: string) => {
      loading.value = true
      currentCat.value = cat
      await new Promise(r => setTimeout(r, 200))
      if (cat === '文创周边') {
        allItems.value = buildItems('咖啡杯周边', 1, 8, '周边')
        storyList.value = []
      } else if (cat === '手作课程') {
        allItems.value = buildItems('手作课程', 1, 6, '课程')
        storyList.value = []
      } else if (cat === '主题礼盒') {
        allItems.value = buildItems('主题礼盒', 1, 6, '礼盒')
        storyList.value = []
      } else if (cat === '品牌故事') {
        allItems.value = []
        storyList.value = [
          { id: 'story-1', title: '从一杯到一城', summary: '我们在城市角落里，酝酿关于咖啡与生活的故事。', image: buildImgUrl(2) },
          { id: 'story-2', title: '手作与温度', summary: '每一个细节，都在双手与材料的摩擦中诞生。', image: buildImgUrl(3) },
          { id: 'story-3', title: '文创让日常更美', summary: '把风味与灵感装进杯子、袋子与每一次相遇。', image: buildImgUrl(4) }
        ]
      } else {
        allItems.value = [
          ...buildItems('咖啡杯周边', 1, 6, '周边'),
          ...buildItems('主题礼盒', 1, 3, '礼盒'),
          ...buildItems('手作课程', 1, 3, '课程')
        ]
        storyList.value = []
      }
      // 记录下一次追加的起始索引，避免 id/image 重复
      nextIndex.value = allItems.value.length + 1
      loading.value = false
    }

    onMounted(async () => {
      await fetchFakeData('全部')
    })

    const filtered = computed(() => {
      const k = keyword.value.trim()
      const base = allItems.value
      return k ? base.filter(i => i.name.includes(k)) : base
    })

    const twoCols = computed(() => {
      const left: CreativeItem[] = []
      const right: CreativeItem[] = []
      filtered.value.forEach((item, idx) => ((idx % 2 === 0 ? left : right).push(item)))
      return [left, right]
    })

    const onOrder = (item: CreativeItem) => {
      useToast(`已选择「${item.name}」`)
    }

    const showDetail = (item: CreativeItem) => {
      useToast(`查看详情：${item.name}`)
    }

    const loadMore = async () => {
      // 品牌故事是图文，不做加载更多
      if (currentCat.value === '品牌故事') return
      if (loading.value || loadingMore.value) return
      loadingMore.value = true
      await new Promise(r => setTimeout(r, 150))

      let prefix = '更多文创'
      let tag: string | undefined = undefined
      if (currentCat.value === '文创周边') {
        prefix = '咖啡杯周边'
        tag = '周边'
      } else if (currentCat.value === '手作课程') {
        prefix = '手作课程'
        tag = '课程'
      } else if (currentCat.value === '主题礼盒') {
        prefix = '主题礼盒'
        tag = '礼盒'
      }

      const more = buildItems(prefix, nextIndex.value, PAGE_SIZE, tag)
      allItems.value = [...allItems.value, ...more]
      nextIndex.value += PAGE_SIZE
      loadingMore.value = false
    }

    return () => (
      <BasePage
        navigator={{
          navigatorStyle: 'blank',
          immersive: true,
          title: '',
          fixedTitle: '文创',
          navigationBarTextStyleFixed: 'black',
          navigationBarBackgroundColorFixed: 'rgba(255, 255, 255, 0)',
          navigationBarBackgroundColor: 'rgba(0, 0, 0, 0)'
        }}
        navigatorPlaceholder={true}
        useScrollView={true}
        scrollView={{ onScrollToLower: loadMore }}
      >
        <View class="workshop-page">
          <View class="workshop__header">
            <Text class="workshop__title">文创</Text>
          </View>

          <View
            class="workshop__banner"
            // @ts-ignore
            onClick={() => navigateToCreativeDetail('creative-banner', '精选文创')}
          >
            <Image class="workshop__banner-img" mode="aspectFill" src={bannerImg.value}></Image>
          </View>

          <View class="workshop__tabs">
            <ScrollTab current={current.value}>
              {categories.map((label, i) => (
                <ScrollTabItem key={label}>
                  <View
                    class={`workshop__tab ${current.value === i ? 'is-active' : ''}`}
                    onClick={async () => {
                      current.value = i
                      await fetchFakeData(categories[i])
                    }}
                  >
                    {label}
                  </View>
                </ScrollTabItem>
              ))}
            </ScrollTab>
          </View>

          <View class="workshop__search">
            <SearchBar
              placeholder="您想找点什么文创？"
              value={keyword.value}
              onChange={(v: string) => (keyword.value = v)}
              onSearch={(v: string) => (keyword.value = v)}
              shape="round"
              background="#ffffff"
            />
          </View>

          <View class="workshop__section-title">
            {categories[current.value] === '全部' ? '精选推荐' : `${categories[current.value]}`}
          </View>

          {loading.value ? (
            <View class="workshop__loading">
              <Spin />
            </View>
          ) : storyList.value.length > 0 ? (
            <View class="workshop__stories">
              {storyList.value.map(story => (
                <View class="workshop__story-card" key={story.id} onClick={() => useToast(`阅读：${story.title}`)}>
                  <Image class="workshop__story-image" mode="aspectFill" src={story.image}></Image>
                  <View class="workshop__story-content">
                    <View class="workshop__story-title">{story.title}</View>
                    <View class="workshop__story-summary">{story.summary}</View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View class="workshop__grid">
              {twoCols.value.map((col, colIdx) => (
                <View class="workshop__col" key={colIdx}>
                  {col.map(item => (
                    <View class="workshop__card" key={item.id}>
                      <GoodsItem
                        type="vertical"
                        image={item.image}
                        name={item.name}
                        price={item.price}
                        listPrice={item.listPrice}
                        action={
                          <View class="workshop__actions">
                            <View class="workshop__buy" onClick={() => onOrder(item)}>
                              立即选购
                            </View>
                          </View>
                        }
                        // @ts-ignore
                        onClick={() => navigateToCreativeDetail(item.id, item.name)}
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
