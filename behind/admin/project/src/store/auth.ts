import { defineStore } from 'pinia'

export interface UserInfo {
  id: string
  avatar: string | null
}

interface State {
  token: string | null
  userInfo: UserInfo | null
}

const TOKEN_KEY = 'Blade-Auth'
const USER_KEY = 'USER_INFO'

function loadState(): State {
  const token = localStorage.getItem(TOKEN_KEY)
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
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
    },
    clear() {
      this.token = null
      this.userInfo = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },
  },
})
