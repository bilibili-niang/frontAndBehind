import { defineComponent } from 'vue'
import './style.scss'
import Nav from '../../../../canvas-components/components/navigator/basic'

export default defineComponent({
  name: 'w_navigator-selector',
  setup() {
    return () => {
      return <div class='w_navigator-selector'>
        {/* <img src={nav1} alt="" r/> */}
        <Nav />
      </div>
    }
  }
})
