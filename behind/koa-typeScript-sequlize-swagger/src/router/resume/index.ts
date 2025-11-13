import { SwaggerRouter } from 'koa-swagger-decorator'
import { ResumeController } from '@/controller/Resume'
import { swaggerSpec } from '@/config/swagger'


const router = new SwaggerRouter({
  spec: swaggerSpec,
})
router.swagger()

router
  .applyRoute(ResumeController)

module.exports = router
