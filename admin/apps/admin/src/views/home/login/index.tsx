import { defineComponent } from 'vue'
import { Button, Card } from '@anteng/ui'
import type { RouteMeta } from '@/router/routeMeta'

// 当前工作区内已存在的可选应用列表（静态）
// 可按需在后续增加其它应用及其 base 前缀
const APPS = [
  {
    key: 'admin',
    title: '后台管理（admin）',
    // 与 apps/admin 的 vite.config.ts 保持一致：base 由 package.json 的 name 决定
    baseName: 'admin'
  }
]

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const goApp = (baseName: string) => {
      // 跳转到对应应用的根路径，应用自身会根据配置重定向到首页
      const origin = window.location.origin
      const url = `${origin}/${baseName}/`
      window.location.href = url
    }

    return () => (
      <div class="w-full h-full flex items-center justify-center p-6">
        <div class="max-w-[560px] w-full">
          <h2 class="text-xl font-semibold mb-4">请选择进入的应用</h2>
          <div class="grid grid-cols-1 gap-3">
            {APPS.map(app => (
              <Card key={app.key} class="p-4 flex items-center justify-between">
                <div>
                  <div class="text-base font-medium">{app.title}</div>
                  <div class="text-gray-500 text-xs mt-1">/{app.baseName}/</div>
                </div>
                <Button type="primary" onClick={() => goApp(app.baseName)}>进入</Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }
})

// 路由元信息：隐藏菜单，使用纯界面模式
export const routeMeta: RouteMeta = {
  title: '登录',
  // 是否在菜单中隐藏
  hideInMenu: true,
  order: 1
}