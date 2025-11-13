# 开发规范

本文档定义了anTeng前端管理系统的开发规范，确保代码质量和团队协作效率。

## 代码风格

### JavaScript/TypeScript

#### 命名规范

```typescript
// 变量和函数使用camelCase
const userName = 'admin'
const getUserInfo = () => {}

// 常量使用UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_COUNT = 3

// 类名使用PascalCase
class UserService {}
interface UserInfo {}
type ApiResponse<T> = {}

// 枚举使用PascalCase
enum UserStatus {
  Active = 'active',
  Inactive = 'inactive'
}
```

#### 函数定义

```typescript
// 优先使用箭头函数
const fetchUserList = async (params: UserQueryParams): Promise<UserInfo[]> => {
  // 函数体
}

// 复杂函数添加注释
/**
 * 获取用户列表
 * @param params 查询参数
 * @returns 用户列表
 */
const getUserList = async (params: UserQueryParams) => {
  // 实现
}
```

#### 类型定义

```typescript
// 接口定义
interface UserInfo {
  id: number
  name: string
  email: string
  status: UserStatus
  createdAt: Date
}

// 使用泛型
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 联合类型
type Theme = 'light' | 'dark'
type ButtonSize = 'small' | 'medium' | 'large'
```

### Vue组件

#### 组件结构

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 导入
import { ref, computed, onMounted } from 'vue'
import type { UserInfo } from '@/types/user'

// Props定义
interface Props {
  userId: number
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true
})

// Emits定义
interface Emits {
  update: [user: UserInfo]
  delete: [id: number]
}

const emit = defineEmits<Emits>()

// 响应式数据
const loading = ref(false)
const userInfo = ref<UserInfo | null>(null)

// 计算属性
const displayName = computed(() => {
  return userInfo.value?.name || '未知用户'
})

// 方法
const fetchUser = async () => {
  loading.value = true
  try {
    // 获取用户信息
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  fetchUser()
})
</script>

<style scoped>
/* 样式 */
</style>
```

#### 组件命名

```typescript
// 组件文件名使用PascalCase
UserList.vue
DataTable.vue
SearchForm.vue

// 组件注册名使用kebab-case
<user-list />
<data-table />
<search-form />
```

### CSS/SCSS

#### 类名规范

```scss
// 使用BEM命名规范
.user-list {
  &__header {
    display: flex;
    justify-content: space-between;
  }
  
  &__item {
    padding: 16px;
    border-bottom: 1px solid #eee;
    
    &--active {
      background-color: #f0f9ff;
    }
  }
  
  &__actions {
    display: flex;
    gap: 8px;
  }
}
```

#### 样式组织

```scss
// 变量定义
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #faad14;
$error-color: #f5222d;

// Mixin定义
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// 组件样式
.component-name {
  // 布局相关
  display: flex;
  position: relative;
  
  // 尺寸相关
  width: 100%;
  height: auto;
  
  // 外观相关
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}
```

## Git规范

### 分支管理

```bash
# 主分支
main          # 生产环境分支
develop       # 开发环境分支

# 功能分支
feature/user-management
feature/dashboard-charts

# 修复分支
hotfix/login-bug
hotfix/security-patch

# 发布分支
release/v1.0.0
```

### 提交信息

```bash
# 格式：<type>(<scope>): <subject>

# 类型说明
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动

# 示例
feat(user): 添加用户列表筛选功能
fix(auth): 修复登录状态丢失问题
docs(api): 更新用户接口文档
style(component): 调整按钮组件样式
refactor(utils): 重构日期处理工具函数
```

## 代码质量

### ESLint配置

```json
{
  "extends": [
    "@vue/eslint-config-typescript",
    "@vue/eslint-config-prettier"
  ],
  "rules": {
    "no-console": "warn",
    "no-debugger": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "vue/component-name-in-template-casing": ["error", "kebab-case"]
  }
}
```

### 代码审查清单

- [ ] 代码符合命名规范
- [ ] 函数职责单一，逻辑清晰
- [ ] 适当的错误处理
- [ ] 必要的类型定义
- [ ] 组件props和emits定义完整
- [ ] 样式使用BEM规范
- [ ] 提交信息符合规范
- [ ] 无console.log等调试代码

## 性能优化

### 组件优化

```vue
<script setup lang="ts">
// 使用shallowRef优化大对象
import { shallowRef } from 'vue'
const largeData = shallowRef({})

// 使用computed缓存计算结果
const expensiveValue = computed(() => {
  return heavyCalculation(props.data)
})

// 使用watchEffect优化副作用
watchEffect(() => {
  if (props.visible) {
    fetchData()
  }
})
</script>

<template>
  <!-- 使用v-show代替v-if（频繁切换） -->
  <div v-show="visible">内容</div>
  
  <!-- 使用key优化列表渲染 -->
  <div v-for="item in list" :key="item.id">
    {{ item.name }}
  </div>
</template>
```

### 路由优化

```typescript
// 路由懒加载
const routes = [
  {
    path: '/user',
    component: () => import('@/pages/user/index.vue')
  }
]

// 预加载关键路由
router.beforeEach((to, from, next) => {
  if (to.path === '/dashboard') {
    import('@/pages/dashboard/index.vue')
  }
  next()
})
```

## 测试规范

### 单元测试

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserList from '@/components/UserList.vue'

describe('UserList', () => {
  it('should render user list correctly', () => {
    const wrapper = mount(UserList, {
      props: {
        users: [
          { id: 1, name: 'John', email: 'john@example.com' }
        ]
      }
    })
    
    expect(wrapper.find('.user-list__item').exists()).toBe(true)
    expect(wrapper.text()).toContain('John')
  })
})
```

### E2E测试

```typescript
import { test, expect } from '@playwright/test'

test('user login flow', async ({ page }) => {
  await page.goto('/login')
  
  await page.fill('[data-testid="username"]', 'admin')
  await page.fill('[data-testid="password"]', 'password')
  await page.click('[data-testid="login-btn"]')
  
  await expect(page).toHaveURL('/dashboard')
})
```

## 文档规范

### 组件文档

```typescript
/**
 * 用户列表组件
 * 
 * @example
 * ```vue
 * <UserList 
 *   :users="userList" 
 *   @select="handleSelect"
 * />
 * ```
 */
export default defineComponent({
  name: 'UserList',
  props: {
    /** 用户列表数据 */
    users: {
      type: Array as PropType<UserInfo[]>,
      required: true
    }
  },
  emits: {
    /** 选择用户时触发 */
    select: (user: UserInfo) => true
  }
})
```

### API文档

```typescript
/**
 * 获取用户列表
 * @param params 查询参数
 * @param params.page 页码
 * @param params.size 每页数量
 * @param params.keyword 搜索关键词
 * @returns 用户列表响应
 */
export const getUserList = (params: UserQueryParams): Promise<ApiResponse<UserInfo[]>> => {
  return request.get('/users', { params })
}
```

遵循这些规范将有助于提高代码质量，增强团队协作效率，确保项目的可维护性。