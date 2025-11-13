import { Spin } from '@anteng/core'
import { defineComponent } from 'vue'
import type { RouteMeta } from '@/router/routeMeta'

export default defineComponent({
  name: 'componentName',
  props: {},
  emits: [''],
  setup(props, { emit }) {
    return () => {
      return (
        <Spin/>
      )
    }
  }
})

export const routeMeta: RouteMeta = {
  title: 'Spin组件演示',
}