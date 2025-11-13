import { defineComponent } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { useObjectFiled } from '../../../../utils/field'

export default defineComponent({
  name: 'w_object',
  props: CommonWidgetPropsDefine,
  pure: true,
  inheritAttrs: false,
  setup(props) {
    const { CommonObjectFieldContent } = useObjectFiled(props)
    return () => {
      return (
        <div {...props.config} class="w_object">
          {CommonObjectFieldContent.value}
        </div>
      )
    }
  }
})
