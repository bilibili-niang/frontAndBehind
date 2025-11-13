import { body, routeConfig, z } from 'koa-swagger-decorator'
import { Op } from 'sequelize'
import { ctxBody, formatDateTime } from '@/utils'
import CustomPage from '@/schema/customPage'
import SystemPage from '@/schema/systemPage'

class DecorateController {
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
  async systemDetail(ctx: any) {
    try {
      const { key, scene } = ctx.parsed.query as any
      if (!key) {
        ctx.body = ctxBody({ success: false, code: 400, msg: 'key 不能为空', data: null })
        return
      }

      const where: any = { key }
      if (scene) where.scene = scene
      where.isDeleted = 0

      const row: any = await SystemPage.findOne({ where, order: [['updatedAt', 'DESC']] })
      if (!row) {
        ctx.body = ctxBody({ success: false, code: 404, msg: '未找到匹配的系统页面', data: null })
        return
      }

      let parsedDecorate: any = null
      if (row?.decorate) {
        try { parsedDecorate = JSON.parse(row.decorate) } catch (_) { parsedDecorate = row.decorate }
      }

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '获取系统装修页面详情成功',
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
      ctx.body = ctxBody({ success: false, code: 500, msg: '获取系统装修页面详情失败', data: e?.message || e })
    }
  }
  @routeConfig({
    method: 'get',
    path: '/decorate/customize/list',
    summary: '自定义装修页面列表（分页）',
    tags: ['装修-自定义装修'],
    request: {
      query: z.object({
        scene: z.string().optional(),
        name: z.string().optional(),
        // 仅返回已装修的页面（decorate 非空）；默认 true
        onlyDecorated: z.coerce.boolean().default(true),
        size: z.coerce.number().default(20).transform(v => (v > 0 ? v : 20)),
        page: z.coerce.number().default(1).transform(v => (v > 0 ? v : 1))
      })
    }
  })
  async customizeList(ctx: any) {
    try {
      const { size, page, name, scene, onlyDecorated } = ctx.parsed.query as any

      const where: any = {}
      if (name) where.name = { [Op.like]: `%${name}%` }
      if (scene) where.scene = scene
      if (onlyDecorated) {
        // 仅返回有装修配置的页面
        where.decorate = { [Op.not]: null }
      }

      const limit = Number(size) || 20
      const offset = (Number(page) - 1) * limit

      const { count, rows } = await CustomPage.findAndCountAll({
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
        // 自定义页面无 key
        title: row.name,
        version: row.version,
        createTime: formatDateTime(row.createdAt),
        updateTime: formatDateTime(row.updatedAt)
      }))

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '获取自定义装修页面列表成功',
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
      ctx.body = ctxBody({ success: false, code: 500, msg: '获取自定义装修页面列表失败', data: e?.message || e })
    }
  }

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
    decorate: z.union([z.string(), z.record(z.any())]).optional()
  }))
  async create(ctx: any) {
    try {
      const body = ctx.parsed.body || ctx.request.body || {}
      const { scene, title, decorate, description, editUser, version } = body

      if (!scene || !title) {
        ctx.body = ctxBody({ success: false, code: 400, msg: 'scene 与 title 不能为空' })
        return
      }

      const payload: any = {
        name: title,
        scene,
        description: description || null,
        editUser: editUser || null,
        version: version || null
      }
      if (decorate) {
        payload.decorate = typeof decorate === 'string' ? decorate : JSON.stringify(decorate)
      }

      const created = await CustomPage.create(payload)
      ctx.body = ctxBody({ success: true, code: 200, msg: '创建自定义页面成功', data: { id: created.id } })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '创建自定义页面失败', data: e?.message || e })
    }
  }

  @routeConfig({
    method: 'put',
    path: '/decorate/customize/update/:id',
    summary: '更新自定义装修页面',
    tags: ['装修-自定义装修']
  })
  @body(z.object({
    // REST：id 通过路径参数传递
    title: z.string().optional(),
    description: z.string().optional(),
    editUser: z.string().optional(),
    version: z.string().optional(),
    decorate: z.union([z.string(), z.record(z.any())]).optional()
  }))
  async update(ctx: any) {
    try {
      const parsedBody = ctx.parsed.body || ctx.request.body || {}
      const pathId = (ctx.params as any)?.id
      const id = String(pathId || '')
      if (!id) {
        ctx.body = ctxBody({ success: false, code: 400, msg: '缺少更新目标：id 必须在路径中提供' })
        return
      }

      const { title, decorate, description, editUser, version } = parsedBody
      const updates: any = {}
      if (title) updates.name = title
      if (description !== undefined) updates.description = description
      if (editUser !== undefined) updates.editUser = editUser
      if (version !== undefined) updates.version = version
      if (decorate !== undefined) {
        updates.decorate = typeof decorate === 'string' ? decorate : JSON.stringify(decorate)
      }

      const [count] = await CustomPage.update(updates, { where: { id } })
      if (count === 0) {
        ctx.body = ctxBody({ success: false, code: 404, msg: '更新失败，记录不存在' })
        return
      }
      ctx.body = ctxBody({ success: true, code: 200, msg: '更新自定义页面成功' })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '更新自定义页面失败', data: e?.message || e })
    }
  }

  @routeConfig({
    method: 'get',
    path: '/decorate/customize/detail',
    summary: '获取自定义装修页面详情',
    tags: ['装修-自定义装修'],
    request: {
      query: z.object({ id: z.string().nonempty() })
    }
  })
  async detail(ctx: any) {
    try {
      const { id } = ctx.parsed.query
      if (!id) {
        ctx.body = ctxBody({ success: false, code: 400, msg: 'id 不能为空' })
        return
      }
      const row: any = await CustomPage.findByPk(id)
      if (!row) {
        ctx.body = ctxBody({ success: false, code: 404, msg: '记录不存在' })
        return
      }
      // 解析 decorate JSON
      let parsedDecorate: any = null
      if (row.decorate) {
        try { parsedDecorate = JSON.parse(row.decorate) } catch (_) { parsedDecorate = row.decorate }
      }
      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '获取详情成功',
        data: {
          id: row.id,
          name: row.name,
          scene: row.scene,
          editUser: row.editUser,
          description: row.description,
          title: row.name,
          version: row.version,
          decorate: parsedDecorate,
          createTime: formatDateTime(row.createdAt),
          updateTime: formatDateTime(row.updatedAt)
        }
      })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '获取详情失败', data: e?.message || e })
    }
  }

  @routeConfig({
    method: 'delete',
    path: '/decorate/customize/delete',
    summary: '删除自定义装修页面',
    tags: ['装修-自定义装修'],
    request: {
      query: z.object({ id: z.string().nonempty() })
    }
  })
  async delete(ctx: any) {
    try {
      const { id } = ctx.parsed.query
      if (!id) {
        ctx.body = ctxBody({ success: false, code: 400, msg: 'id 不能为空' })
        return
      }
      const count = await CustomPage.destroy({ where: { id } })
      if (count === 0) {
        ctx.body = ctxBody({ success: false, code: 404, msg: '删除失败，记录不存在' })
        return
      }
      ctx.body = ctxBody({ success: true, code: 200, msg: '删除自定义页面成功' })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '删除自定义页面失败', data: e?.message || e })
    }
  }
}

export { DecorateController }