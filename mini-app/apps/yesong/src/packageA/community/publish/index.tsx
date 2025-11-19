import { defineComponent, ref } from 'vue'
import { BasePage } from '@anteng/core'
import { View, Text, Textarea, Input } from '@tarojs/components'
import './style.scss'

definePageConfig({
  navigationStyle: 'custom',
  disableScroll: true
})

export default defineComponent({
  name: 'CommunityPublishPage',
  setup() {
    const title = ref('')
    const content = ref('')
    return () => (
      <BasePage
        navigator={{
          title: '发布',
          navigationBarBackgroundColorFixed: '#ffffff',
          navigationBarTextStyleFixed: 'black'
        }}
        useScrollView={true}
      >
        <View class="community-publish">
          <View class="form-item">
            <Text class="label">标题</Text>
            {/* 静态占位：仅呈现 UI，不提交 */}
            <Input class="input" value={title.value} placeholder="请输入标题（静态示例）" />
          </View>
          <View class="form-item">
            <Text class="label">内容</Text>
            <Textarea class="textarea" value={content.value} placeholder="记录你的想法（静态示例）" />
          </View>
          <View class="upload-hint">图片/视频上传模块占位（静态）</View>

          <View class="publish-actions">
            <View class="btn ghost">保存草稿（静态）</View>
            <View class="btn primary">发布（静态）</View>
          </View>
        </View>
      </BasePage>
    )
  }
})