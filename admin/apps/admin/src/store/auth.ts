import { defineStore } from 'pinia'
import { LOGIN_IDENTITY } from '@pkg/config'

export interface UserInfo {
  id: string
  avatar: string | null
  userName: string
}

interface State {
  token: string | null
  userInfo: UserInfo | null
}

const USER_KEY = 'USER_INFO'

function loadState(): State {
  const token = localStorage.getItem(LOGIN_IDENTITY)
  const rawUser = localStorage.getItem(USER_KEY)
  const userInfo = rawUser ? (JSON.parse(rawUser) as UserInfo) : null
  return { token, userInfo }
}

export const useAuthStore = defineStore('auth', {
  state: (): State => ({ ...loadState() }),
  getters: {
    isLogin: (s) => !!s.token,
  },
  actions: {
    setAuth(token: string, userInfo: UserInfo) {
      this.token = token
      this.userInfo = userInfo
      localStorage.setItem(LOGIN_IDENTITY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
    },
    clear() {
      this.token = null
      this.userInfo = null
      localStorage.removeItem(LOGIN_IDENTITY)
      localStorage.removeItem(USER_KEY)
    },
    // 从本地存储初始化登录状态（若存在则设置到 store）
    initFromLocal() {
      const { token, userInfo } = loadState()
      if (token && userInfo) {
        this.token = token
        this.userInfo = userInfo
      }
    }
  },
})
