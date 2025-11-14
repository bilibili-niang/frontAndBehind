import { defineComponent } from 'vue'
import { RouteMeta } from '@/router/routeMeta'
import { useSearchTable } from '@anteng/core'

export default defineComponent({
  name: 'componentName',
  props: {},
  emits: [''],
  setup(props, { emit }) {

    const { table } = useSearchTable({
      title: ''
    })

    return () => {
      return (
        <div>

        </div>
      )
    }
  }
})
export const routeMeta: RouteMeta = {
  title: '简历列表',
  // 是否在菜单中隐藏
  hideInMenu: false,
  order: 1
}
