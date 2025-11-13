import './index.scss'
import { defineComponent, onMounted, ref } from 'vue'
import type { RouteMeta } from '@/router/routeMeta'
import { useAuthStore } from '@/store/auth'
import { Button, Input, message } from '@anteng/ui'
import { redirectIndex } from '@/router'

export default defineComponent({
  name: 'HomeLogin',
  setup() {
    const userName = ref('')
    const password = ref('')
    const loading = ref(false)
    const auth = useAuthStore()

    // 检查用户是否已登录，如果已登录则跳转到首页
    onMounted(() => {
      if (auth.isLogin) {
        redirectIndex()
      }
    })

    const handleLogin = async () => {
      if (!userName.value || !password.value) {
        return message.error('请输入用户名与密码')
      }
      loading.value = true
      try {
        const res = {
          success: true,
          data: {
            token: 'userTokenStr',
            userInfo: {
              id: 1234,
              avatar: null,
              userName: 'admin'
            }
          },
          msg: '测试用户登录接口',
          code: 200
        }

        console.log('res:')
        console.log(res)

        if (res.success) {
          auth.setAuth(res.data.token, {
            id: res.data.userInfo.id,
            avatar: res.data.userInfo.avatar,
            userName: res.data.userInfo.userName
          })
          message.success('登录成功')
          redirectIndex()
        } else {
          message.error(res.msg || '登录失败')
        }
      } catch (e: any) {
        message.error(e?.message || '请求失败')
      } finally {
        loading.value = false
      }
    }

    return () => (
      <div class="home-login">
        <div class="home-login__form">
          <Input v-model={userName.value} placeholder="用户名" style={{ marginBottom: '8px' }}/>
          <Input v-model={password.value} type="password" placeholder="密码" style={{ marginBottom: '8px' }}/>
          <Button type="primary" loading={loading.value} onClick={handleLogin}>登录</Button>
        </div>
      </div>
    )
  },
})

export const routeMeta: RouteMeta = {
  title: '登录',
  hideInMenu: true,
}
