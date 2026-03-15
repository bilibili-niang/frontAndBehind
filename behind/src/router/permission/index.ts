import { SwaggerRouter } from 'koa-swagger-decorator'
import { PermissionController } from '@/controller/Permission'
import { swaggerSpec } from '@/config/swagger'

// DEBUG: 打印路由注册前的信息
console.log('[DEBUG] Initializing PermissionRouter')

const router = new SwaggerRouter({
  spec: swaggerSpec,
})

router.swagger()

router.applyRoute(PermissionController)

// DEBUG: 打印生成的路由堆栈
console.log('[DEBUG] PermissionRouter Stack:', router.stack.map(layer => `[${layer.methods}] ${layer.path}`))

export default router
