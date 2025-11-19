import process from 'node:process'
/*
* swagger 的一些标题、版本及服务器配置
* 通过 basePath/servers 显示实际请求需要带的 /api 前缀
* */
export const swaggerSpec = {
  info: {
    title: process.env.PROJECT_NAME,
    version: 'v1.0'
  },
  // Swagger 2.0 兼容字段：为文档中的所有路径增加统一前缀
  basePath: '/api',
  // OpenAPI 3 兼容字段：在文档 UI 的 Servers 中展示
  servers: [
    { url: '/api', description: 'API 前缀（实际请求走 /api）' }
  ]
}