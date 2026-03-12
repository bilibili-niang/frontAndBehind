import './index.scss'
import { defineComponent, computed } from 'vue'
import { Icon } from '@pkg/ui'
import { formatDate } from '@pkg/core'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'ResumeCard',
  props: {
    empty: { type: Boolean, default: false },
    data: {
      type: Object,
      default: () => ({ title: '我的简历', id: 0, createdAt: new Date(), content: '{}' })
    }
  },
  setup(props) {
    const router = useRouter()

    // 解析简历内容
    const resumeContent = computed(() => {
      // 兼容 data 字段（后端返回）和 content 字段（前端 Store）
      const rawContent = props.data?.content || props.data?.data
      console.log('ResumeCard rawContent:', rawContent)
      if (!rawContent) return null
      try {
        const content = typeof rawContent === 'string' 
          ? JSON.parse(rawContent) 
          : rawContent
        console.log('ResumeCard parsed content:', content)
        
        // 兼容旧的 blocks 结构
        if (content.blocks && Array.isArray(content.blocks)) {
          // 这里可以添加逻辑将 blocks 转换为新的 content 结构
          // 或者直接尝试从 blocks 中提取信息
          return {
            ...content,
            // 尝试提取 profile, educations 等
            profile: content.blocks.find((b: any) => b.type === 'profile')?.data || {},
            educations: content.blocks.filter((b: any) => b.type === 'education').map((b: any) => b.data) || [],
            experiences: content.blocks.filter((b: any) => b.type === 'work').map((b: any) => b.data) || [],
          }
        }
        
        // 兼容 content 嵌套（新版结构 wrapper）
        if (content.content && typeof content.content === 'object') {
          return content.content
        }
        
        return content
      } catch (e) {
        console.error('ResumeCard parse error:', e)
        return null
      }
    })

    // 提取关键展示信息
    const displayInfo = computed(() => {
      const c = resumeContent.value
      if (!c) return []
      
      const list = []
      // 基础信息
      if (c.profile?.name) list.push(c.profile.name)
      if (c.profile?.title) list.push(c.profile.title)
      if (c.profile?.mobile || c.profile?.phone) list.push(c.profile.mobile || c.profile.phone)
      if (c.profile?.email) list.push(c.profile.email)
      
      // 教育经历 (取第一条)
      if (c.educations?.length > 0) {
        const edu = c.educations[0]
        if (edu.school) list.push(edu.school)
        if (edu.major) list.push(edu.major)
      }
      
      // 工作经历 (取第一条)
      if (c.experiences?.length > 0) {
        const exp = c.experiences[0]
        if (exp.company) list.push(exp.company)
        if (exp.position) list.push(exp.position)
      }

      console.log('ResumeCard displayInfo:', list)
      return list.filter(Boolean)
    })

    // 生成随机字体大小 (16px - 28px)
    const getRandomFontSize = () => {
      return Math.floor(Math.random() * (28 - 16 + 1)) + 16
    }
    
    // 获取每行的内容片段 (避免每行内容完全一样)
    const getRowContent = (rowIndex: number, allInfo: string[]) => {
      if (allInfo.length === 0) return []
      // 简单算法：每行从不同的索引开始取，循环取值
      const offset = rowIndex % allInfo.length
      // 重新组合数组：[...后半部分, ...前半部分]
      return [...allInfo.slice(offset), ...allInfo.slice(0, offset)]
    }

    return () => {
      if (props.empty) {
        return (
          <div
            class="resume-card resume-card-empty p-1"
            onClick={() => router.push('/resume/create')}
          >
            <div class="empty-icon flex align-center justify-center h-full">
              <div class="icon-wrapper">
                <Icon name="add" size={32} />
              </div>
              <span class="empty-text">新建简历</span>
            </div>
          </div>
        )
      }
      return (
        <div class="resume-card p-0" onClick={() => router.push(`/resume/create?id=${props.data?.id}`)}>
          {/* 缩略图区域 */}
          <div class="preview-area">
            {/* 暂时使用渐变色块代替缩略图 */}
            <div class="preview-placeholder"></div>
            
            {/* 滚动文字信息 - 横向滚动 */}
            {displayInfo.value.length > 0 && (
              <div class="scrolling-info-mask">
                <div class="scrolling-content">
                  {/* 分多行显示，每行横向滚动，每行随机大小 */}
                  {[0, 1, 2, 3, 4].map((rowIndex) => {
                    const rowItems = getRowContent(rowIndex, displayInfo.value)
                    const speed = 20 + (rowIndex * 5) % 15 // 20s - 35s
                    
                    return (
                      <div 
                        class="scroll-row" 
                        key={rowIndex}
                        style={{ 
                          fontSize: `${getRandomFontSize()}px`,
                          // 随机错位
                          transform: `translateX(-${Math.random() * 20}%)`,
                          '--duration': `${speed}s`
                        }}
                      >
                        {/* 重复多次以填满宽度 */}
                        {[0, 1, 2].map((dup) => (
                          <div class="scroll-group" key={dup}>
                            {/* 如果是偶数行，反向显示数组，增加随机感 */}
                            {(rowIndex % 2 === 0 ? rowItems : [...rowItems].reverse()).map((text, i) => (
                              <span class="scroll-item" key={`${rowIndex}-${dup}-${i}`}>{text}</span>
                            ))}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          
          <div class="info-area p-3">
            <div class="title text-truncate">{props.data?.title || '未命名简历'}</div>
            <div class="bottom-info-time">
              {formatDate(props.data?.createdAt || props.data?.created_at || '')}
            </div>
          </div>
          
          {/* 悬浮操作栏 - 后续功能预留 */}
          <div class="hover-actions">
            {/* <div class="action-btn"><Icon name="edit" /></div> */}
          </div>
        </div>
      )
    }
  }
})