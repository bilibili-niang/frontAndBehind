import { SwaggerRouter } from 'koa-swagger-decorator'
import MenuController from '@/controller/Menu'
import { swaggerSpec } from '@/config/swagger'

const router = new SwaggerRouter({
  spec: swaggerSpec,
})
router.swagger()

router.applyRoute(MenuController)

export default router
