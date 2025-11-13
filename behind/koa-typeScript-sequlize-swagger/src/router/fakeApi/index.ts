import { SwaggerRouter } from 'koa-swagger-decorator'
import { FakeApiController } from '@/controller/FakeApi'
import { swaggerSpec } from '@/config/swagger'

const router = new SwaggerRouter({
  spec: swaggerSpec
})

router.swagger()

router.applyRoute(FakeApiController)

module.exports = router