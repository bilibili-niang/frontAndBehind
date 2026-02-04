import { Popover } from '@pkg/ui'
import { defineComponent } from 'vue'
import './style.scss'

export default defineComponent({
  name: 'SchemaFormDrafts',
  setup(props, { slots }) {
    return () => {
      return (
        <Popover
          class="jsf_drafts-popup"
          placement="bottom"
          trigger="click"
          content={
            <div class="jsf_drafts">
              <div>
                <strong>暂无草稿</strong>
              </div>
              <small>未完成 编辑／保存 的数据将归档到这里</small>
            </div>
          }
        >
          {slots.default?.()}
        </Popover>
      )
    }
  }
})
