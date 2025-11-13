import './index.scss'
import { defineComponent } from 'vue'
import { ScrollContainer } from '@anteng/ui'
import type { RouteMeta } from '@/router/routeMeta'

export default defineComponent({
  name: 'componentName',
  props: {},
  emits: [''],
  setup(props, { emit }) {
    return () => {
      return (
        <div class="container">
          <ScrollContainer
            thickness={8}
            autoHide={false}
          >
            <div class="content"></div>
          </ScrollContainer>
        </div>
      )
    }
  }
})

export const routeMeta: RouteMeta = {
  title: 'ScrollContainer组件演示',
}