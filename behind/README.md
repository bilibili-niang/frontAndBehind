基于nodejs ts mysql sequlize swagger 的后端托管,主要是接口开发,配置了admin后台和小程序页面的项目托管

admin地址:
http://222.77.126.187:8099/yesong-admin/decoration/systempage/list

小程序地址:
http://222.77.126.187:8099/mini-app

接口swagger文档自动生成:
http://222.77.126.187:8099/swagger-html


apifox文档(测试环境下生成的swagger直接导入的):  
https://1p4oqnri2p.apifox.cn/

### 后端启动:

#### 环境变量

```ts
// 正式环境
koa-typeScript-sequlize-swagger/.env.production
// 测试环境
koa-typeScript-sequlize-swagger/.env.development
```
开发环境,测试环境对应的数据库不同  
`koa-typeScript-sequlize-swagger`为后端项目目录  
在后端项目目录下启动:
```shell
cd koa-typeScript-sequlize-swagger
pnpm i
pnpm run dev
```
接口地址:  
http://localhost:3279/  
接口文档生成地址:  
http://localhost:3279/swagger-html  

### 前端小程序

项目目录:  
miniApp/apps/brthday  

```shell
cd miniApp/apps/brthday  
pnpm i
pnpm run dev:weapp
```
taro+tsx+vue开发

### 后台管理

项目目录:  
birthdayMiniApp/admin  

```shell
cd birthdayMiniApp/admin  
pnpm i
pnpm run dev
```
tax,vue开发


## 后端

### 环境配置与命令说明

#### 项目命令

项目提供了测试和正式两个环境的运行命令：

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=local dotenv -e .env nodemon ./src/main.ts",
    "prod": "cross-env NODE_ENV=production dotenv -e .env.production nodemon ./src/main.ts"
  }
}
```

### 命令说明

- **npm run dev**
  - 运行测试环境
  - 使用 `.env` 配置文件
  - 数据库名：`birthdayDb_test`
  - 适合开发与测试

- **npm run prod**
  - 运行正式环境
  - 使用 `.env.production` 配置文件
  - 数据库名：`birthdayDb`
  - 适合生产部署

### 数据库配置

项目会根据运行环境自动选择数据库：

- **测试环境（dev）**：使用 `birthdayDb_test` 数据库
- **正式环境（prod）**：使用 `birthdayDb` 数据库

如果数据库不存在，系统会自动创建。

### 日志文件

项目的日志文件结构如下：

- **detail.log**：包含 trace 和 debug 级别的详细日志，主要用于调试和跟踪请求
- **normal.log**：包含 info 级别的一般日志，如系统启动、配置加载等
- **warn_error.log**：包含 warn、error 和 fatal 级别的警告和错误日志

所有日志中包含访问者IP地址信息，方便分析和安全监控。