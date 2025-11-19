import { SwaggerRouter } from 'koa-swagger-decorator'
import { WeatherForGaode } from '@/controller/WeatherForGaode'
import { swaggerSpec } from '@/config/swagger'


const router = new SwaggerRouter({
  spec: swaggerSpec,
})
router.swagger()

router
  .applyRoute(WeatherForGaode)

module.exports = router
