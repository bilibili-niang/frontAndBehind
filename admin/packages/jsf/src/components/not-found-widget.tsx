import { defineComponent } from 'vue'
import { Alert } from '@pkg/ui'
import { CommonWidgetPropsDefine } from '../types/widget'

export default defineComponent({
  name: 'NotFountWidget',
  props: CommonWidgetPropsDefine,
  setup(props) {
    return () => {
      const widget = String(props.schema.widget ?? props.schema.type)
      return (
        <Alert
          class="ui-scrollbar--hidden"
          style="height:100%;width:100%;padding:4px 8px;"
          message={
            <div style="display:flex;flex-direction:column;">
              <small>找不到控件 "{widget}"</small>
            </div>
          }
          type="error"
          show-icon
        />
      )
      // return <div class="jsf-widget-not-found">"{widget}" 控件未定义</div>
    }
  }
})
