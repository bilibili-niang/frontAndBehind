import { middlewares, routeConfig, z } from 'koa-swagger-decorator'
import { ctxBody } from '@/utils'
import { Context } from 'koa'
import { $getWeatherFromGaode } from '@/api/weather'
import { debug, error } from '@/config/log4j'

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
    debug('进入 $getWeatherFromGaode 接口逻辑了')
    try {
      const res = await $getWeatherFromGaode()
      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: `查询天气成功`,
        data: res
      })
    } catch (e: unknown) {
      error(`查询天气失败: ${e}`)
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: '查询天气失败',
        data: e
      })
    }
  }
}

export { WeatherForGaode }
