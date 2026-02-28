[中文](#zh),[English](#en)

---
##### zh

#### 鸣谢:

[koa-swagger-decorator](https://github.com/Cody2333/koa-swagger-decorator),[sequelize-typescript](https://www.npmjs.com/package/sequelize-typescript)等等...

> [koa-typeScript-sequlize-swagger github地址](https://github.com/bilibili-niang/koa-typeScript-sequlize-swagger),欢迎点点`Star`

> [koa-typeScript-sequlize-swagger npm地址(感觉没必要发布到npm,下载下来是在node_modules中)](https://www.npmjs.com/package/koa-typescript-sequlize-swagger)

#### 介绍
基于`koa`,`ts`,`log4js`,`sequlize`的后端模板。自己的项目写了几个，
参考后端应有的一些功能，和别人的`nodejs`下`koa`的使用，配置了一个后端的基本框架。

**已集成功能：**
- ✅ JWT 认证与鉴权中间件
- ✅ 请求日志记录中间件
- ✅ 全局错误处理
- ✅ 静态资源服务（文件上传、视频、图标等）
- ✅ Swagger API 文档自动生成
- ✅ 多数据库表操作（User、Resume、Shop、Navigation等）
- ✅ 微信小程序登录集成
- ✅ 高德天气 API 集成
- ✅ 文件上传功能
- ✅ 模拟 API 数据生成

#### 项目结构

```
src/
├── api/                    # 第三方 API 封装
│   ├── weather/           # 高德天气 API
│   └── request.ts         # 通用请求封装
├── app/                   # Koa 应用实例配置
│   └── index.ts          # 中间件挂载、路由注册、静态资源开放
├── config/               # 配置文件
│   ├── db.ts            # 数据库连接配置
│   ├── swagger.ts       # Swagger 文档配置
│   ├── log4j.ts         # 日志配置
│   └── errorHandler.ts  # 错误处理配置
├── constant/            # 常量定义
│   ├── jwt.ts          # JWT 相关常量
│   ├── tool.ts         # 工具常量
│   └── weather.ts      # 天气 API 常量
├── controller/          # 控制器（业务逻辑）
│   ├── AuthWeapp/      # 微信小程序登录
│   ├── Decorate/       # 装饰相关
│   ├── FakeApi/        # 模拟 API 数据
│   ├── Icons/          # 图标管理
│   ├── Navigation/     # 导航管理
│   ├── Resume/         # 简历管理
│   ├── Shop/           # 商城管理
│   ├── SystemPage/     # 系统页面
│   ├── Test/           # 测试接口
│   ├── Tool/           # 工具接口
│   ├── Upload/         # 文件上传
│   ├── User/           # 用户管理
│   ├── UserProfile/    # 用户资料
│   ├── WeatherForGaode/# 高德天气
│   └── common/         # 通用类型定义
├── middleware/         # 中间件
│   ├── jwtMiddleware.ts    # JWT 认证中间件
│   ├── loggerMiddleware.ts # 请求日志中间件
│   └── userMiddleware/     # 用户相关中间件
├── router/            # 路由配置
│   ├── api-index.ts   # /api 前缀路由
│   ├── index.ts       # 主路由入口
│   └── */             # 各模块路由
├── schema/           # 数据库模型（Sequelize）
│   ├── authWeapp/    # 微信小程序模型
│   ├── authority/    # 权限模型
│   ├── baseModal/    # 基础模型
│   ├── customPage/   # 自定义页面模型
│   ├── illegalRequest/# 非法请求记录
│   ├── navigation/   # 导航模型
│   ├── resume/       # 简历模型
│   ├── shop/         # 商城模型
│   ├── systemPage/   # 系统页面模型
│   └── user/         # 用户模型
├── service/          # 服务层
│   ├── tool/         # 工具服务
│   │   └── translate/# 翻译服务
│   └── wechat.ts     # 微信相关服务
├── static/           # 静态资源
│   ├── icons/        # 图标资源（Pioneer图标集）
│   └── views/        # HTML 模板
└── main.ts          # 入口文件
```

#### 使用

```shell
git clone https://github.com/bilibili-niang/koa-typeScript-sequlize-swagger.git
```

#### 环境配置

复制 `.env.example` 为 `.env` 并配置：

```env
PORT=3000
PROJECT_NAME=your-project-name
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
GAODE_KEY=your_gaode_api_key
```

#### 中间件说明

##### 1. JWT 认证中间件 (`jwtMiddleware.ts`)

提供两种级别的认证：

```typescript
// 全局中间件：自动解析 token，不强制要求
app.use(jwtMiddleware)

// 路由级强鉴权：必须携带有效 token
@middlewares([jwtMust])
async someProtectedRoute(ctx: Context) {
  // 需要登录才能访问
}
```

##### 2. 日志中间件 (`loggerMiddleware.ts`)

自动记录所有请求的：
- 请求方法、URL、IP
- 响应状态码
- 响应时间
- 错误信息

##### 3. 错误处理

全局错误捕获，统一返回格式：
```json
{
  "code": 500,
  "success": false,
  "msg": "错误信息",
  "data": null
}
```

#### koa-swagger-decorator配置和使用

> 为了方便后续接口的维护，你可以在项目启动后网页端直接看到所有路由  
或者你可以将路由导入到`apiFox`中，要注意该项目在npm上有两个version:`latest`和`next`，两者相差很大，模板中使用的是`next`

- `koa-swagger-decorator`是支持数据的校验，模板中有一些例子，但更多的使用，请访问[文档](https://github.com/Cody2333/koa-swagger-decorator)
- 模板中带了一些简单的新增、查询、删除操作
- 需要使用`SwaggerRouter`代替koa的路由，像是下面一个简单的配置:

`src/router/user/index.ts`:
```ts
import { SwaggerRouter } from 'koa-swagger-decorator'
import { UserController } from '@/controller/User'
import { swaggerSpec } from '@/config/swagger'

const router = new SwaggerRouter({
  spec: {
    info: {
      // 配置在.env文件中
      title: process.env.PROJECT_NAME,
      version: 'v1.0',
    },
  }
})
router.swagger()

// 接受一个路由实例
router
  .applyRoute(UserController)

module.exports = router
```

`src/controller/User/index.ts`:
```ts
import { Context } from 'koa'
import { body, middlewares, responses, routeConfig } from 'koa-swagger-decorator'
import {
  CreateUserReq,
  CreateUserRes,
  DeleteUserQuery,
  DeleteUserRes,
  IDeleteUserQuery,
} from './type'
import { ParsedArgs, z } from 'koa-swagger-decorator'
import { ICreateUserReq } from '@/controller/User/type'
import User from '@/schema/user'
import { ctxBody, deleteByIdMiddleware, paginationMiddleware } from '@/utils'
import { paginationQuery } from '@/controller/common/queryType'

class UserController {
  @routeConfig({
    method: 'post',
    path: '/user/create',
    summary: '创建用户',
    tags: ['用户'],
  })
  @body(CreateUserReq)
  @responses(CreateUserRes)
  @middlewares([
    async (ctx: Context, next: any) => {
      // 可以对ctx进行操作,然后放行
      await next()
    }
  ])
  async CreateUser(ctx: Context, args: ParsedArgs<ICreateUserReq>) {
    await User.create(args.body)
      .then((res: any) => {
        ctx.body = ctxBody({
          success: true,
          code: 200,
          msg: '创建用户成功',
          data: res.dataValues
        })
      })
      .catch(e => {
        ctx.body = ctxBody({
          success: false,
          code: 500,
          msg: '创建用户失败',
          data: e
        })
      })
  }
}
```

#### 静态资源服务

项目已配置多个静态资源目录：

| 路径 | 说明 | 访问地址 |
|------|------|----------|
| `/upload` | 上传文件目录 | `/upload/filename` |
| `/video` | 视频文件目录 | `/video/filename.mp4` |
| `/mini-app` | H5 构建产物 | `/mini-app/index.html` |
| `/static/icons` | 图标资源 | `/icons/xxx.png` |

#### 启动项目

```shell
# 开发模式
npm run dev

# 生产模式
npm run prod
```

#### 接口文档

启动后访问：`http://localhost:3000/swagger-html`

---
##### en

#### Thanks:

[koa-swagger-decorator](https://github.com/Cody2333/koa-swagger-decorator),[sequelize-typescript](https://www.npmjs.com/package/sequelize-typescript)...

> [koa-typeScript-sequlize-swagger github](https://github.com/bilibili-niang/koa-typeScript-sequlize-swagger),Welcome to click `Star`

> [koa-typeScript-sequlize-swagger npm](https://www.npmjs.com/package/koa-typescript-sequlize-swagger)

#### Introduction
A backend template based on `koa`, `ts`, `log4js`, and `sequelize`. After building several projects,
I configured a basic backend framework by referring to some necessary backend features and how others use `koa` under `nodejs`.

**Integrated Features:**
- ✅ JWT Authentication & Authorization Middleware
- ✅ Request Logging Middleware
- ✅ Global Error Handling
- ✅ Static Resource Service (File Upload, Video, Icons, etc.)
- ✅ Swagger API Documentation Auto-generation
- ✅ Multi-database Table Operations (User, Resume, Shop, Navigation, etc.)
- ✅ WeChat Mini Program Login Integration
- ✅ Gaode Weather API Integration
- ✅ File Upload Functionality
- ✅ Mock API Data Generation

#### Project Structure

```
src/
├── api/                    # Third-party API encapsulation
│   ├── weather/           # Gaode Weather API
│   └── request.ts         # Generic request wrapper
├── app/                   # Koa application instance config
│   └── index.ts          # Middleware mounting, route registration
├── config/               # Configuration files
│   ├── db.ts            # Database connection config
│   ├── swagger.ts       # Swagger documentation config
│   ├── log4j.ts         # Logging config
│   └── errorHandler.ts  # Error handling config
├── constant/            # Constants definition
├── controller/          # Controllers (business logic)
├── middleware/          # Middlewares
├── router/             # Route configuration
├── schema/            # Database models (Sequelize)
├── service/           # Service layer
├── static/            # Static resources
└── main.ts           # Entry file
```

#### Usage

```shell
git clone https://github.com/bilibili-niang/koa-typeScript-sequlize-swagger.git
```

#### Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
PORT=3000
PROJECT_NAME=your-project-name
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
GAODE_KEY=your_gaode_api_key
```

#### Middleware Description

##### 1. JWT Authentication Middleware (`jwtMiddleware.ts`)

Provides two levels of authentication:

```typescript
// Global middleware: automatically parse token, not mandatory
app.use(jwtMiddleware)

// Route-level mandatory authentication: must carry valid token
@middlewares([jwtMust])
async someProtectedRoute(ctx: Context) {
  // Requires login to access
}
```

##### 2. Logger Middleware (`loggerMiddleware.ts`)

Automatically records for all requests:
- Request method, URL, IP
- Response status code
- Response time
- Error information

##### 3. Error Handling

Global error capture with unified response format:
```json
{
  "code": 500,
  "success": false,
  "msg": "Error message",
  "data": null
}
```

#### koa-swagger-decorator Configuration and Usage

> For easier maintenance of subsequent interfaces, you can view all routes directly in the browser after the project starts,
or you can import routes into `apiFox`. Note that this project has two versions on npm: `latest` and `next`, which differ significantly. This template uses `next`.

- `koa-swagger-decorator` supports data validation. There are some examples in the template, but for more usage, please visit the [documentation](https://github.com/Cody2333/koa-swagger-decorator)
- The template includes simple add, query, and delete operations
- Need to use `SwaggerRouter` instead of koa's router, like the simple configuration below:

`src/router/user/index.ts`:
```ts
import { SwaggerRouter } from 'koa-swagger-decorator'
import { UserController } from '@/controller/User'
import { swaggerSpec } from '@/config/swagger'

const router = new SwaggerRouter({
  spec: {
    info: {
      title: process.env.PROJECT_NAME,
      version: 'v1.0',
    },
  }
})
router.swagger()

router
  .applyRoute(UserController)

module.exports = router
```

#### Static Resource Service

The project has configured multiple static resource directories:

| Path | Description | Access URL |
|------|-------------|------------|
| `/upload` | Uploaded files directory | `/upload/filename` |
| `/video` | Video files directory | `/video/filename.mp4` |
| `/mini-app` | H5 build output | `/mini-app/index.html` |
| `/static/icons` | Icon resources | `/icons/xxx.png` |

#### Start Project

```shell
# Development mode
npm run dev

# Production mode
npm run prod
```

#### API Documentation

After starting, visit: `http://localhost:3000/swagger-html`
