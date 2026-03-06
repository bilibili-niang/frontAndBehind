import { body, routeConfig, z } from 'koa-swagger-decorator'
import { Context } from 'koa'
import { ctxBody } from '@/utils'
import { decorateService } from '@/service/DecorateService'
import {
  DecorateQuery,
  DecorateParams,
  CreateDecorateBody,
  UpdateDecorateBody,
  CustomizeListCriteria
} from '@/types/decorate'
import { getErrorMessage } from '@/types/controller'

/**
 * 装修控制器
 * 只负责：接收请求、调用 Service、返回响应
 */
class DecorateController {
  /**
   * 系统装修页面详情（按 key/scene 查询）
   */
  @routeConfig({
    method: 'get',
    path: '/decorate/system/detail',
    summary: '系统装修页面详情（按 key/scene 查询）',
    tags: ['装修-系统装修'],
    request: {
      query: z.object({
        key: z.string().nonempty(),
        scene: z.string().optional()
      })
    }
  })
  async systemDetail(ctx: Context) {
    try {
      const { key, scene } = ctx.parsed?.query as DecorateQuery

      if (!key) {
        ctx.body = ctxBody({ success: false, code: 400, msg: 'key 不能为空', data: null })
        return
      }

      const detail = await decorateService.getSystemPageDetail(key, scene)

      if (!detail) {
        ctx.body = ctxBody({ success: false, code: 404, msg: '未找到匹配的系统页面', data: null })
        return
      }

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '获取系统装修页面详情成功',
        data: detail
      })
    } catch (e: unknown) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '获取系统装修页面详情失败', data: getErrorMessage(e) })
    }
  }

  /**
   * 自定义装修页面列表（分页）
   */
  @routeConfig({
    method: 'get',
    path: '/decorate/customize/list',
    summary: '自定义装修页面列表（分页）',
    tags: ['装修-自定义装修'],
    request: {
      query: z.object({
        scene: z.string().optional(),
        name: z.string().optional(),
        onlyDecorated: z.coerce.boolean().default(true),
        size: z.coerce.number().default(20).transform(v => (v > 0 ? v : 20)),
        page: z.coerce.number().default(1).transform(v => (v > 0 ? v : 1))
      })
    }
  })
  async customizeList(ctx: Context) {
    try {
      const { size, page, name, scene, onlyDecorated } = ctx.parsed?.query as DecorateQuery

      const criteria: CustomizeListCriteria = { scene, name, onlyDecorated }
      const result = await decorateService.getCustomPageList(
        criteria,
        Number(page),
        Number(size)
      )

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '获取自定义装修页面列表成功',
        data: result
      })
    } catch (e: unknown) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '获取自定义装修页面列表失败', data: getErrorMessage(e) })
    }
  }

  /**
   * 创建自定义装修页面
   */
  @routeConfig({
    method: 'post',
    path: '/decorate/customize/create',
    summary: '创建自定义装修页面',
    tags: ['装修-自定义装修']
  })
  @body(z.object({
    scene: z.string(),
    title: z.string(),
    description: z.string().optional(),
    editUser: z.string().optional(),
    version: z.string().optional(),
    decorate: z.union([z.string(), z.record(z.unknown())]).optional()
  }))
  async create(ctx: Context) {
    try {
      const body = (ctx.parsed?.body || ctx.request.body || {}) as CreateDecorateBody
      const { scene, title, decorate, description, editUser, version } = body

      if (!scene || !title) {
        ctx.body = ctxBody({ success: false, code: 400, msg: 'scene 与 title 不能为空' })
        return
      }

      const result = await decorateService.createCustomPage({
        scene,
        title,
        decorate,
        description,
        editUser,
        version
      })

      ctx.body = ctxBody({ success: true, code: 200, msg: '创建自定义页面成功', data: result })
    } catch (e: unknown) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '创建自定义页面失败', data: getErrorMessage(e) })
    }
  }

  /**
   * 更新自定义装修页面
   */
  @routeConfig({
    method: 'put',
    path: '/decorate/customize/update/:id',
    summary: '更新自定义装修页面',
    tags: ['装修-自定义装修']
  })
  @body(z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    editUser: z.string().optional(),
    version: z.string().optional(),
    decorate: z.union([z.string(), z.record(z.unknown())]).optional()
  }))
  async update(ctx: Context) {
    try {
      const parsedBody = (ctx.parsed?.body || ctx.request.body || {}) as UpdateDecorateBody
      const pathId = (ctx.params as DecorateParams)?.id
      const id = String(pathId || '')

      if (!id) {
        ctx.body = ctxBody({ success: false, code: 400, msg: '缺少更新目标：id 必须在路径中提供' })
        return
      }

      const { title, decorate, description, editUser, version } = parsedBody

      const success = await decorateService.updateCustomPage(id, {
        title,
        decorate,
        description,
        editUser,
        version
      })

      if (!success) {
        ctx.body = ctxBody({ success: false, code: 404, msg: '更新失败，记录不存在' })
        return
      }

      ctx.body = ctxBody({ success: true, code: 200, msg: '更新自定义页面成功' })
    } catch (e: unknown) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '更新自定义页面失败', data: getErrorMessage(e) })
    }
  }

  /**
   * 获取自定义装修页面详情
   */
  @routeConfig({
    method: 'get',
    path: '/decorate/customize/detail',
    summary: '获取自定义装修页面详情',
    tags: ['装修-自定义装修'],
    request: {
      query: z.object({ id: z.string().nonempty() })
    }
  })
  async detail(ctx: Context) {
    try {
      const { id } = ctx.parsed?.query as DecorateQuery

      if (!id) {
        ctx.body = ctxBody({ success: false, code: 400, msg: 'id 不能为空' })
        return
      }

      const detail = await decorateService.getCustomPageDetail(id)

      if (!detail) {
        ctx.body = ctxBody({ success: false, code: 404, msg: '记录不存在' })
        return
      }

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '获取详情成功',
        data: detail
      })
    } catch (e: unknown) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '获取详情失败', data: getErrorMessage(e) })
    }
  }

  /**
   * 删除自定义装修页面
   */
  @routeConfig({
    method: 'delete',
    path: '/decorate/customize/delete',
    summary: '删除自定义装修页面',
    tags: ['装修-自定义装修'],
    request: {
      query: z.object({ id: z.string().nonempty() })
    }
  })
  async delete(ctx: Context) {
    try {
      const { id } = ctx.parsed?.query as DecorateQuery

      if (!id) {
        ctx.body = ctxBody({ success: false, code: 400, msg: 'id 不能为空' })
        return
      }

      const success = await decorateService.deleteCustomPage(id)

      if (!success) {
        ctx.body = ctxBody({ success: false, code: 404, msg: '删除失败，记录不存在' })
        return
      }

      ctx.body = ctxBody({ success: true, code: 200, msg: '删除自定义页面成功' })
    } catch (e: unknown) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '删除自定义页面失败', data: getErrorMessage(e) })
    }
  }
}

export { DecorateController }
