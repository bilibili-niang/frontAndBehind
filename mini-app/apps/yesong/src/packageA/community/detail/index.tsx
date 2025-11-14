import { defineComponent, ref } from 'vue'
import { BasePage } from '@anteng/core'
import { Image, Text, Video, View } from '@tarojs/components'
import { buildImgUrl } from '../../../utils/test'
import './style.scss'
import { REQUEST_DOMAIN } from '../../../api/request'

definePageConfig({
  navigationStyle: 'custom',
  disableScroll: true,
  enableShareAppMessage: true
})

export default defineComponent({
  name: 'CommunityDetailPage',
  setup() {
    // 假数据：实际接入后端后替换
    const MAX_IMG = 10
    const safeIndex = (n: number) => ((n % MAX_IMG) + MAX_IMG) % MAX_IMG + 1
    const randomHasVideo = Math.random() < 0.5
    const detail = {
      id: 'demo-detail',
      title: '今日份随手拍｜轻烟雾眼妆',
      author: { name: 'peachoney', avatar: buildImgUrl(safeIndex(3)) },
      likes: 5520,
      content:
        '秋色正浓，随手记录一些日常妆容与心情碎片。眼影选择了偏橘棕色系，搭配薄涂唇釉，整体更适合通勤～',
      images: [1, 2, 3, 4, 5].map(i => buildImgUrl(safeIndex(i))),
      // 演示：随机决定是否存在视频。接入后端时替换为真实字段。
      video: randomHasVideo
        ? REQUEST_DOMAIN+'/video/1.mp4'
        : undefined
    }

    const shuffle = <T, >(arr: T[]): T[] => arr
      .map(item => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item)

    // 只在初始化时打乱一次，避免滚动过程中重新渲染导致闪烁
    const shuffledImages = ref<string[]>(shuffle(detail.images))

    return () => (
      <BasePage
        navigator={{
          title: detail.title,
          navigationBarBackgroundColorFixed: '#ffffff',
          navigationBarTextStyleFixed: 'black'
        }}
        useScrollView={true}
      >
        <View class="community-detail">
          <View class="detail-header">
            <Image class="avatar" mode="aspectFill" src={detail.author.avatar}></Image>
            <View class="author-info">
              <Text class="name">{detail.author.name}</Text>
              <Text class="likes">{detail.likes} 赞</Text>
            </View>
          </View>
          <View class="detail-title">{detail.title}</View>
          <View class="detail-content">{detail.content}</View>
          <View class="detail-media">
            {detail.video && (
              <Video
                class="detail-video"
                src={detail.video}
                controls={true}
                autoplay={false}
                enableProgressGesture={true}
                direction={0}
              />
            )}
            {shuffledImages.value.map((src) => (
              <Image key={src} class="image" mode="widthFix" src={src} lazyLoad={true}/>
            ))}
          </View>

          {/* 静态评论区 */}
          <View class="comments">
            <View class="comments__title">评论</View>
            {[1, 2, 3].map(i => (
              <View key={i} class="comment-item">
                <Image class="avatar" mode="aspectFill" src={buildImgUrl(((i % 10) + 10) % 10)}/>
                <View class="main">
                  <View class="meta">
                    <Text class="name">用户 {i}</Text>
                    <Text class="time">· 1小时前</Text>
                  </View>
                  <View class="content">这是一条示例评论内容，接入后端后替换为真实数据。</View>
                  <View class="actions">
                    <Text class="action like">赞</Text>
                    <Text class="action reply">回复</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

        </View>
      </BasePage>
    )
  }
})