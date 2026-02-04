import { useLoading, useLoadingEnd, useModal, useToast, useUserStore } from '@pkg/core'
import { Input } from '@tarojs/components'
import { defineComponent, ref } from 'vue'
import './nickname.scss'

definePageConfig({
  navigationStyle: 'custom'
})

const NickName = defineComponent({
  name: 'ProfileSettingsNickname',
  emits: {
    close: () => true
  },
  setup(props, { emit }) {
    const focus = ref(false)
    setTimeout(() => {
      focus.value = true
    }, 600)

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
      useLoading()
      userStore
        .setUserProfile({
          nickname: nickname.value
        })
        .then(() => {
          emit('close')
        })
        .finally(() => {
          useLoadingEnd()
        })
    }
    return () => {
      return (
        <div class="profile-settings-nickname">
          <div class="input-wrap">
            <Input
              class="input"
              type="nickname"
              placeholder="请输入新的昵称"
              value={nickname.value}
              onInput={onChange}
              autoFocus={focus.value}
              focus={focus.value}
              onBlur={() => {
                focus.value = false
              }}
            />
          </div>
          <div class="save" onClick={onSave}>
            确定保存
          </div>
        </div>
      )
    }
  }
})

export const onUpdateUserNickname = () => {
  const modal = useModal({
    title: '修改昵称',
    padding: 0,
    content: () => (
      <NickName
        onClose={() => {
          modal.close()
        }}
      />
    )
  })
}
