import { body, responses, routeConfig, z } from 'koa-swagger-decorator'
import { Context } from 'koa'
import { ctxBody } from '@/utils'
import { FakeGenerateReq, FakeGenerateRes, IFakeGenerateReq } from './type'
import { fakeApiService } from '@/service/FakeApiService'
import { getErrorMessage } from '@/types/controller'

/**
 * 导航列表查询参数
 */
interface NavigationListQuery {
  size?: number
  current?: number
  page?: number
  scene?: string
  name?: string
  status?: number
}

/**
 * FakeApi 控制器
 * 只负责：接收请求、调用 Service、返回响应
 */
class FakeApiController {
  /**
   * 根据 dataSchema 生成测试数据
   */
  @routeConfig({
    method: 'post',
    path: '/fakeApi/generate',
    summary: '根据 dataSchema 生成测试数据',
    tags: ['测试', 'fakeApi']
  })
  @body(FakeGenerateReq)
  @responses(FakeGenerateRes)
  async generate(ctx: Context, args: { body: IFakeGenerateReq }) {
    try {
      const { dataSchema, count = 10 } = args.body || ({} as IFakeGenerateReq)

      if (!dataSchema || !dataSchema.type || !dataSchema.schema) {
        ctx.body = ctxBody({
          success: false,
          code: 400,
          msg: '缺少有效的 dataSchema'
        })
        return
      }

      const result = fakeApiService.generateTestData(dataSchema, count)

      // 数组时使用后端统一返回结构；对象直接返回对象
      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '生成测试数据成功',
        data: result.type === 'array' ? result.data : result.data
      })
    } catch (e: unknown) {
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: '生成测试数据失败',
        data: getErrorMessage(e)
      })
    }
  }

  /**
   * 小程序端底部菜单装修列表（分页）
   */
  @routeConfig({
    method: 'get',
    path: '/fakeApi/navigationList',
    summary: '小程序端底部菜单装修列表（分页）',
    tags: ['测试', 'fakeApi'],
    request: {
      // 同时兼容 current/page 传参，前端 SearchTable 使用 current/size
      query: z.object({
        scene: z.string().optional(),
        name: z.string().optional(),
        status: z.coerce.number().optional(),
        size: z.coerce.number().default(20).transform((v) => (v > 0 ? v : 20)),
        current: z.coerce.number().default(1).transform((v) => (v > 0 ? v : 1)),
        page: z.coerce.number().optional() // 兜底兼容
      })
    }
  })
  async navigationList(ctx: Context) {
    try {
      const { size, current, page, scene, name, status } = ctx.parsed?.query as NavigationListQuery
      const cur = Number(page) > 0 ? Number(page) : Number(current)

      const result = await fakeApiService.getNavigationList(
        { scene, name, status },
        cur,
        Number(size)
      )

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '获取装修导航列表成功',
        data: result
      })
    } catch (e: unknown) {
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: '获取装修导航列表失败',
        data: getErrorMessage(e)
      })
    }
  }
}

export { FakeApiController }
