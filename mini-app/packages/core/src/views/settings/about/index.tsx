import { defineComponent } from 'vue'
import './style.scss'
import { Button } from '@anteng/ui'
export default defineComponent({
  name: 'SettingsAbout',
  setup() {
    return () => {
      return (
        <div class="settings-about">
          <img class="settings-about__logo" src={''} />
          <p>应用信息，版本号，用户协议，联系客服，bug反馈...等内容放这里</p>
          <a href="https://null.cn" target="_blank">
            <Button shape="round" type="primary">
              查看官网
            </Button>
          </a>
        </div>
      )
    }
  }
})
