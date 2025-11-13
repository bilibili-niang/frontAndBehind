import { ref, reactive } from 'vue'
import { createModal, Input, Button, notifyError, notifySuccess } from '@pkg/ui'
import { $login } from '@/api'
import { useAuthStore } from '@/store/auth'

// 全局登录弹窗可见状态
export const loginVisible = ref(false)

// 待跳转的受保护路由
export let pendingPath: string | null = null
export const setPendingPath = (path: string | null) => {
  pendingPath = path
}

// 登录完成回调队列（用于请求 401 后等待登录再重试）
const loginWaiters: Array<() => void> = []

let ctrl: ReturnType<typeof createModal> | null = null

function ensureModal() {
  if (ctrl) return ctrl
  const state = reactive({ userName: '', password: '', loading: false })
  const auth = useAuthStore()
  const UiButton = Button as any

  const submit = async () => {
    if (!state.userName || !state.password) {
      notifyError('请输入用户名与密码')
      return
    }
    try {
      state.loading = true
      const res = await $login({ userName: state.userName, password: state.password })
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
      state.loading = false
    }
  }

  ctrl = createModal({
    title: '登录',
    width: 420,
    persistent: true,
    content: () => (
      <div class="flex flex-col gap-4">
        <Input
          label="用户名"
          variant="outlined"
          density="comfortable"
          hideDetails
          modelValue={state.userName}
          onUpdate:modelValue={(v: string) => (state.userName = v)}
        />
        <Input
          label="密码"
          type="password"
          variant="outlined"
          density="comfortable"
          hideDetails
          modelValue={state.password}
          onUpdate:modelValue={(v: string) => (state.password = v)}
        />
      </div>
    ),
    actions: () => (
      <div class="w-full flex justify-end gap-2">
        <UiButton variant="text" disabled={state.loading} onClick={() => closeLoginModal()}>取消</UiButton>
        <UiButton color="primary" loading={state.loading} onClick={submit}>登录</UiButton>
      </div>
    )
  })
  return ctrl
}

export function openLoginModal() {
  ensureModal().open()
  loginVisible.value = true
}

export function closeLoginModal() {
  ensureModal().close()
  loginVisible.value = false
}

export function waitForLogin(): Promise<void> {
  return new Promise<void>((resolve) => {
    loginWaiters.push(resolve)
  })
}

export function notifyLoginSuccess() {
  // 关闭弹窗并唤醒所有等待者
  closeLoginModal()
  while (loginWaiters.length) {
    const fn = loginWaiters.shift()!
    try {
      fn()
    } catch (_e) {
      void 0
    }
  }
}
