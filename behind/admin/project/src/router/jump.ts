import router from '@/router'
// 跳转
// 跳转工具页面
export const jumpToTool = () => {
  // router.push({ name: 'tool' })
  router.push('/tool')
}

// 返回
export const jumpBack = () => {
  router.back()
}