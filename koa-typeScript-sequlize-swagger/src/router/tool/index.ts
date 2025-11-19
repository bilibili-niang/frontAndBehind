import { SwaggerRouter } from 'koa-swagger-decorator'
import { ToolController } from '@/controller'
import { swaggerSpec } from '@/config/swagger'

const router = new SwaggerRouter({
  spec: swaggerSpec,
})
router.swagger()

router
  .applyRoute(ToolController)

module.exports = router
