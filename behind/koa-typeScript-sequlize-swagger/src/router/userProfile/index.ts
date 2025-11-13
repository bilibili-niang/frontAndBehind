import { SwaggerRouter } from 'koa-swagger-decorator'
import { swaggerSpec } from '@/config/swagger'
import { UserProfileController } from '@/controller/UserProfile'

const router = new SwaggerRouter({
  spec: swaggerSpec
})

router.swagger()

router.applyRoute(UserProfileController)

module.exports = router