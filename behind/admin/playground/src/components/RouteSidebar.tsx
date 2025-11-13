import { defineComponent, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import '../assets/route-sidebar-component.css'

type MenuItem = {
  title: string
  fullPath: string
  children?: MenuItem[]
}

function getTitle(r: any) {
  return (r?.meta?.title as string)
    || (typeof r?.name === 'string' ? r.name : '')
    || (r?.path || '/')
      .split('/')
      .filter(Boolean)
      .join(' / ')
    || 'home'
}

function normalize(base: string, child: string) {
  if (child?.startsWith('/')) return child
  if (base === '/' || base === '') return `/${child || ''}`
  return `${String(base).replace(/\/$/, '')}/${child || ''}`
}

export default defineComponent({
  name: 'RouteSidebar',
  setup() {
    const route = useRoute()
    const router = useRouter()

    const menu = computed<MenuItem[]>(() => {
      const routes = (router.options.routes as any[]) || []
      const root = routes.find(r => r.path === '/')
      if (root && Array.isArray(root.children) && root.children.length) {
        return root.children
          .filter((r: any) => !String(r.path).includes(':') && r?.meta?.hidden !== true)
          .map((r: any) => ({
            title: getTitle(r),
            fullPath: normalize(root.path || '/', r.path || ''),
            children: (r.children || [])
              .filter((c: any) => !String(c.path).includes(':') && c?.meta?.hidden !== true)
              .map((c: any) => ({
                title: getTitle(c),
                fullPath: normalize(normalize(root.path || '/', r.path || ''), c.path || ''),
              }))
          }))
      }

      return routes
        .filter(r => r.path && r.path !== '/' && !String(r.path).includes(':') && r?.meta?.hidden !== true)
        .map(r => ({
          title: getTitle(r),
          fullPath: r.path,
          children: (r.children || [])
            .filter((c: any) => !String(c.path).includes(':') && c?.meta?.hidden !== true)
            .map((c: any) => ({
              title: getTitle(c),
              fullPath: normalize(r.path, c.path || ''),
            }))
        }))
    })

    return () => (
      <aside class="route-sidebar">
        <div class="sidebar-title">路由导航</div>
        <nav class="menu">
          <ul>
            {menu.value.map(item => (
              <li class="menu-item" key={item.fullPath}>
                <RouterLink to={item.fullPath} class={{ 'menu-link': true, 'active': route.fullPath === item.fullPath }}>
                  {item.title}
                </RouterLink>
                {item.children?.length ? (
                  <ul class="submenu">
                    {item.children.map(child => (
                      <li key={child.fullPath}>
                        <RouterLink to={child.fullPath} class={{ 'menu-link': true, 'active': route.fullPath === child.fullPath }}>
                          {child.title}
                        </RouterLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    )
  }
})
