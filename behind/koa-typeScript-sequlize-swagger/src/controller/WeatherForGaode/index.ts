import { middlewares, routeConfig, z } from 'koa-swagger-decorator'
import { ctxBody } from '@/utils'
import { Context } from 'koa'
import { $getWeatherFromGaode } from '@/api/weather'

class WeatherForGaode {
  @routeConfig({
    method: 'get',
    path: '/weather/gaode',
    summary: '天气查询-高德api',
    tags: ['天气'],
    request: {
      query: z.object({
        // 城市code
        // code: z.coerce.string().default('350211').transform(val => val ? val : '350211')
        code: z.coerce.string().default('350211')
      })
    }
  })
  @middlewares([
    // jwtMust
  ])
  async getWeatherFromGaode(ctx: Context, args) {
    console.log('进入 $getWeatherFromGaode 接口逻辑了')
    await $getWeatherFromGaode()
      .then(res => {
        ctx.body = ctxBody({
          success: true,
          code: 200,
          msg: `查询天气成功`,
          data: res
        })
      })
      .catch(e => {
        console.log('e:')
        console.log(e)
      })
  }
}

export { WeatherForGaode }