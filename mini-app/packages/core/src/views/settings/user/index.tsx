import { defineComponent } from 'vue'
import './style.scss'
import { type Schema, SchemaForm } from '@anteng/jsf'
import useUserStore from '../../../stores/user'
import { storeToRefs } from 'pinia'
export default defineComponent({
  name: 'SettingsAbout',
  setup() {
    const userStore = useUserStore()
    const { userInfo } = storeToRefs(userStore)
    const schema: Schema = {
      title: '用户信息',
      type: 'object',
      properties: {
        account: {
          title: '账户',
          type: 'string',
          readonly: true
        },
        avatar: {
          title: '头像',
          type: 'object',
          widget: 'image',
          config: {
            width: 100,
            ratio: '1:1',
            simple: true,
            compact: true
          },
          readonly: true
        },
        name: {
          title: '昵称',
          type: 'string',
          readonly: true
        },
        realName: {
          title: '真实姓名',
          type: 'string',
          readonly: true
        },
        phone: {
          title: '手机号',
          type: 'string',
          readonly: true
        }
      }
    }
    return () => {
      const data = { ...userInfo.value }
      return (
        <div class="settings-user" id="settings-user-info">
          <SchemaForm schema={schema} value={data} onChange={() => {}} />
        </div>
      )
    }
  }
})
