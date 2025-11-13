import { SwaggerRouter } from 'koa-swagger-decorator'
import { swaggerSpec } from '@/config/swagger'
import { DecorateController } from '@/controller/Decorate'

const router = new SwaggerRouter({
  spec: swaggerSpec
})

router.swagger()

router.applyRoute(DecorateController)

module.exports = router