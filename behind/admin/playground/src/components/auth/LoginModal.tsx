import { defineComponent, ref } from 'vue'
import { openLoginModal, closeLoginModal, loginVisible, notifyLoginSuccess } from '@/composables/authFlow'
import { $login } from '@/api'
import { useAuthStore } from '@/store/auth'
import { notifyError, notifySuccess, Modal, Input, Button } from '@pkg/ui'

export default defineComponent({
  name: 'LoginModal',
  setup() {
    const auth = useAuthStore()
    // 由于直接 re-export 的 VBtn 的 TSX 事件类型在本工程下不完全，断言为 any 以避免 onClick 类型报错
    const UiButton = Button as any
    const userName = ref('')
    const password = ref('')
    const loading = ref(false)

    const submit = async () => {
      if (!userName.value || !password.value) {
        notifyError('请输入用户名与密码')
        return
      }
      try {
        loading.value = true
        const res = await $login({ userName: userName.value, password: password.value })
        if (res.success) {
          const { token, userInfo } = res.data
          auth.setAuth(token, userInfo)
          notifySuccess('登录成功')
          notifyLoginSuccess()
        } else {
          notifyError(res.msg || '登录失败')
        }
      } catch (e: any) {
        notifyError(e?.message || '请求失败')
      } finally {
        loading.value = false
      }
    }

    const onClose = () => {
      closeLoginModal()
    }

    return () => (
      <Modal
        modelValue={loginVisible.value}
        onUpdate:modelValue={(v: boolean) => (v ? openLoginModal() : onClose())}
        title="登录"
        width={420}
        persistent
        v-slots={{
          actions: () => (
            <div class="w-full flex justify-end gap-2">
              <UiButton variant="text" onClick={onClose} disabled={loading.value}>取消</UiButton>
              <UiButton color="primary" onClick={submit} loading={loading.value}>登录</UiButton>
            </div>
          )
        }}
      >
        <div class="flex flex-col gap-4">
          <Input
            label="用户名"
            variant="outlined"
            density="comfortable"
            hideDetails
            modelValue={userName.value}
            onUpdate:modelValue={(v: string) => (userName.value = v)}
          />
          <Input
            label="密码"
            type="password"
            variant="outlined"
            density="comfortable"
            hideDetails
            modelValue={password.value}
            onUpdate:modelValue={(v: string) => (password.value = v)}
          />
        </div>
      </Modal>
    )
  }
})
