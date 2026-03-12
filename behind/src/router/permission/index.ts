import { SwaggerRouter } from 'koa-swagger-decorator'
import PermissionController from '@/controller/Permission'
import { swaggerSpec } from '@/config/swagger'

const router = new SwaggerRouter({
  spec: swaggerSpec,
})
router.swagger()

router.applyRoute(PermissionController)

export default router
