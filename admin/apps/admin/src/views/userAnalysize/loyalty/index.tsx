import { defineComponent } from 'vue'
import type { RouteMeta } from '@/router/routeMeta'

export default defineComponent({
  name: 'componentName',
  props: {},
  emits: [''],
  setup(props, { emit }) {
    return () => {
      return (
        <div>
          忠诚度分析
        </div>
      )
    }
  }
})

export const routeMeta: RouteMeta = {
  title: '忠诚度分析',
  icon: 'user-positioning',
  hideInMenu: true,
  order: 2
}