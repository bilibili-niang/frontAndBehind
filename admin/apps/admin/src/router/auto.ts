import type { RouteRecordRaw } from 'vue-router'
import type { RouteMeta } from '@/router/routeMeta'
import { resumeRoutes } from '@pkg/resume'

// 使用统一的 RouteMeta 类型定义

// 视图组件改为按需加载；仅 meta 采用 eager 导入，避免将所有视图打进一个包
// 排除任何位于 `components` 目录下的 index 文件，防止误注册子组件为路由
const viewModules = import.meta.glob([
  '../views/**/index.{tsx,vue}',
  '!../views/**/components/**/index.{tsx,vue}',
  '!../views/resume/**'
]) as Record<string, () => Promise<any>>
const metaModules = import.meta.glob([
  '../views/**/index.{tsx,vue}',
  '!../views/**/components/**/index.{tsx,vue}',
  '!../views/resume/**'
], {
  eager: true,
  import: 'routeMeta'
}) as Record<string, RouteMeta>

// 将路径 ../views/foo/bar/index.tsx => /foo/bar
const pathFromKey = (key: string) => {
  const clean = key
    .replace(/^\.\.\/views\//, '')
    .replace(/\/index\.(tsx|vue)$/i, '')
  return `/${clean}`
}

const pascal = (s: string) => s
  .split(/[-_\s]/)
  .filter(Boolean)
  .map(w => w.charAt(0).toUpperCase() + w.slice(1))
  .join('')

const toDefaultTitle = (routePath: string) => {
  const seg = routePath.split('/').filter(Boolean).pop() || 'Page'
  return pascal(seg)
}

// 生成 children 路由列表，同时记录原始 meta 以便后续处理 redirect
const rawMetaMap = new Map<string, RouteMeta>()

// 首先构建原始 children，同时记录 meta
const childrenRaw: RouteRecordRaw[] = Object.keys(viewModules).map((key) => {
  const path = pathFromKey(key)
  const name = path.slice(1).replace(/\//g, '-')
  const meta: RouteMeta = (metaModules[key] || {})
  rawMetaMap.set(path, meta)
  const title = meta.title || toDefaultTitle(path)

  return {
    path,
    name,
    icon: meta?.icon,
    meta: {
      title,
      requiresAuth: !!meta.requiresAuth,
      hideInMenu: !!meta.hideInMenu,
      hiddenInMenu: !!meta.hideInMenu,
      order: meta.order,
      icon: meta.icon,
      keepAlive: !!meta.keepAlive,
      // 透传 pureInterface 以便页面实时控制布局元素显示/隐藏
      pureInterface: !!meta.pureInterface,
      // 页面独占模式：仅渲染 RouterView，不显示侧边栏与顶部栏
      purePage: !!meta.purePage,
      // 仅用于运行时判断（不参与菜单显示），保留 hideInProd 信息
      hideInProd: !!meta.hideInProd
    } as any,
    // 组件采用按需加载，避免一次性打包所有视图
    component: viewModules[key] as any
  }
})

// Flatten resumeRoutes and merge into childrenRaw
const flattenRoutes = (routes: any[]) => {
  const res: any[] = []
  routes.forEach((r) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { children, ...rest } = r
    res.push(rest)
    if (children) {
      res.push(...flattenRoutes(children))
    }
  })
  return res
}
const resumeChildren = flattenRoutes(resumeRoutes)
resumeChildren.forEach((r: any) => {
  if (r.path && r.meta) {
    rawMetaMap.set(r.path, r.meta as any)
  }
})
childrenRaw.push(...resumeChildren)

// 生产环境：过滤标记为 hideInProd 的路由，以及其子路由（同一级目录）
const prodHiddenParents = new Set<string>()
if (import.meta.env.PROD) {
  for (const [path, meta] of rawMetaMap.entries()) {
    const segs = (path || '').split('/').filter(Boolean)
    if (segs.length === 1 && meta?.hideInProd) {
      prodHiddenParents.add(segs[0])
    }
  }
}

const children: RouteRecordRaw[] = childrenRaw
  .filter((r) => {
    if (!import.meta.env.PROD) return true
    const meta: any = r.meta || {}
    if (meta.hideInProd) return false
    const segs = (r.path || '').split('/').filter(Boolean)
    const first = segs[0]
    return !prodHiddenParents.has(first)
  })
  .sort((a, b) => {
    const ao = (a.meta as any)?.order ?? 1000
    const bo = (b.meta as any)?.order ?? 1000
    return ao - bo
  })

// 计算每个父级目录的“首个子路由”（按 order 排序后的第一个）
const firstChildPathMap: Record<string, string | undefined> = {}
for (const r of children) {
  const segs = (r.path || '').split('/').filter(Boolean)
  if (segs.length >= 2) {
    const parent = segs[0]
    if (!firstChildPathMap[parent]) {
      firstChildPathMap[parent] = r.path
    }
  }
}

// 增强路由：父级页面若声明 redirect 且为空字符串，则跳转至该目录首个子路由
const enhancedChildren: RouteRecordRaw[] = children.map((r) => {
  const segs = (r.path || '').split('/').filter(Boolean)
  const meta = rawMetaMap.get(r.path || '')
  const rawRedirect = meta?.redirect
  let redirect: string | undefined
  if (typeof rawRedirect === 'string') {
    if (rawRedirect.trim() === '') {
      if (segs.length === 1) {
        const firstChild = firstChildPathMap[segs[0]]
        if (firstChild) redirect = firstChild
      }
    } else {
      redirect = rawRedirect
    }
  }
  return redirect ? { ...r, redirect } : r
})

export const generatedChildrenRoutes: RouteRecordRaw[] = enhancedChildren

// 菜单项结构：支持父子级关系（一级目录与二级目录）
export type MenuItem = {
  title: string
  path?: string
  icon?: string
  order: number
  children: MenuItem[]
}

// 构建父子级菜单树
const buildMenuTree = (): MenuItem[] => {
  const visible = enhancedChildren.filter(r => !(r.meta as any)?.hideInMenu)
  const parents = new Map<string, MenuItem>()

  const ensureParent = (seg: string): MenuItem => {
    let parent = parents.get(seg)
    if (!parent) {
      // 如果存在同名的一级路由，则使用其 meta 作为父级信息
      const parentRoute = enhancedChildren.find(rr => rr.path === `/${seg}`)
      const pm = (parentRoute?.meta || {}) as any
      parent = {
        title: pm.title || pascal(seg),
        path: pm.hideInMenu ? undefined : parentRoute?.path,
        icon: pm.icon,
        order: pm.order ?? 1000,
        children: []
      }
      parents.set(seg, parent)
    }
    return parent
  }

  for (const r of visible) {
    const segs = (r.path || '').split('/').filter(Boolean)
    if (segs.length === 0) continue
    const meta: any = r.meta || {}
    const first = segs[0]
    const parent = ensureParent(first)

    if (segs.length === 1) {
      // 自身就是一级页面：补全父级信息（可点击）
      parent.title = meta.title || parent.title
      parent.path = r.path
      parent.icon = meta.icon || parent.icon
      parent.order = meta.order ?? parent.order
    } else {
      // 二级页面：挂到父级 children
      parent.children.push({
        title: meta.title || pascal(segs[1]),
        path: r.path,
        icon: meta.icon,
        order: meta.order ?? 1000,
        children: []
      })
    }
  }

  const tree = Array.from(parents.values())
  tree.sort((a, b) => a.order - b.order)
  tree.forEach(p => p.children.sort((a, b) => a.order - b.order))
  return tree
}

export const menuTree: MenuItem[] = buildMenuTree()
