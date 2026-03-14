# 数据库初始化文档

本文档说明数据库初始化和自检机制。

## 🚀 自动数据库自检（新增）

**从当前版本开始，后端服务启动时会自动进行数据库自检和初始化！**

当你运行 `npm run dev` 或 `npm run prod` 启动后端服务时，系统会自动执行以下步骤：

1. ✅ 检查数据库连接
2. ✅ 同步表结构
3. ✅ 初始化基础数据（管理员用户、导航、系统页面）
4. ✅ 为现有用户分配默认角色

**无需手动运行初始化命令**，除非你需要：
- 首次部署时手动初始化
- 重置数据库
- 单独执行某个初始化步骤

### 启动日志示例

```
[INFO] 开始数据库自检和初始化...
[INFO] 检查数据库连接...
[INFO] ✅ 数据库连接成功
[INFO] 同步数据库表结构...
[INFO] ✅ 表结构同步完成
[INFO] 初始化基础数据...
[INFO] ✅ 基础数据初始化完成
[INFO] 🎉 数据库自检和初始化全部完成
[INFO] 数据库自检和初始化完成，启动应用...
[INFO] Server is running at http://localhost:3279
```

## 手动初始化命令

### 完整初始化（可选）

```bash
npm run init-db
```

**适用场景**：
- 首次部署时预先初始化数据库
- 数据库被删除后重新初始化
- 需要查看完整初始化日志

### 启动开发环境

```bash
npm run dev
```

### 启动生产环境

```bash
npm run prod
```

## 高级用法

如果需要单独运行特定的初始化步骤，可以使用以下命令：

```bash
# 初始化权限系统表结构
npx ts-node -r dotenv/config ./scripts/init-permission-tables.ts

# 填充权限系统基础数据
npx ts-node -r dotenv/config ./scripts/seed-permission-data.ts

# 为用户分配默认角色
npx ts-node -r dotenv/config ./scripts/seed-user-roles.ts
```

**注意**：package.json 中只保留了最常用的命令，更多高级命令可以通过 npx 直接运行脚本。

## 初始化流程说明

### 管理员用户初始化

- 检查是否存在 `isAdmin=true` 的用户
- 如果不存在，创建管理员用户并关联 admin 角色
- 如果已存在，检查是否关联 admin 角色，未关联则自动关联

### 用户角色关联

- 获取所有用户
- 获取默认角色（name='user'）
- 为每个未关联角色的用户分配默认角色
- 已关联角色的用户保持不变

## 注意事项

1. **幂等性**：所有初始化脚本都是幂等的，可以安全重复运行
2. **数据保护**：不会覆盖已存在的用户数据或角色关联
3. **事务安全**：使用数据库事务确保数据一致性
4. **日志记录**：所有操作都会记录到日志中

## 常见问题

### Q: 已有用户数据，如何分配角色？

运行以下命令为现有用户分配默认角色：

```bash
npx ts-node -r dotenv/config ./scripts/seed-user-roles.ts
```

### Q: 管理员用户无法登录？

检查是否已关联 admin 角色，可以重新运行初始化：

```bash
npm run init-db
```

### Q: 如何重置数据库？

1. 手动删除数据库
2. 重新运行 `npm run init-db`

## 环境变量

确保 `.env` 文件中配置了以下环境变量：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password

# 管理员配置
ADMIN_USER_NAME=admin
ADMIN_USER_PASSWORD=admin123
```

## 脚本说明

| 脚本文件 | 功能 | 调用方式 |
|---------|------|---------|
| `init-db.ts` | 完整数据库初始化 | `npm run init-db` |
| `init-permission-tables.ts` | 初始化权限系统表 | `npx ts-node ...` |
| `seed-permission-data.ts` | 填充权限数据 | `npx ts-node ...` |
| `seed-user-roles.ts` | 分配用户角色 | `npx ts-node ...` |
