import { SwaggerRouter } from 'koa-swagger-decorator'
import { swaggerSpec } from '@/config/swagger'
import { UploadController } from '@/controller/Upload'

const router = new SwaggerRouter({
  spec: swaggerSpec
})

router.swagger()

router.applyRoute(UploadController)

module.exports = router