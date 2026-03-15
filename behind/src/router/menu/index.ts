import { SwaggerRouter } from 'koa-swagger-decorator'
import { MenuController } from '@/controller/Menu'
import { swaggerSpec } from '@/config/swagger'

// DEBUG: 打印路由注册前的信息
console.log('[DEBUG] Initializing MenuRouter')

const router = new SwaggerRouter({
  spec: swaggerSpec,
})

router.swagger()

router.applyRoute(MenuController)

// DEBUG: 打印生成的路由堆栈
console.log('[DEBUG] MenuRouter Stack:', router.stack.map(layer => `[${layer.methods}] ${layer.path}`))

export default router
