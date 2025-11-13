import { LOGIN_IDENTITY } from '@anteng/config'
/*
 * 从本地token中判断用户是否登录
 * */

export const localJudgmentLogin = () => {
  return localStorage.getItem(LOGIN_IDENTITY)
}