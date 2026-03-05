import { body, responses, routeConfig, z } from 'koa-swagger-decorator'
import { Context } from 'koa'
import { ctxBody } from '@/utils'
import { commonResponse } from '@/controller/common'
import { navigationService } from '@/service/NavigationService'

/**
 * 导航控制器
 * 只负责：接收请求、调用 Service、返回响应
 */
class NavigationController {
  /**
   * 获取当前激活的导航配置
   */
  @routeConfig({
    method: 'get',
    path: '/navigation/actived',
    summary: '获取当前激活的导航配置（仅返回一条）',
    tags: ['装修-系统装修'],
    request: {
      query: z.object({
        scene: z.string().optional(),
        origin: z.string().optional(),
      })
    }
  })
  @responses(commonResponse({
    data: z.object({
      items: z.record(z.any())
    })
  }))
  async actived(ctx: Context) {
    try {
      const { origin, scene } = ctx.parsed.query as any
      const resolvedScene = typeof scene !== 'undefined' && scene !== null && scene !== ''
        ? String(scene)
        : (typeof origin !== 'undefined' && origin !== null && origin !== '' ? String(origin) : undefined)

      if (!resolvedScene) {
        ctx.body = ctxBody({ success: false, code: 400, msg: 'scene 必传（可使用 origin 作为别名）', data: null })
        return
      }

      const data = await navigationService.getActiveNavigation(resolvedScene)

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: data.items ? '获取已激活导航成功' : '未找到已激活导航，返回空配置',
        data
      })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '获取已激活导航失败', data: e?.message || e })
    }
  }

  /**
   * 创建导航配置
   */
  @routeConfig({
    method: 'post',
    path: '/navigation/create',
    summary: '创建导航配置',
    tags: ['装修-系统装修']
  })
  @body(z.object({
    name: z.string().nonempty(),
    scene: z.string().nonempty(),
    status: z.coerce.number().default(0),
    editUser: z.string().optional(),
    config: z.union([z.string(), z.record(z.any())]).optional(),
    description: z.string().optional()
  }))
  async create(ctx: Context) {
    try {
      const data = ctx.parsed.body as any
      const res = await navigationService.create(data)
      ctx.body = ctxBody({ success: true, code: 200, msg: '创建导航成功', data: res })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '创建导航失败', data: e?.message || e })
    }
  }

  /**
   * 更新导航配置
   */
  @routeConfig({
    method: 'put',
    path: '/navigation/:id',
    summary: '更新导航配置',
    tags: ['装修-系统装修']
  })
  @body(z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    scene: z.string().optional(),
    status: z.coerce.number().optional(),
    editUser: z.string().optional(),
    config: z.union([z.string(), z.record(z.any())]).optional(),
    description: z.string().optional()
  }))
  async update(ctx: Context) {
    try {
      const pathId = (ctx.params as any)?.id
      const { id: bodyId, ...rest } = ctx.parsed.body as any
      const id = String(pathId || bodyId || '')

      if (!id) {
        ctx.body = ctxBody({ success: false, code: 400, msg: '缺少更新目标：id 必须在路径中提供', data: null })
        return
      }

      const latest = await navigationService.update(id, rest)
      ctx.body = ctxBody({ success: true, code: 200, msg: '更新导航成功', data: latest })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '更新导航失败', data: e?.message || e })
    }
  }

  /**
   * 删除导航配置
   */
  @routeConfig({
    method: 'delete',
    path: '/navigation/delete',
    summary: '删除导航配置',
    tags: ['装修-系统装修'],
    request: {
      query: z.object({ id: z.string().nonempty() })
    }
  })
  async delete(ctx: Context) {
    try {
      const { id } = ctx.parsed.query as any
      const result = await navigationService.delete(id)

      if (!result.success) {
        ctx.body = ctxBody({ success: false, code: result.message?.includes('使用中') ? 403 : 404, msg: result.message, data: { id } })
        return
      }

      ctx.body = ctxBody({ success: true, code: 200, msg: '删除导航成功', data: { id } })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '删除导航失败', data: e?.message || e })
    }
  }

  /**
   * 导航配置详情
   */
  @routeConfig({
    method: 'get',
    path: '/navigation/detail',
    summary: '导航配置详情',
    tags: ['装修-系统装修'],
    request: {
      query: z.object({ id: z.string().nonempty() })
    }
  })
  async detail(ctx: Context) {
    try {
      const { id } = ctx.parsed.query as any
      const detail = await navigationService.getDetail(id)

      if (!detail) {
        ctx.body = ctxBody({ success: false, code: 404, msg: '指定导航不存在', data: null })
        return
      }

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '获取导航详情成功',
        data: detail
      })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '获取导航详情失败', data: e?.message || e })
    }
  }

  /**
   * 导航配置列表（分页）
   */
  @routeConfig({
    method: 'get',
    path: '/navigation/list',
    summary: '导航配置列表（分页）',
    tags: ['装修-系统装修'],
    request: {
      query: z.object({
        scene: z.string().optional(),
        name: z.string().optional(),
        status: z.coerce.number().optional(),
        size: z.coerce.number().default(20).transform(v => (v > 0 ? v : 20)),
        page: z.coerce.number().default(1).transform(v => (v > 0 ? v : 1))
      })
    }
  })
  async list(ctx: Context) {
    try {
      const { size, page, scene, name, status } = ctx.parsed.query as any

      const result = await navigationService.getList(
        { scene, name, status },
        Number(page),
        Number(size)
      )

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '获取导航列表成功',
        data: result
      })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '获取导航列表失败', data: e?.message || e })
    }
  }
}

export { NavigationController }
