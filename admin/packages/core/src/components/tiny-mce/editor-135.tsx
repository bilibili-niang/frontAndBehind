import { Button, Checkbox, TabPane, Tabs } from '@pkg/ui'
import { defineComponent, ref } from 'vue'
import Guide1 from './tiny-mce-guide-135-1.png'
import Guide2 from './tiny-mce-guide-135-2.jpg'
import Guide3 from './tiny-mce-guide-135-3.jpg'

export default defineComponent({
  name: '',
  emits: {
    close: () => true,
    start: () => true
  },
  setup(props, { emit }) {
    const editorRef = ref<any>()

    const open135 = () => {
      if (noHint.value) {
        localStorage.setItem('skip-tiny-mce-135-guide', 'true')
      }
      emit('close')
      emit('start')
    }

    const noHint = ref(localStorage.getItem('skip-tiny-mce-135-guide') === 'true')

    // if (noHint.value) {
    //   open135()
    // }

    return () => {
      return (
        <div style="width:640px; max-height:80vh; overflow:hidden auto; padding: 0 24px 24px 24px; margin-top: -12px;">
          <div style="position:absolute;top:-32px;right:64px;z-index:10;">
            <Checkbox
              style="margin-right:12px;"
              checked={noHint.value}
              onChange={(e) => (noHint.value = e.target.checked)}
            >
              不再提示
            </Checkbox>
            <Button type="primary" onClick={open135}>
              我已知晓，前往编辑
            </Button>
          </div>
          <Tabs>
            <TabPane key={1} tab="方式一">
              <div style="margin: 12px 0 12px 0;">
                <strong>
                  1. 点击上方「<a onClick={open135}>前往编辑</a>」按钮，进入到135编辑器页面。
                </strong>
              </div>
              <div style="margin: 12px 0 12px 0;">
                <strong>
                  2. 编辑完成后，点击下图所示「<a>完成编辑</a>」按钮，回到本页面，图文将自动同步到本编辑器。
                </strong>
              </div>
              <img style="width:100%" src={Guide1} />
            </TabPane>
            <TabPane key={2} tab="方式二">
              <div style="margin: 12px 0 12px 0;">
                <strong>
                  1. 点击上方「<a onClick={open135}>前往编辑</a>」按钮，进入到135编辑器页面，编辑完成后，复制源代码。
                </strong>
              </div>
              <img style="width:100%" src={Guide2} />
              <div style="margin: 24px 0 12px 0;">
                <strong>
                  2. 回到本页面，点击「<a>源代码</a>」按钮，将内容粘贴即可。
                </strong>
              </div>
              <img style="width:100%" src={Guide3} />
            </TabPane>
          </Tabs>
        </div>
      )
      return (
        <iframe
          style="width:100%;height:80vh"
          ref={editorRef}
          src="https://www.135editor.com/beautify_editor.html?callback=true&appkey="
        />
      )
    }
  }
})
