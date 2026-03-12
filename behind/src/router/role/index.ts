import { SwaggerRouter } from 'koa-swagger-decorator'
import RoleController from '@/controller/Role'
import { swaggerSpec } from '@/config/swagger'

const router = new SwaggerRouter({
  spec: swaggerSpec,
})
router.swagger()

router.applyRoute(RoleController)

export default router
