# 后端启动流程说明

## 启动流程

后端服务启动时会自动执行以下步骤：

```
1. 加载环境变量 (.env)
   ↓
2. 数据库自检和初始化
   ├─ 检查数据库连接
   ├─ 同步表结构
   └─ 初始化基础数据
   ↓
3. 启动 Koa 应用
   ↓
4. 监听端口，提供服务
```

## 代码入口

### main.ts

```typescript
// 1. 导入依赖
import app from './app'
import { initDatabase } from './utils/database-check'

// 2. 启动函数
async function bootstrap() {
  try {
    // 数据库自检和初始化
    await initDatabase()
    
    // 启动应用
    startServer()
  } catch (err) {
    // 自检失败，退出进程
    process.exit(1)
  }
}

// 3. 执行启动
bootstrap()
```

## 数据库自检流程

### database-check.ts

```typescript
export async function initDatabase() {
  // 步骤 1: 检查数据库连接
  await checkDatabaseConnection()
  
  // 步骤 2: 同步表结构
  await syncDatabaseTables()
  
  // 步骤 3: 初始化基础数据
  await initializeBaseData()
}
```

### 详细步骤

#### 1. 检查数据库连接
- 使用 `sequelize.authenticate()` 测试连接
- 失败则抛出错误，阻止应用启动

#### 2. 同步表结构
- 使用 `sequelize.sync({ alter: true })` 同步所有模型
- 自动创建缺失的表
- 自动更新表结构（alter 模式）

#### 3. 初始化基础数据
- **setAdminUser()**: 创建管理员用户并关联 admin 角色
- **setDefaultNavigation()**: 创建默认导航数据
- **setDefaultSystemPages()**: 创建系统页面数据
- **seedUserRoles()**: 为现有用户分配默认角色

## 初始化数据说明

### 管理员用户
- 用户名：`.env` 中的 `ADMIN_USER_NAME`
- 密码：`.env` 中的 `ADMIN_USER_PASSWORD`（MD5 加密存储）
- 自动关联 admin 角色

### 默认角色
- **admin**: 超级管理员，拥有所有权限
- **user**: 普通用户，拥有基础权限

### 用户角色关联
- 新创建的 admin 用户自动关联 admin 角色
- 现有用户如果没有关联角色，自动分配 user 角色
- 已关联角色的用户保持不变

## 日志输出

成功启动时的日志：

```
[INFO] 开始数据库自检和初始化...
[INFO] 检查数据库连接...
[INFO] ✅ 数据库连接成功
[INFO] 同步数据库表结构...
[INFO] ✅ 表结构同步完成
[INFO] 初始化基础数据...
[INFO] 添加 admin 用户
[INFO] admin 用户创建成功，ID: xxx
[INFO] 用户 xxx 已关联 admin 角色
[INFO] ✅ 基础数据初始化完成
[INFO] 🎉 数据库自检和初始化全部完成
[INFO] 数据库自检和初始化完成，启动应用...
[INFO] Server is running at http://localhost:3279
[INFO] swaggerDoc is running at http://localhost:3279/swagger-html
```

## 错误处理

如果数据库自检失败，应用将：
1. 记录详细错误日志
2. 退出进程（`process.exit(1)`）
3. 不会启动 Web 服务

常见错误：
- 数据库连接失败：检查 `.env` 中的数据库配置
- 表结构同步失败：检查数据库权限
- 数据初始化失败：检查是否有冲突数据

## 环境变量配置

确保 `.env` 文件中包含以下配置：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database

# 管理员配置
ADMIN_USER_NAME=admin
ADMIN_USER_PASSWORD=admin123

# 服务器配置
PORT=3279
NODE_ENV=local
```

## 手动初始化

虽然启动时会自动初始化，但你仍然可以手动运行：

```bash
# 手动完整初始化
npm run init-db

# 单独初始化权限系统
npx ts-node -r dotenv/config ./scripts/init-permission-tables.ts

# 单独填充权限数据
npx ts-node -r dotenv/config ./scripts/seed-permission-data.ts

# 单独分配用户角色
npx ts-node -r dotenv/config ./scripts/seed-user-roles.ts
```

## 特性

✅ **幂等性**: 所有初始化操作都是幂等的，可重复运行
✅ **事务安全**: 使用数据库事务确保数据一致性
✅ **日志记录**: 详细记录每个步骤的执行情况
✅ **错误处理**: 完善的错误捕获和提示
✅ **自动化**: 启动时自动执行，无需手动干预
