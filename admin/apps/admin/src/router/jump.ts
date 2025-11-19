import router from '@/router'
// 跳转首页
export const redirectIndex = () => {
  router.replace('/home/template')
}

// 返回
export const jumpBack = () => {
  router.back()
}
// 用户新建简历
export const jumpCreateResume = () => {
  router.push('/resume/create')
}