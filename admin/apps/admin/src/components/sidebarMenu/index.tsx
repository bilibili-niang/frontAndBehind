import { computed, defineComponent, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon, Menu } from '@pkg/ui'
import { menuTree } from '@/router/auto'
import './style.scss'
import router from '@/router'

export default defineComponent({
  name: 'SidebarMenu',
  setup() {
    const route = useRoute()
    const r = useRouter()

    // 选中与展开状态
    const selectedKeys = computed(() => [route.path])
    const initialOpen = (() => {
      const activeGroup = menuTree.find((g) => g.children?.some((c: any) => c.path === route.path))
      return activeGroup ? [activeGroup.path || activeGroup.title] : []
    })()
    const openKeys = ref<string[]>(initialOpen as string[])
    watch(() => route.path, () => {
      const activeGroup = menuTree.find((g) => g.children?.some((c: any) => c.path === route.path))
      openKeys.value = activeGroup ? [activeGroup.path || activeGroup.title] : []
    })

    // 转换为 Ant Design Vue Menu 的 items
    const items = computed(() =>
      menuTree.map((group) => {
        const key = group.path || group.title
        const children = (group.children || []).map((child) => ({
          key: child.path!,
          label: child.title,
          icon: child.icon ? <Icon name={child.icon}/> : undefined
        }))
        if (children.length > 0) {
          return {
            key,
            label: group.title,
            icon: group.icon ? <Icon name={group.icon}/> : undefined,
            children
          }
        }
        return {
          key,
          label: group.title,
          icon: group.icon ? <Icon name={group.icon}/> : undefined
        }
      })
    )

    const onClick = (info: any) => {
      const key = info?.key
      if (typeof key === 'string' && key) {
        r.push(key)
      }
    }

    return () => (
      <div class="main-sidebar">
        <Menu
          mode="inline"
          items={items.value as any}
          selectedKeys={selectedKeys.value as any}
          openKeys={openKeys.value as any}
          onOpenChange={(keys: string[]) => (openKeys.value = keys)}
          onClick={onClick}
        />
      </div>
    )
  }
})