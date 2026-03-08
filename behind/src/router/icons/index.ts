import { SwaggerRouter } from 'koa-swagger-decorator'
import { IconsController } from '@/controller/Icons'
import { swaggerSpec } from '@/config/swagger'

const router = new SwaggerRouter({ spec: swaggerSpec })

router.swagger()
router.applyRoute(IconsController)

export default router