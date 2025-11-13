import { SourceView } from '@anteng/ui'
import { defineComponent } from 'vue'
import type { RouteMeta } from '@/router/routeMeta'
import sourceCode from './index.tsx?raw'

export default defineComponent({
  name: 'TemplatePage',
  props: {},
  emits: [''],
  setup(props, { emit }) {
    return () => {
      return (
        <div class="template-page">
          <div class="mb-3">该页面是一个标准的模板展示,你可以把它粘贴进ide的实时模板中</div>
          <SourceView filename="src/views/home/template/index.tsx" code={sourceCode} />
        </div>
      )
    }
  }
})

export const routeMeta: RouteMeta = {
  title: '模板页面',
}




