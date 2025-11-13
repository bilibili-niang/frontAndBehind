import { flatten } from 'lodash'
import type { RouteRecordRaw } from 'vue-router'

export const extractRoutes = (routes: RouteRecordRaw[], parentId = ''): any[] => {
  return flatten(
    routes.map((item, index) => {
      const name: string = String(item.name || pathToName(item.path))
      const children = item.children ?? []
      return [
        {
          path: item.path,
          alias: name,
          hidden: item.meta?.hiddenInMenu ? 'true' : 'false',
          code: name,
          parentId,
          name: item.meta?.title ?? '',
          source: item.meta?.icon ?? '',
          component: item.children?.length! > 0 ? 'RouterView' : 'component',
          category: '1',
          sort: index + 1,
          action: '0',
          redirect: item.redirect ?? ''
        },
        ...extractRoutes(children, name)
      ]
    })
  )
}

/**
 * 将路由路径转换为小写短横连接(name)字符串，处理驼峰和参数
 * @param path 路由路径，例如 '/userProfile/edit' 或 '/user/:id/profile'
 * @returns 转换后的name字符串，例如 'user-profile-edit' 或 'user-id-profile'
 */
function pathToName(path: string): string {
  // 移除开头的斜杠(如果有)
  let normalizedPath = path.startsWith('/') ? path.slice(1) : path

  // 移除结尾的斜杠(如果有)
  normalizedPath = normalizedPath.endsWith('/') ? normalizedPath.slice(0, -1) : normalizedPath

  // 按斜杠分割路径段
  const segments = normalizedPath.split('/')

  // 过滤掉空字符串(可能由于连续斜杠产生)
  const filteredSegments = segments.filter((segment) => segment.length > 0)

  // 处理每个段：如果是参数(以:开头)，只取参数名；如果是驼峰，转换为短横线小写
  const name = filteredSegments
    .map((segment) => {
      // 处理参数（如 :id）
      if (segment.startsWith(':')) {
        return segment.slice(1).toLowerCase()
      }

      // 处理驼峰（如 userProfile）
      return segment.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).toLowerCase()
    })
    .join('-')

  return name
}
