import { reactive, ref } from 'vue'
import router from '@/router'
import { Input, message, Button } from '@pkg/ui'
import { $login } from '@/api'
import { useModal } from '@pkg/core'
import { useAuthStore } from '@/store/auth'
import md5 from 'blueimp-md5'

// 全局登录弹窗可见状态
export const loginVisible = ref(false)

// 待跳转的受保护路由
export let pendingPath: string | null = null
export const setPendingPath = (path: string | null) => {
  pendingPath = path
}

// 登录完成回调队列（用于请求 401 后等待登录再重试）
const loginWaiters: Array<() => void> = []

let ctrl: any = null

function ensureModal() {
  if (ctrl) return ctrl
  const state = reactive({ userName: '', password: '', loading: false })
  const auth = useAuthStore()

  const submit = async () => {
    if (!state.userName || !state.password) {
      message.error('请输入用户名与密码')
      return
    }
    try {
      state.loading = true
      const res = await $login({ userName: state.userName, password: md5(state.password) })
      if (res.success) {
        const { token, userInfo } = res.data
        auth.setAuth(token, userInfo)
        message.success('登录成功')
        notifyLoginSuccess()
      } else {
        message.error(res.msg || '登录失败')
      }
    } catch (e: any) {
      message.error(e?.message || '请求失败')
    } finally {
      state.loading = false
    }
  }

  ctrl = useModal({
    title: '登录',
    width: 420,
    persistent: true,
    content: () => (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <div class="flex flex-col gap-4 p-3">
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
          <button type="submit" style="display:none" />
        </div>
      </form>
    ),
    actions: () => (
      <div class="w-full flex justify-end gap-2">
        <Button variant="text"
                disabled={state.loading}
                onClick={() => closeLoginModal()}>取消</Button>
        <Button color="primary"
                loading={state.loading}
                onClick={submit}>登录</Button>
      </div>
    )
  })
  return ctrl
}

export function openLoginModal() {
  try {

    ensureModal()?.open()
    loginVisible.value = true
  } catch (e) {
    throw new Error(e)
  }
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
  // 如果存在待跳转路径，登录成功后自动重定向
  if (pendingPath) {
    const target = pendingPath
    pendingPath = null
    router.replace(target)
  }
}
