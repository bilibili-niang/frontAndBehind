import { body, routeConfig, z } from 'koa-swagger-decorator'
import { ctxBody } from '@/utils'
import { systemPageService } from '@/service/SystemPageService'

/**
 * 系统页面控制器
 * 只负责：接收请求、调用 Service、返回响应
 */
class SystemPageController {
  /**
   * 创建系统页面
   */
  @routeConfig({
    method: 'post',
    path: '/system-page/create',
    summary: '创建系统页面',
    tags: ['装修-系统装修']
  })
  @body(
    z.object({
      scene: z.string().nonempty(),
      key: z.string().optional(),
      title: z.string().nonempty(),
      tags: z.string().optional(),
      decorate: z.union([z.string(), z.record(z.any())]).optional(),
      origin: z.coerce.number().optional(),
      version: z.string().optional(),
      tenantId: z.string().optional(),
      editUser: z.string().optional(),
      description: z.string().optional(),
      createUser: z.string().optional()
    })
  )
  async create(ctx: any) {
    try {
      const data = ctx.parsed.body as any
      const detail = await systemPageService.createSystemPage(data)

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '创建系统页面成功',
        data: detail
      })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '创建系统页面失败', data: e?.message || e })
    }
  }

  /**
   * 更新系统页面
   */
  @routeConfig({
    method: 'put',
    path: '/system-page/update/:id',
    summary: '更新系统页面',
    tags: ['装修-系统装修']
  })
  @body(
    z.object({
      id: z.string().optional(),
      scene: z.string().optional(),
      key: z.string().optional(),
      title: z.string().optional(),
      tags: z.string().optional(),
      decorate: z.union([z.string(), z.record(z.any())]).optional(),
      origin: z.coerce.number().optional(),
      version: z.string().optional(),
      tenantId: z.string().optional(),
      editUser: z.string().optional(),
      description: z.string().optional(),
      updateUser: z.string().optional()
    })
  )
  async update(ctx: any) {
    try {
      const pathId = (ctx.params as any)?.id
      const { id: bodyId, ...rest } = ctx.parsed.body as any
      const id = String(pathId || bodyId || '')

      if (!id) {
        ctx.body = ctxBody({ success: false, code: 400, msg: '缺少更新目标：id 必须在路径中提供', data: null })
        return
      }

      const detail = await systemPageService.updateSystemPage(id, rest)

      if (!detail) {
        ctx.body = ctxBody({ success: false, code: 404, msg: '更新失败，记录不存在', data: null })
        return
      }

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '更新系统页面成功',
        data: detail
      })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '更新系统页面失败', data: e?.message || e })
    }
  }

  /**
   * 删除系统页面
   */
  @routeConfig({
    method: 'delete',
    path: '/system-page/delete',
    summary: '删除系统页面',
    tags: ['装修-系统装修'],
    request: {
      query: z.object({ id: z.string().nonempty() })
    }
  })
  async delete(ctx: any) {
    try {
      const { id } = ctx.parsed.query as any

      const result = await systemPageService.deleteSystemPage(id)

      if (!result.success) {
        const code = result.msg === '系统默认页面不可删除' ? 403 : 404
        ctx.body = ctxBody({ success: false, code, msg: result.msg, data: { id } })
        return
      }

      ctx.body = ctxBody({ success: true, code: 200, msg: '删除系统页面成功', data: { id } })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '删除系统页面失败', data: e?.message || e })
    }
  }

  /**
   * 系统页面详情
   */
  @routeConfig({
    method: 'get',
    path: '/system-page/detail',
    summary: '系统页面详情',
    tags: ['装修-系统装修'],
    request: {
      query: z.object({ id: z.string().nonempty() })
    }
  })
  async detail(ctx: any) {
    try {
      const { id } = ctx.parsed.query as any

      const detail = await systemPageService.getSystemPageDetail(id)

      if (!detail) {
        ctx.body = ctxBody({ success: false, code: 404, msg: '指定页面不存在', data: null })
        return
      }

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '获取系统页面详情成功',
        data: detail
      })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '获取系统页面详情失败', data: e?.message || e })
    }
  }

  /**
   * 系统页面列表（分页）
   */
  @routeConfig({
    method: 'get',
    path: '/system-page/list',
    summary: '系统页面列表（分页）',
    tags: ['装修-系统装修'],
    request: {
      query: z.object({
        scene: z.string().optional(),
        name: z.string().optional(),
        size: z.coerce.number().default(20).transform(v => (v > 0 ? v : 20)),
        page: z.coerce.number().default(1).transform(v => (v > 0 ? v : 1))
      })
    }
  })
  async list(ctx: any) {
    try {
      const { size, page, name, scene } = ctx.parsed.query as any

      const result = await systemPageService.getSystemPageList(
        { scene, name },
        Number(page),
        Number(size)
      )

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '获取系统页面列表成功',
        data: result
      })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '获取系统页面列表失败', data: e?.message || e })
    }
  }
}

export { SystemPageController }
