import { SwaggerRouter } from 'koa-swagger-decorator'
import DataPermissionController from '@/controller/DataPermission'
import { swaggerSpec } from '@/config/swagger'

const router = new SwaggerRouter({
  spec: swaggerSpec,
})
router.swagger()

router.applyRoute(DataPermissionController)

export default router
