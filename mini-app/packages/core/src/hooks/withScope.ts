import { useRouter } from '@tarojs/taro'

/** 事件名称添加页面作用域 */
const withScope = (key: string) => {
  const router = useRouter()
  if (!router) return key
  return `${router.path}/${router.params.$taroTimestamp}/${key}`
}

export default withScope
