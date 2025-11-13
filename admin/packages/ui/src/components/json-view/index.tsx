import { defineComponent } from 'vue'
import Node from './node'
import './style.scss'

export default defineComponent({
  name: 'JSONView',
  props: {
    data: {
      type: Object
    },
    name: {
      type: String,
      default: 'data'
    },
    defaultUnfold: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    return () => {
      return (
        <div class="lego-json-view">
          <Node
            symbol={props.name}
            value={props.data || {}}
            path={props.name}
            deepth={0}
            defaultUnfold={props.defaultUnfold}
          />
        </div>
      )
    }
  }
})
