import { emitter } from '@anteng/core'

// TODO 应该使用 core 来管理 useAction，子应用内注册自己的 actions

export const useAction = (action: any) => {
  emitter.trigger('useAction', action)
}

export type Action = any
