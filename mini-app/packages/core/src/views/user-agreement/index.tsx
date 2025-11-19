import { PropType, computed, defineComponent, ref } from 'vue'
import './style.scss'
import { useModal, useModalActions } from '../../hooks'
import { navigateTo } from '../../utils'
import RichText from '../../components/rich-text'
import { ScrollTab, ScrollTabItem } from '@anteng/ui'

export const UserAgreementPage = defineComponent({
  name: 'P_User-Agreement',
  props: {
    title: String,
    list: {
      type: Array as PropType<any[]>
    }
  },
  setup(props, { slots }) {
    const list = computed<any[]>(() => {
      return (props?.list || []).filter(i => i)
    })

    const current = ref(0)
    const currentContent = computed(() => {
      return list.value[current.value]?.content || '<p style="opacity:0.4">暂无内容</p>'
    })
    return () => {
      return (
        <div class="p_user-agreement">
          <div class="p_user-agreement__header scroller--hidden">
            <ScrollTab current={current.value}>
              <div class="p_user-agreement__header-content">
                {list.value.map((item, index) => {
                  return (
                    <ScrollTabItem>
                      <div
                        class={['p_user-agreement__header-item clickable', index === current.value && 'active']}
                        onClick={() => {
                          current.value = index
                        }}
                      >
                        《{item.title}》
                      </div>
                    </ScrollTabItem>
                  )
                })}
              </div>
            </ScrollTab>
          </div>
          <div class="p_user-agreement__content">
            <RichText content={currentContent.value} />
          </div>
          {slots.default?.()}
        </div>
      )
    }
  }
})

export const useUserAgreement = (options: { type?: number; link?: string; title: string; list: any[] }) => {
  if (options.type === 2) {
    navigateTo({
      url: `/packageMain/web?url=${encodeURIComponent(options.link!)}`
    })
    return void 0
  }

  const { Actions } = useModalActions([
    {
      text: '我知道了',
      primary: true,
      onClick: () => {
        modal.close()
      }
    }
  ])

  const modal = useModal({
    title: options.title ?? '用户服务协议',
    height: 'max',
    padding: 0,
    backgroundColor: '#fff',
    content: () => {
      return (
        <UserAgreementPage {...options}>
          <Actions />
        </UserAgreementPage>
      )
    }
  })
}
