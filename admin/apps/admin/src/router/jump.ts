import router from '@/router'
// 跳转首页
export const redirectIndex = () => {
  router.replace('/home/template')
}

// 返回
export const jumpBack = () => {
  router.back()
}