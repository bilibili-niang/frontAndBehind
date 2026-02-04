import { BasePage, navigateBack, useToast, useUserStore } from '@pkg/core'
import { Input } from '@tarojs/components'
import { defineComponent, ref } from 'vue'
import './nickname.scss'

definePageConfig({
  navigationStyle: 'custom'
})

export default defineComponent({
  name: 'ProfileSettingsNickname',
  setup() {
    const userStore = useUserStore()
    const nickname = ref('')
    const onChange = e => {
      nickname.value = e.detail.value
    }
    const onSave = () => {
      if (!nickname.value) {
        useToast('昵称不能为空')
        return void 0
      }
      userStore
        .setUserProfile({
          nickname: nickname.value
        })
        .then(() => {
          navigateBack()
        })
    }
    return () => {
      return (
        <BasePage>
          <div class="profile-settings-nickname">
            <div class="input-wrap">
              <Input
                class="input"
                type="nickname"
                placeholder="请输入新的昵称"
                autoFocus
                value={nickname.value}
                onInput={onChange}
              />
            </div>
            <div class="save" onClick={onSave}>
              确定保存
            </div>
          </div>
        </BasePage>
      )
    }
  }
})
