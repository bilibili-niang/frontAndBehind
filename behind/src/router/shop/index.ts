import { SwaggerRouter } from 'koa-swagger-decorator'
import { ShopController } from '@/controller/Shop'
import { swaggerSpec } from '@/config/swagger'

const router = new SwaggerRouter({ spec: swaggerSpec })
router.swagger()

router.applyRoute(ShopController)

export default router