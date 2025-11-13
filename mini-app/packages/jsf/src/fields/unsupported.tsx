import { defineComponent } from 'vue'
import { commonFieldPropsDefine } from '../types/field'

export default defineComponent({
  name: 'UnsupportedFields',
  props: {
    ...commonFieldPropsDefine
  },
  setup(props) {
    return () => {
      return <div class="jsf_field--null">不支持 {props.schema.type} 类型</div>
    }
  }
})
