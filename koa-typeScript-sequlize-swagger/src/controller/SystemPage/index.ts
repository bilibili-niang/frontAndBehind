import { body, routeConfig, z } from 'koa-swagger-decorator'
import { Op } from 'sequelize'
import { ctxBody, formatDateTime } from '@/utils'
import SystemPage from '@/schema/systemPage'

class SystemPageController {
  @routeConfig({
    method: 'post',
    path: '/system-page/create',
    summary: '创建系统页面',
    tags: ['装修-系统装修']
  })
  @body(
    z.object({
      scene: z.string().nonempty(),
      // 自定义页面无需 key，系统页面可继续传入
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
      const payload = { ...data }
      // 兼容旧字段：保持 name 与 title 一致
      payload.name = payload.title ?? payload.name
      if (payload.decorate && typeof payload.decorate === 'object') {
        payload.decorate = JSON.stringify(payload.decorate)
      }
      if (payload.config && typeof payload.config === 'object') {
        payload.config = JSON.stringify(payload.config)
      }
      payload.isDeleted = 0
      const res: any = await SystemPage.create(payload)

      // 返回规范化字段
      let parsedDecorate: any = null
      if (res?.decorate) {
        try { parsedDecorate = JSON.parse(res.decorate) } catch (_) { parsedDecorate = res.decorate }
      }
      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '创建系统页面成功',
        data: {
          id: res.id,
          tenantId: res.tenantId,
          key: res.key,
          title: res.title,
          tags: res.tags,
          decorate: parsedDecorate,
          origin: res.origin,
          version: res.version,
          createUser: res.createUser,
          updateUser: res.updateUser,
          createTime: formatDateTime(res.createdAt),
          updateTime: formatDateTime(res.updatedAt),
          isDeleted: res.isDeleted,
          // 兼容旧字段
          name: res.name,
          scene: res.scene,
          editUser: res.editUser,
          description: res.description
        }
      })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '创建系统页面失败', data: e?.message || e })
    }
  }

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
      const payload: any = { ...rest }
      if (payload.title && !payload.name) payload.name = payload.title
      if (payload.decorate && typeof payload.decorate === 'object') {
        payload.decorate = JSON.stringify(payload.decorate)
      }
      if (payload.config && typeof payload.config === 'object') {
        payload.config = JSON.stringify(payload.config)
      }
      const [count] = await SystemPage.update(payload, { where: { id } })
      if (count === 0) {
        ctx.body = ctxBody({ success: false, code: 404, msg: '更新失败，记录不存在', data: null })
        return
      }
      const latest: any = await SystemPage.findOne({ where: { id } })
      if (!latest) {
        ctx.body = ctxBody({ success: false, code: 404, msg: '更新失败，记录不存在', data: null })
        return
      }
      let parsedDecorate: any = null
      if (latest?.decorate) {
        try { parsedDecorate = JSON.parse(latest.decorate) } catch (_) { parsedDecorate = latest.decorate }
      }
      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '更新系统页面成功',
        data: {
          id: latest.id,
          tenantId: latest.tenantId,
          key: latest.key,
          title: latest.title,
          tags: latest.tags,
          decorate: parsedDecorate,
          origin: latest.origin,
          version: latest.version,
          createUser: latest.createUser,
          updateUser: latest.updateUser,
          createTime: formatDateTime(latest.createdAt),
          updateTime: formatDateTime(latest.updatedAt),
          isDeleted: latest.isDeleted,
          name: latest.name,
          scene: latest.scene,
          editUser: latest.editUser,
          description: latest.description
        }
      })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '更新系统页面失败', data: e?.message || e })
    }
  }

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
      // 先查询，若为系统保护页面则禁止删除
      const row: any = await SystemPage.findOne({ where: { id } })
      if (!row) {
        ctx.body = ctxBody({ success: false, code: 404, msg: '指定页面不存在', data: null })
        return
      }
      if (Number(row.isProtected) === 1) {
        ctx.body = ctxBody({ success: false, code: 403, msg: '系统默认页面不可删除', data: { id } })
        return
      }
      // 软删除（paranoid）并标记 isDeleted
      await SystemPage.update({ isDeleted: 1 }, { where: { id } })
      const count = await SystemPage.destroy({ where: { id } })
      if (count === 0) {
        ctx.body = ctxBody({ success: false, code: 404, msg: '指定页面不存在', data: null })
      } else {
        ctx.body = ctxBody({ success: true, code: 200, msg: '删除系统页面成功', data: { id } })
      }
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '删除系统页面失败', data: e?.message || e })
    }
  }

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
      const row: any = await SystemPage.findOne({ where: { id } })
      if (!row) {
        ctx.body = ctxBody({ success: false, code: 404, msg: '指定页面不存在', data: null })
        return
      }
      let parsedDecorate: any = null
      if (row?.decorate) {
        try { parsedDecorate = JSON.parse(row.decorate) } catch (_) { parsedDecorate = row.decorate }
      }
      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '获取系统页面详情成功',
        data: {
          id: row.id,
          tenantId: row.tenantId,
          key: row.key,
          title: row.title,
          tags: row.tags,
          decorate: parsedDecorate,
          origin: row.origin,
          version: row.version,
          createUser: row.createUser,
          updateUser: row.updateUser,
          createTime: formatDateTime(row.createdAt),
          updateTime: formatDateTime(row.updatedAt),
          isDeleted: row.isDeleted,
          // 兼容旧字段
          name: row.name,
          scene: row.scene,
          editUser: row.editUser,
          description: row.description
        }
      })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '获取系统页面详情失败', data: e?.message || e })
    }
  }

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

      const where: any = {}
      if (name) where.name = { [Op.like]: `%${name}%` }
      if (scene) where.scene = scene

      const limit = Number(size) || 20
      const offset = (Number(page) - 1) * limit

      const { count, rows } = await SystemPage.findAndCountAll({
        where,
        limit,
        offset,
        order: [['updatedAt', 'DESC']]
      })

      const total = count
      const pages = Math.ceil(total / limit)
      const records = (rows || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        scene: row.scene,
        editUser: row.editUser,
        description: row.description,
        // 新增字段（便于后续表格扩展）：
        key: row.key,
        title: row.title,
        version: row.version,
        createTime: formatDateTime(row.createdAt),
        updateTime: formatDateTime(row.updatedAt)
      }))

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '获取系统页面列表成功',
        data: {
          countId: '',
          current: Number(page),
          maxLimit: limit,
          optimizeCountSql: true,
          orders: [],
          pages,
          records,
          searchCount: true,
          size: limit,
          total
        }
      })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '获取系统页面列表失败', data: e?.message || e })
    }
  }
}

export { SystemPageController }