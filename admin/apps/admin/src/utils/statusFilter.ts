// Promise.allSettled的状态过滤,只获取 fulfilled 的状态
export function allSettledFulfilled(item: any) {
  return item.status === 'fulfilled'
}

// 去重过滤
export function uniqueFilter(items: any[]) {
  return [...new Set(items)]
}
