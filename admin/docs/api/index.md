# API 概览

本文档描述了ice前端管理系统的API接口规范和使用方法。

## 基础信息

### 接口地址

- **开发环境**: `http://localhost:8080/api`
- **测试环境**: `https://test-api.ice.com/api`
- **生产环境**: `https://api.ice.com/api`

### 请求格式

所有API请求都使用JSON格式，请求头需要包含：

```http
Content-Type: application/json
Authorization: Bearer <token>
```

### 响应格式

所有API响应都遵循统一的格式：

```json
{
  "code": 1,
  "message": "success",
  "data": {}
}
```

#### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 状态码，200表示成功 |
| message | string | 响应消息 |
| data | any | 响应数据 |

### 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 认证机制

### JWT Token

系统使用JWT Token进行身份认证：

1. 用户登录成功后，服务器返回access_token和refresh_token
2. 客户端在请求头中携带access_token
3. Token过期时，使用refresh_token刷新

### Token使用示例

```typescript
// 请求拦截器
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器
request.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token过期，尝试刷新
      await refreshToken()
      // 重新发起请求
      return request(error.config)
    }
    return Promise.reject(error)
  }
)
```

## 分页规范

### 请求参数

```typescript
interface PaginationParams {
  page: number      // 页码，从1开始
  size: number      // 每页数量
  sort?: string     // 排序字段
  order?: 'asc' | 'desc'  // 排序方向
}
```

### 响应格式

```typescript
interface PaginationResponse<T> {
  list: T[]         // 数据列表
  total: number     // 总数量
  page: number      // 当前页码
  size: number      // 每页数量
  pages: number     // 总页数
}
```

### 使用示例

```typescript
// 请求用户列表
const getUserList = async (params: {
  page: number
  size: number
  keyword?: string
}) => {
  const response = await request.get('/users', { params })
  return response.data
}

// 调用示例
const result = await getUserList({
  page: 1,
  size: 20,
  keyword: 'admin'
})
```

## 错误处理

### 错误响应格式

```json
{
  "code": 400,
  "message": "请求参数错误",
  "data": {
    "field": "username",
    "error": "用户名不能为空"
  }
}
```

### 客户端错误处理

```typescript
// 统一错误处理
const handleApiError = (error: any) => {
  const { code, message } = error.response?.data || {}
  
  switch (code) {
    case 400:
      ElMessage.error(message || '请求参数错误')
      break
    case 401:
      ElMessage.error('登录已过期，请重新登录')
      router.push('/login')
      break
    case 403:
      ElMessage.error('权限不足')
      break
    case 404:
      ElMessage.error('请求的资源不存在')
      break
    case 500:
      ElMessage.error('服务器内部错误')
      break
    default:
      ElMessage.error(message || '未知错误')
  }
}
```

## 接口模块

### 认证相关

- [登录认证](./auth.md) - 用户登录、登出、Token刷新
- [用户信息](./user.md) - 获取用户信息、修改密码

### 用户管理

- [用户管理](./user.md) - 用户增删改查、状态管理
- [角色管理](./role.md) - 角色权限管理
- [权限管理](./permission.md) - 权限配置

### 系统管理

- [菜单管理](./menu.md) - 系统菜单配置
- [字典管理](./dict.md) - 数据字典管理
- [系统配置](./system.md) - 系统参数配置

### 业务模块

根据具体业务需求，可能包含：

- 订单管理
- 商品管理
- 财务管理
- 报表统计

## 接口测试

### 使用Postman

1. 导入API文档生成的Postman集合
2. 配置环境变量（baseUrl、token等）
3. 执行接口测试

### 使用curl

```bash
# 登录接口
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'

# 获取用户列表
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

## 接口文档生成

项目使用Swagger/OpenAPI生成接口文档：

- **文档地址**: `http://localhost:8080/swagger-ui.html`
- **JSON格式**: `http://localhost:8080/v3/api-docs`

## 版本管理

API版本通过URL路径进行管理：

- `/api/v1/users` - 版本1
- `/api/v2/users` - 版本2

当前使用版本：**v1**

## 开发指南

### 接口开发流程

1. 设计API接口规范
2. 编写接口文档
3. 实现后端接口
4. 编写前端调用代码
5. 进行接口测试
6. 部署上线

### 最佳实践

- 使用RESTful API设计原则
- 合理使用HTTP状态码
- 提供详细的错误信息
- 实现接口幂等性
- 添加接口限流和缓存
- 记录详细的操作日志

---

接下来，您可以查看具体的接口文档：

- [用户管理API](./user.md)
- [权限管理API](./permission.md)
- [系统配置API](./system.md)