import { Icon } from '@anteng/ui'
import { defineComponent } from 'vue'
import './style.scss'
import { useModal } from '@anteng/core'
import { Textarea } from '@tarojs/components'
import { useOrderPayStore } from '../store'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'OrderPayRemark',
  setup() {
    const orderPayStore = useOrderPayStore()
    const { remark } = storeToRefs(orderPayStore)
    const onRemarkClick = () => {
      let value = remark.value
      const modal = useModal({
        title: '修改备注',
        height: 500,
        content: (
          <div class="order-pay-remark__modal">
            <Textarea
              class="order-pay-remark__textarea"
              autoFocus
              placeholder="选填，可输入订单备注"
              maxlength={150}
              adjustPosition
              value={value}
              onInput={e => {
                value = e.detail.value
              }}
            />
            <div class="order-pay-remark__actions">
              <div
                class="order-pay-remark__cancel"
                onClick={() => {
                  modal.close()
                }}
              >
                取消
              </div>
              <div
                class="order-pay-remark__confirm"
                onClick={() => {
                  remark.value = value
                  modal.close()
                }}
              >
                确定
              </div>
            </div>
          </div>
        )
      })
    }
    return () => {
      return (
        <div class="order-pay-remark" onClick={onRemarkClick}>
          <div class="label">订单备注</div>
          <div class="content max-1-line">{remark.value ? remark.value : <div class="color-disabled">无备注</div>}</div>
          <Icon name="right" />
        </div>
      )
    }
  }
})
