import { Button, Timeline, TimelineItem } from '@pkg/ui'
import { computed, defineComponent, type PropType, shallowRef } from 'vue'
import './style.scss'
import { PageView } from '../../../../../router'

export default defineComponent({
  name: '',
  props: {
    stpes: {
      type: Array as PropType<
        {
          title: string
          action: any
          description: any
        }[]
      >,
      required: true
    },
    currentStep: {
      type: Number,
      required: true
    }
  },
  setup(props, { slots }) {
    const baseSteps = shallowRef([
      {
        title: '开通微信支付能力',
        action: <Button type="primary">进件</Button>,
        description: <p>为使用户可以在购买商品时使用微信完成支付，请完成微信支付进件申请</p>
      },
      {
        title: '提交审核并发布小程序',
        action: <Button type="primary">发布</Button>,
        description: <p>填写小程序名称、头像、介绍、类目后提交审核，审核通过后即成功上线小程序。</p>
      }
    ])
    const steps = computed(() => {
      return [...props.stpes, ...baseSteps.value]
    })
    return () => {
      return (
        <PageView>
          <div class="weapp-bind-page">
            <Timeline>
              {slots.default?.()}
              {steps.value.map((item, index) => {
                return (
                  <TimelineItem
                    class={props.currentStep < index && '--disabled'}
                    dot={<i class="weapp-bind-step">{index + 1}</i>}
                  >
                    <section class="weapp-bind-section">
                      <h3>
                        {item.title}&emsp;
                        {item.action}
                      </h3>
                      {item.description}
                    </section>
                  </TimelineItem>
                )
              })}
            </Timeline>
          </div>
        </PageView>
      )
    }
  }
})
