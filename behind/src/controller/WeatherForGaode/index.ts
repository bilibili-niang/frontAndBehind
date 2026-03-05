import { middlewares, routeConfig, z } from 'koa-swagger-decorator'
import { ctxBody } from '@/utils'
import { Context } from 'koa'
import { weatherForGaodeService } from '@/service/WeatherForGaodeService'
import { error } from '@/config/log4j'

/**
 * 高德天气控制器
 * 只负责：接收请求、调用 Service、返回响应
 */
class WeatherForGaode {
  /**
   * 天气查询-高德api
   */
  @routeConfig({
    method: 'get',
    path: '/weather/gaode',
    summary: '天气查询-高德api',
    tags: ['天气'],
    request: {
      query: z.object({
        code: z.coerce.string().default('350211')
      })
    }
  })
  @middlewares([])
  async getWeatherFromGaode(ctx: Context, args) {
    try {
      const { code } = ctx.parsed.query as any
      const res = await weatherForGaodeService.getWeather(code)

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
