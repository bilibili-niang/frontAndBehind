import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import './app.scss'

export default defineComponent({
  name: 'App',
  setup() {
    const init = () => {
      // 获取本地token
      const token = localStorage.getItem('token')
      if (token) {
        console.log(token)
      } else {
        // 用户已经登录
        console.log('登录了')
      }
      setTimeout(() => {
        document.getElementById('app')?.setAttribute('data-mounted', 'true')
      }, 700)
    }
    init()
    return () => {
      return (
        <div class="app-page">
          <RouterView/>
        </div>
      )
    }
  }
})
