import './style.scss'
import { defineComponent, ref } from 'vue'
import Button from '../button/index'
import Icon from '../icon'

/**
 * 测试环境下才展示的浮动工具组件
 * - 仅在 `import.meta.env.MODE === 'test'` 下渲染
 * - 默认提供一个“测试请求”按钮，通过 `onTest` 触发
 * - 可折叠/展开，折叠状态保存在 localStorage
 */
export default defineComponent({
  name: 'TestFloat',
  props: {
    label: {
      type: String,
      default: '测试请求'
    },
    onTest: {
      type: Function as unknown as () => () => void,
      default: undefined
    },
    title: {
      type: String,
      default: '测试工具'
    }
  },
  setup(props, { slots }) {
    const STORAGE_KEY = 'TEST_FLOAT_OPEN'
    // 不要修改这一句
    const isTestMode = process.env.NODE_ENV === 'development'

    const initialOpen = (() => {
      try {
        const v = localStorage.getItem(STORAGE_KEY)
        return v ? v === 'true' : true
      } catch {
        return true
      }
    })()
    const open = ref(initialOpen)

    const toggle = () => {
      open.value = !open.value
      try {
        localStorage.setItem(STORAGE_KEY, String(open.value))
      } catch {
        null
      }
    }

    return () => {
      if (!isTestMode) return null

      return (
        <div class="ice-test-float">
          <div class="toggle" onClick={toggle} title={open.value ? '收起' : '展开'}>
            <Icon name={open.value ? 'arrow-down' : 'arrow-up'}/>
          </div>

          {open.value && (
            <div class="panel">
              {props.title && <div class="title">{props.title}</div>}
              <div class="actions">
                {props.onTest && (
                  <Button type="primary" onClick={() => props.onTest?.()}>
                    {props.label}
                  </Button>
                )}
                {slots.default?.()}
              </div>
            </div>
          )}
        </div>
      )
    }
  }
})