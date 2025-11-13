import { defineComponent } from 'vue'

export const routeMeta = {
  title: 'jsfContent测试页面',
  // 没错,可以控制路由显隐
  hideInMenu: true,
}

export default defineComponent({
  setup() {
    return () => {
      return (
        <div class="jsfContent">
          jsfContent
        </div>
      )
    }
  }
})
