# 🚀 智能简历制作平台 | Resume Builder

一个基于 Vue 3 + Koa 的全栈简历制作系统，专注于提供简洁高效的简历编辑体验。

[![Vue 3](https://img.shields.io/badge/Vue-3.3+-green.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-orange.svg)](https://nodejs.org/)
[![Koa](https://img.shields.io/badge/Koa-2.x-red.svg)](https://koajs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 项目简介

本项目是一个**全栈简历制作平台**，目前核心功能是**在线简历编辑**。用户可以：

- 📝 在线编辑个人简历内容
- 🎨 选择和使用简历模板
- 💾 保存简历到云端
- � 导出简历为 PDF/图片格式

**项目愿景**：打造一个简单易用、功能完善的简历制作工具，帮助求职者快速创建专业简历。

---

## ✨ 当前功能

| 功能模块 | 状态 | 说明 |
|---------|------|------|
| 简历编辑 | ✅ 已完成 | 支持多模块内容编辑 |
| 模板系统 | ✅ 已完成 | 多种简历模板可选 |
| 用户系统 | ✅ 已完成 | 注册、登录、JWT 认证 |
| 权限管理 | ✅ 已完成 | RBAC 角色权限控制 |
| 数据持久化 | ✅ 已完成 | 云端保存简历数据 |
| 简历导出 | 🚧 开发中 | PDF/图片导出 |
| 微信小程序 | 🚧 开发中 | 移动端简历编辑 |

---

## 🛠 技术栈

### 前端 (admin/)
- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI 组件库**: Ant Design Vue + Vuetify
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **拖拽组件**: vue-draggable-plus

### 后端 (behind/)
- **运行环境**: Node.js 18+
- **框架**: Koa 2.x + TypeScript
- **ORM**: Sequelize
- **数据库**: MySQL
- **缓存**: Redis（可选）
- **日志**: log4js
- **文档**: Swagger / OpenAPI

### 小程序 (mini-app/)
- **平台**: 微信小程序
- **组件库**: 自定义组件 + Vant Weapp

---

## 📁 项目结构

```
frontAndBehind/
├── admin/                          # 管理后台（Vue 3 + TS）
│   ├── apps/
│   │   └── admin/                  # 主应用
│   ├── packages/
│   │   ├── core/                   # 核心功能包
│   │   ├── ui/                     # UI 组件包
│   │   ├── jsf/                    # JSON Schema Form
│   │   ├── resume/                 # 简历相关组件
│   │   ├── styles/                 # 样式系统
│   │   └── utils/                  # 工具函数
│   └── docs/                       # 文档
├── behind/                         # 后端服务（Koa + TS）
│   ├── src/
│   │   ├── controller/             # 控制器层
│   │   ├── service/                # 服务层
│   │   ├── repository/             # 数据访问层
│   │   ├── schema/                 # 数据库模型
│   │   ├── middleware/             # 中间件
│   │   ├── router/                 # 路由配置
│   │   ├── types/                  # 类型定义
│   │   ├── dto/                    # 数据传输对象
│   │   ├── utils/                  # 工具函数
│   │   └── config/                 # 配置文件
│   └── docs/                       # 架构文档
├── mini-app/                       # 微信小程序
│   ├── apps/                       # 小程序应用
│   └── packages/                   # 小程序组件包
└── _bmad/                          # AI 助手配置
```

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- pnpm >= 8
- MySQL >= 8.0
- Redis（可选）

### 1. 克隆项目

```bash
git clone https://github.com/bilibili-niang/frontAndBehind.git
cd frontAndBehind
```

### 2. 安装依赖

```bash
# 安装 pnpm（如果还没有）
npm install -g pnpm

# 安装所有依赖
pnpm install
```

### 3. 配置环境变量

#### 后端配置 (behind/.env)

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=resume_builder

# JWT 配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# 微信配置（可选）
WECHAT_APPID=your_appid
WECHAT_SECRET=your_secret

# 服务器配置
PORT=3000
NODE_ENV=development
```

#### 管理后台配置 (admin/apps/admin/.env)

```env
VITE_API_BASE_URL=http://localhost:3000
```

### 4. 初始化数据库

```bash
cd behind
npm run db:init
```

### 5. 启动服务

```bash
# 启动后端服务
cd behind
npm run dev

# 启动管理后台（新终端）
cd admin/apps/admin
pnpm dev

# 启动小程序（新终端）
cd mini-app/apps/yesong
pnpm dev
```

### 6. 访问应用

- 管理后台: http://localhost:5173
- 后端 API: http://localhost:3000
- Swagger 文档: http://localhost:3000/swagger-html

---

## 📚 文档

- [后端架构设计](./behind/docs/architecture-issues.md)
- [代码规范](./behind/docs/code-issues.md)
- [API 文档](http://localhost:3000/swagger-html)（启动后端后访问）

---

## 🔧 代码质量

- ✅ **TypeScript 严格类型检查** - 消除所有 `any` 类型
- ✅ **分层架构** - Controller-Service-Repository 模式
- ✅ **统一错误处理** - 全局错误捕获和格式化
- ✅ **完整的类型定义** - 所有接口都有类型支持
- ✅ **代码规范** - ESLint + Prettier
- ✅ **RBAC 权限系统** - 完整的角色权限控制

---

## 📝 开发规范

### 提交规范

```
feat: 新功能
fix: 修复问题
docs: 文档修改
style: 代码格式修改（不影响功能）
refactor: 代码重构
perf: 性能优化
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 分支管理

- `main` - 主分支，稳定版本
- `dev-*` - 开发分支
- `feature-*` - 功能分支
- `hotfix-*` - 紧急修复分支

---

## 🗓 开发路线图

### 第一阶段：基础功能 ✅
- [x] 简历编辑器
- [x] 用户系统
- [x] 模板系统
- [x] 数据持久化

### 第二阶段：权限系统 ✅
- [x] RBAC 权限控制
- [x] 角色管理
- [x] 菜单权限
- [x] 数据权限

### 第三阶段：导出功能 🚧
- [ ] PDF 导出
- [ ] 图片导出
- [ ] Word 导出

### 第四阶段：多端适配 🚧
- [ ] 微信小程序
- [ ] 移动端适配

### 第五阶段：高级功能 📋
- [ ] AI 简历优化建议
- [ ] 简历评分系统
- [ ] 模板市场

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

---

## 📄 许可证

本项目基于 [MIT](LICENSE) 许可证开源。

---

## 🙏 致谢

感谢所有为本项目做出贡献的开发者！

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/bilibili-niang">bilibili-niang</a>
</p>
