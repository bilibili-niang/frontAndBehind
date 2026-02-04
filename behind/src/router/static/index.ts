import Router from 'koa-router'

// 使用内置的路由提供默认头像 PNG
// 避免依赖外部静态文件，保证 /defaultAvatar.png 一定可用
const router = new Router()

// 一个透明背景的占位 PNG（1x1），可根据需要替换为更复杂图像
// iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=
const DEFAULT_AVATAR_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='

router.get('/defaultAvatar.png', async (ctx) => {
  ctx.type = 'image/png'
  ctx.status = 200
  ctx.body = Buffer.from(DEFAULT_AVATAR_BASE64, 'base64')
})

export default router