import { SwaggerRouter } from 'koa-swagger-decorator'
import { RoleController } from '@/controller/Role'
import { swaggerSpec } from '@/config/swagger'

const router = new SwaggerRouter({
  spec: swaggerSpec,
})

// DEBUG: 打印路由注册前的信息
console.log('[DEBUG] Initializing RoleRouter')

router.swagger()

router.applyRoute(RoleController)

// DEBUG: 打印生成的路由堆栈
console.log('[DEBUG] RoleRouter Stack:', router.stack.map(layer => `[${layer.methods}] ${layer.path}`))

export default router
