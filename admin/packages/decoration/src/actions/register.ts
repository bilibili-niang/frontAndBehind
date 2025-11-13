import { registerActions } from '@anteng/core'
import openPage from './open-page'

// 暴露注册函数，避免在包加载阶段产生循环依赖
export const registerDecorationActions = () => {
  registerActions('common', [openPage])
}

export default registerDecorationActions