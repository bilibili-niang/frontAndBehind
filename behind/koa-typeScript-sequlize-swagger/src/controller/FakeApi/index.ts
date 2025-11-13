import { body, responses, routeConfig, z } from 'koa-swagger-decorator'
import { Context } from 'koa'
import { ctxBody } from '@/utils'
import { generateByDataSchema, DataSchemaSpec } from '@/utils/fake'
import { FakeGenerateReq, FakeGenerateRes, IFakeGenerateReq } from './type'
import { Op } from 'sequelize'
import Navigation from '@/schema/navigation'

class FakeApiController {
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

      const spec: DataSchemaSpec = {
        type: dataSchema.type,
        schema: dataSchema.schema
      }

      const result = generateByDataSchema(spec, count)

      // 数组时使用后端统一返回结构；对象直接返回对象
      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '生成测试数据成功',
        data: spec.type === 'array' ? result : result
      })
    } catch (e: any) {
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: '生成测试数据失败',
        data: e?.message || e
      })
    }
  }

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
      const { size, current, page, scene, name, status } = ctx.parsed.query as any
      const cur = Number(page) > 0 ? Number(page) : Number(current)

      const where: any = {}
      if (scene) where.scene = String(scene)
      if (typeof status !== 'undefined') where.status = Number(status)
      if (name) where.name = { [Op.like]: `%${name}%` }

      const pageSize = Number(size)
      const offset = (cur - 1) * pageSize

      const res = await Navigation.findAndCountAll({
        where,
        limit: pageSize,
        offset,
        order: [['updatedAt', 'DESC']]
      })

      const total = res.count
      const pages = Math.ceil(total / pageSize)
      const records = (res.rows || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        editUser: row.editUser,
        createTime: row.createdAt ? new Date(row.createdAt).toISOString() : null,
        updateTime: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
        status: row.status,
        scene: row.scene
      }))

      const paginationData = {
        countId: '',
        current: cur,
        maxLimit: pageSize,
        optimizeCountSql: true,
        orders: [],
        pages,
        records,
        searchCount: true,
        size: pageSize,
        total
      }

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '获取装修导航列表成功',
        data: paginationData
      })
    } catch (e: any) {
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: '获取装修导航列表失败',
        data: e?.message || e
      })
    }
  }
}

export { FakeApiController }