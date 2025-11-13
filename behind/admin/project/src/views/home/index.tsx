import { defineComponent, ref } from 'vue'
import { jumpToTool } from '@/router/jump'
import { $login } from '@/api'
import { useAuthStore } from '@/store/auth'
import { notifySuccess, notifyError } from '@pkg/ui'

export default defineComponent({
  name: 'HomeLogin',
  setup() {
    const userName = ref('')
    const password = ref('')
    const loading = ref(false)
    const auth = useAuthStore()

    const doLogin = async () => {
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
          // 登录成功后跳转工具页（可按需修改）
          jumpToTool()
        } else {
          notifyError(res.msg || '登录失败')
        }
      } catch (e: any) {
        notifyError(e?.message || '请求失败')
      } finally {
        loading.value = false
      }
    }

    return () => (
      <div class="flex flex-col items-center w-full">
        <div class="w-80 pt-10">
          <div class="mb-4">
            <label class="block mb-2">用户名</label>
            <input
              class="w-full border rounded px-3 py-2"
              placeholder="请输入用户名"
              value={userName.value}
              onInput={(e) => (userName.value = (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="mb-6">
            <label class="block mb-2">密码</label>
            <input
              class="w-full border rounded px-3 py-2"
              type="password"
              placeholder="请输入密码"
              value={password.value}
              onInput={(e) => (password.value = (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="flex justify-between items-center">
            <button
              class="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
              onClick={doLogin}
              disabled={loading.value}
            >
              {loading.value ? '登录中...' : '登录'}
            </button>
            <button
              class="px-4 py-2 text-primary-600 hover:underline"
              onClick={() => {
                jumpToTool()
              }}
            >
              先看看工具
            </button>
          </div>
        </div>
      </div>
    )
  },
})
