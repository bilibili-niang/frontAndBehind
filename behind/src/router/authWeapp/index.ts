import { SwaggerRouter } from 'koa-swagger-decorator'
import { AuthWeappController } from '@/controller/AuthWeapp'
import { swaggerSpec } from '@/config/swagger'

const router = new SwaggerRouter({ spec: swaggerSpec })

router.swagger()

router.applyRoute(AuthWeappController)

export default router