import { SwaggerRouter } from 'koa-swagger-decorator'
import { swaggerSpec } from '@/config/swagger'
import { SystemPageController } from '@/controller/SystemPage'

const router = new SwaggerRouter({
  spec: swaggerSpec
})

router.swagger()

router.applyRoute(SystemPageController)

module.exports = router