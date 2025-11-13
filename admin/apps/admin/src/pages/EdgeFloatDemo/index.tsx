import { defineComponent, ref } from 'vue'
import EdgeFloat from '@/components/EdgeFloat'

/**
 * EdgeFloat组件演示页面
 */
export default defineComponent({
  name: 'EdgeFloatDemo',
  setup() {
    const staticVisible = ref(false)

    const toggleStaticVisible = () => {
      staticVisible.value = !staticVisible.value
    }

    return () => (
      <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div class="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-800 mb-4">
              EdgeFloat 边缘浮现组件演示
            </h1>
            <p class="text-lg text-gray-600">
              将鼠标移动到屏幕的四个边缘，体验不同方向的浮现效果
            </p>
          </div>

          {/* 使用说明 */}
          <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">使用说明</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h3 class="font-medium text-gray-800 mb-2">浮动模式 (Float Mode)</h3>
                <ul class="space-y-1">
                  <li>• 鼠标移动到屏幕边缘自动显示</li>
                  <li>• 离开边缘区域自动隐藏</li>
                  <li>• 悬停在组件上保持显示</li>
                  <li>• 支持背景遮罩和模糊效果</li>
                </ul>
              </div>
              <div>
                <h3 class="font-medium text-gray-800 mb-2">静态模式 (Static Mode)</h3>
                <ul class="space-y-1">
                  <li>• 作为普通组件静态显示</li>
                  <li>• 可通过代码控制显示/隐藏</li>
                  <li>• 保持相同的样式和布局</li>
                  <li>• 适合固定位置的内容展示</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 静态模式演示 */}
          <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">静态模式演示</h2>
            <div class="flex items-center gap-4 mb-4">
              <button
                onClick={toggleStaticVisible}
                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                {staticVisible.value ? '隐藏' : '显示'} 静态组件
              </button>
              <span class="text-gray-600">
                当前状态: {staticVisible.value ? '显示' : '隐藏'}
              </span>
            </div>
            
            <EdgeFloat
              direction="top"
              mode="static"
              defaultVisible={staticVisible.value}
              theme="glass"
              rounded="lg"
              shadow="xl"
            >
              {{
                default: () => (
                  <div class="text-center">
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">
                      静态模式组件
                    </h3>
                    <p class="text-gray-600">
                      这是一个静态模式的EdgeFloat组件，可以通过按钮控制显示和隐藏。
                    </p>
                  </div>
                )
              }}
            </EdgeFloat>
          </div>

          {/* 配置选项说明 */}
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">配置选项</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div>
                <h3 class="font-medium text-gray-800 mb-2">方向 (Direction)</h3>
                <ul class="space-y-1 text-gray-600">
                  <li>• top: 顶部边缘</li>
                  <li>• bottom: 底部边缘</li>
                  <li>• left: 左侧边缘</li>
                  <li>• right: 右侧边缘</li>
                </ul>
              </div>
              <div>
                <h3 class="font-medium text-gray-800 mb-2">主题 (Theme)</h3>
                <ul class="space-y-1 text-gray-600">
                  <li>• light: 浅色主题</li>
                  <li>• dark: 深色主题</li>
                  <li>• glass: 玻璃效果</li>
                </ul>
              </div>
              <div>
                <h3 class="font-medium text-gray-800 mb-2">圆角 (Rounded)</h3>
                <ul class="space-y-1 text-gray-600">
                  <li>• none, sm, md, lg, xl, full</li>
                </ul>
              </div>
              <div>
                <h3 class="font-medium text-gray-800 mb-2">阴影 (Shadow)</h3>
                <ul class="space-y-1 text-gray-600">
                  <li>• none, sm, md, lg, xl</li>
                </ul>
              </div>
              <div>
                <h3 class="font-medium text-gray-800 mb-2">边缘检测</h3>
                <ul class="space-y-1 text-gray-600">
                  <li>• triggerDistance: 触发距离</li>
                  <li>• hideDelay: 隐藏延迟</li>
                </ul>
              </div>
              <div>
                <h3 class="font-medium text-gray-800 mb-2">其他选项</h3>
                <ul class="space-y-1 text-gray-600">
                  <li>• backdrop: 背景遮罩</li>
                  <li>• animationDuration: 动画时长</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 四个方向的浮动组件 */}
        
        {/* 顶部浮动组件 */}
        <EdgeFloat
            direction="top"
            theme="light"
            rounded="lg"
            shadow="xl"
            hint={true}
            threshold={{ triggerDistance: 80, hideDelay: 300 }}
          >
          {{
            default: () => (
              <div class="text-center">
                <h3 class="text-xl font-semibold text-gray-800 mb-2">
                  🔝 顶部浮现组件
                </h3>
                <p class="text-gray-600 mb-4">
                  将鼠标移动到屏幕顶部边缘即可看到此组件
                </p>
                <div class="flex justify-center gap-4">
                  <button class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                    操作按钮
                  </button>
                  <button class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
                    取消
                  </button>
                </div>
              </div>
            )
          }}
        </EdgeFloat>

        {/* 底部浮动组件 */}
        <EdgeFloat
            direction="bottom"
            theme="dark"
            rounded="xl"
            shadow="xl"
            backdrop={true}
            hint={true}
            threshold={{ triggerDistance: 80, hideDelay: 500 }}
          >
          {{
            default: () => (
              <div class="text-center">
                <h3 class="text-xl font-semibold mb-2">
                  🔻 底部浮现组件
                </h3>
                <p class="text-gray-300 mb-4">
                  深色主题 + 背景遮罩效果
                </p>
                <div class="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div
                      key={item}
                      class="p-3 bg-gray-700 rounded-md text-center hover:bg-gray-600 transition-colors cursor-pointer"
                    >
                      项目 {item}
                    </div>
                  ))}
                </div>
              </div>
            )
          }}
        </EdgeFloat>

        {/* 左侧浮动组件 */}
        <EdgeFloat
            direction="left"
            theme="glass"
            rounded="lg"
            shadow="lg"
            animationDuration={400}
            hint={true}
            threshold={{ triggerDistance: 80, hideDelay: 500 }}
          >
          {{
            default: () => (
              <div>
                <h3 class="text-xl font-semibold text-gray-800 mb-4">
                  ⬅️ 左侧导航菜单
                </h3>
                <nav class="space-y-2">
                  {['首页', '产品', '服务', '关于我们', '联系我们'].map((item) => (
                    <a
                      key={item}
                      href="#"
                      class="block px-4 py-2 text-gray-700 hover:bg-white/50 rounded-md transition-colors"
                    >
                      {item}
                    </a>
                  ))}
                </nav>
                <div class="mt-6 pt-4 border-t border-gray-200">
                  <button class="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                    登录
                  </button>
                </div>
              </div>
            )
          }}
        </EdgeFloat>

        {/* 右侧浮动组件 */}
        <EdgeFloat
            direction="right"
            theme="light"
            rounded="md"
            shadow="xl"
            hint={true}
            threshold={{ triggerDistance: 80, hideDelay: 800 }}
          >
          {{
            default: () => (
              <div>
                <h3 class="text-xl font-semibold text-gray-800 mb-4">
                  ➡️ 快捷工具栏
                </h3>
                <div class="space-y-3">
                  <button class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-md transition-colors">
                    <span class="text-2xl">🔍</span>
                    <div>
                      <div class="font-medium">搜索</div>
                      <div class="text-sm text-gray-500">快速查找内容</div>
                    </div>
                  </button>
                  <button class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-md transition-colors">
                    <span class="text-2xl">⚙️</span>
                    <div>
                      <div class="font-medium">设置</div>
                      <div class="text-sm text-gray-500">系统配置</div>
                    </div>
                  </button>
                  <button class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-md transition-colors">
                    <span class="text-2xl">📊</span>
                    <div>
                      <div class="font-medium">统计</div>
                      <div class="text-sm text-gray-500">数据分析</div>
                    </div>
                  </button>
                  <button class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-md transition-colors">
                    <span class="text-2xl">💬</span>
                    <div>
                      <div class="font-medium">消息</div>
                      <div class="text-sm text-gray-500">通知中心</div>
                    </div>
                  </button>
                </div>
              </div>
            )
          }}
        </EdgeFloat>
      </div>
    )
  }
})