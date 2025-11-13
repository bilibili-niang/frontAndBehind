import { defineComponent } from 'vue'
import { Button } from '@pkg/ui'
import { useCrud } from '@pkg/core'
import './index.scss'
import router from '@/router'

// 定义 useCrud 的选项类型
interface CrudOptions {
  title: string;
  schema: any; // 根据实际需要定义 schema 类型
}

export default defineComponent({
  name: 'HomeLogin',
  setup() {
    // 提供必要的 useCrud 选项
    const crudOptions: CrudOptions = {
      title: '商品',
      schema: {
        title: '名字',
        type: 'string',
      }
    }

    const { onCreate } = useCrud(crudOptions)

    return () => (
      <div class="home-container">
        <h2>按钮组件测试</h2>

        {/* 测试 1: 使用 @pkg/ui 的 Button */}
        <div class="test-case">
          <h3>1. @pkg/ui 的 Button 组件</h3>
          <div class="button-wrapper">
            <Button
              onClick={() => {
                onCreate()
                console.log()
              }}
            >
              测试
            </Button>
          </div>
          <Button
            onClick={() => {
              router.push('/jsf')
            }}
          >
            跳转jsf页面路由
          </Button>
        </div>

      </div>
    )
  },
})
