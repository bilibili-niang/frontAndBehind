import { computed, defineComponent, ref, watch } from 'vue'
import './index.scss'
import { BasePage, navigateTo } from '@pkg/core'
import { Image, Text, View } from '@tarojs/components'
import { Icon } from '@pkg/ui'
import { buildImgUrl } from '../../../../utils/test'
import { navigateToCommunityDetail } from '../../../../router'

definePageConfig({
  enableShareAppMessage: true,
  navigationStyle: 'custom',
  disableScroll: true
})

type CommunityPost = {
  id: string
  title: string
  cover: string
  images: string[]
  author: { id: string; name: string; avatar: string }
  likes: number
  comments: number
}

const categories = ['推荐', '视频', '直播', '短剧', '搞笑', '头像']

export default defineComponent({
  name: 'CoffeeCommunityPage',
  setup() {
    const current = ref(0)

    const MAX_IMG = 10
    const safeIndex = (n: number) => ((n % MAX_IMG) + MAX_IMG) % MAX_IMG + 1
    const buildPosts = (count = 12, seed = 1): CommunityPost[] => {
      const list: CommunityPost[] = []
      for (let i = 0; i < count; i++) {
        const id = `${seed}-${i + 1}`
        const cover = buildImgUrl(safeIndex(i + seed))
        const imageCount = (i % 5) + 1
        const images = new Array(imageCount)
          .fill(0)
          .map((_, idx) => buildImgUrl(safeIndex(idx + i + seed)))
        list.push({
          id,
          title: ['收容记录', '早安', '别争', '不化妆也很美', '秋日碎拍'][i % 5],
          cover,
          images,
          author: {
            id: `u-${i}`,
            name: ['peachoney', '人民网', '好好生活呀', '吃啥嘞嘞', '今日份美美'][i % 5],
            avatar: buildImgUrl(safeIndex(i + 3))
          },
          likes: 200 + i * 5,
          comments: 50 + i * 2
        })
      }
      return list
    }

    const list = ref<CommunityPost[]>([])
    const pageNo = ref(1)
    const loading = ref(false)
    const hasMore = ref(true)

    const initList = () => {
      pageNo.value = 1
      hasMore.value = true
      list.value = buildPosts(12, current.value + pageNo.value)
    }

    const loadMore = async () => {
      if (loading.value || !hasMore.value) return
      loading.value = true
      const next = buildPosts(10, current.value + pageNo.value + 1)
      list.value = list.value.concat(next)
      pageNo.value += 1
      // 简单示例：加载到第 5 页后认为没有更多
      if (pageNo.value >= 5) hasMore.value = false
      loading.value = false
    }

    // 初始化数据
    initList()

    // 分类切换时重置数据
    watch(current, () => {
      initList()
    })

    const twoCols = computed(() => {
      const left: CommunityPost[] = []
      const right: CommunityPost[] = []
      list.value.forEach((item, idx) => (idx % 2 === 0 ? left.push(item) : right.push(item)))
      return [left, right]
    })

    const Card = (props: { post: CommunityPost }) => {
      const { post } = props
      return (
        <View class="community-card" onClick={() => navigateToCommunityDetail(post.id)}>
          <View class="cover">
            <Image class="image" mode="aspectFill" src={post.cover}></Image>
            <View class="title-mask">
              <Text class="title">{post.title}</Text>
            </View>
          </View>
          <View class="meta">
            <View class="author">
              <Image class="avatar" mode="aspectFill" src={post.author.avatar}></Image>
              <Text class="name">{post.author.name}</Text>
            </View>
            <View class="stats">
              <Icon name="like" size={16}/>
              <Text class="count">{post.likes}</Text>
            </View>
          </View>
        </View>
      )
    }

    return () => (
      <BasePage
        navigator={{
          navigatorStyle: 'blank',
          immersive: true,
          // title: <View class="community-tabs">
          //   {categories.map((label, i) => (
          //     <View
          //       key={label}
          //       class={['tab', current.value === i && 'is-active']}
          //       onClick={() => (current.value = i)}
          //     >
          //       {label}
          //       {current.value === i && <View class="tab-bar"/>}
          //     </View>
          //   ))}
          // </View>,
          titleCentered: true,
          fixedTitle: (
            <View class="community-logo">
              <Text class="logo-text">YESONG</Text>
            </View>
          ),
          navigationBarTextStyleFixed: 'black',
          navigationBarBackgroundColorFixed: '#ffffff',
          navigationBarBackgroundColor: 'rgba(0,0,0,0)'
        }}
        useScrollView={true}
        scrollView={{ onScrollToLower: loadMore, lowerThreshold: 160 }}
        navigatorPlaceholder={true}

      >
        <View class="community-tabs">
          {categories.map((label, i) => (
            <View
              key={label}
              class={['tab', current.value === i && 'is-active']}
              onClick={() => (current.value = i)}
            >
              {label}
              {current.value === i && <View class="tab-bar"/>}
            </View>
          ))}
        </View>
        <View class="coffee-community">
          <View class="community-grid">
            {twoCols.value.map((col, idx) => (
              <View class="grid-col" key={idx}>
                {col.map(item => (
                  <Card post={item} key={item.id}/>
                ))}
              </View>
            ))}
          </View>
          <View class="community-loading">
            {loading.value ? '正在加载...' : hasMore.value ? '下拉加载更多' : '没有更多了'}
          </View>

          {/* 浮动发布按钮（主题色） */}
          <View
            class="coffee-floating-publish"
            onClick={() =>
              navigateTo({
                url: '/packageA/community/publish/index'
              })
            }
          >
            <Text class="icon">+</Text>
          </View>
        </View>
      </BasePage>
    )
  }
})
