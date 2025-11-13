import { body, responses, routeConfig, z } from 'koa-swagger-decorator'
import { Context } from 'koa'
import { ctxBody, formatDateTime } from '@/utils'
import Navigation from '@/schema/navigation'
import { Op } from 'sequelize'

class NavigationController {
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
      const where: any = { status: 1 }
      // 与小程序端参数对齐：origin 映射到后端的 scene 字段
      where.scene = resolvedScene

      const row: any = await Navigation.findOne({
        where,
        order: [['updatedAt', 'DESC']]
      })

      let parsedConfig: any = {}
      if (row?.config) {
        try { parsedConfig = JSON.parse(row.config) } catch (_) { parsedConfig = row.config }
      }

      // 规范化底部导航的文案字段：选中时显示 activeText，未选中显示 text
      // 针对现有小程序（如 yesong）出现 text/activeText 反置的情况，在读取时进行纠正
      const normalizeTabLabels = (config: any) => {
        if (!config || typeof config !== 'object') return config
        const next: any = { ...config }
        if (Array.isArray(config.list)) {
          next.list = config.list.map((item: any) => {
            if (!item || typeof item !== 'object') return item
            const hasText = typeof item.text !== 'undefined' && item.text !== null
            const hasActiveText = typeof item.activeText !== 'undefined' && item.activeText !== null
            // 当两个字段都存在时，不做交换；只在缺失字段时补齐，避免语义反转
            if (hasText && hasActiveText) {
              return { ...item }
            }
            if (hasActiveText && !hasText) {
              return { ...item, text: item.activeText, activeText: item.activeText }
            }
            if (hasText && !hasActiveText) {
              return { ...item, activeText: item.text }
            }
            return item
          })
        }
        return next
      }

      // 仅在指定 scene（如 yesong）时执行规范化，避免影响其它场景
      if (resolvedScene) {
        parsedConfig = normalizeTabLabels(parsedConfig)
      }

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: row ? '获取已激活导航成功' : '未找到已激活导航，返回空配置',
        data: { items: parsedConfig }
      })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '获取已激活导航失败', data: e?.message || e })
    }
  }

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
    // 允许传入 object 或 string（JSON），统一入库为字符串
    config: z.union([z.string(), z.record(z.any())]).optional(),
    description: z.string().optional()
  }))
  async create(ctx: Context) {
    try {
      const data = ctx.parsed.body as any
      const payload = { ...data }
      if (payload.config && typeof payload.config === 'object') {
        payload.config = JSON.stringify(payload.config)
      }
      const res = await Navigation.create(payload)
      // 保证同一个 scene 仅有一个激活记录
      if (Number(res.status) === 1 && res.scene) {
        await Navigation.update(
          { status: 0 },
          { where: { scene: String(res.scene), id: { [Op.ne]: res.id }, status: 1 } }
        )
      }
      ctx.body = ctxBody({ success: true, code: 200, msg: '创建导航成功', data: res })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '创建导航失败', data: e?.message || e })
    }
  }

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
    // 允许传入 object 或 string（JSON），统一入库为字符串
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
      const payload = { ...rest }
      if (payload.config && typeof payload.config === 'object') {
        payload.config = JSON.stringify(payload.config)
      }
      await Navigation.update(payload, { where: { id } })
      const latest = await Navigation.findOne({ where: { id } })
      // 保证同一个 scene 仅有一个激活记录
      const latestScene = latest?.scene ?? rest?.scene
      if (latestScene && Number(latest?.status ?? rest?.status) === 1) {
        await Navigation.update(
          { status: 0 },
          { where: { scene: String(latestScene), id: { [Op.ne]: id }, status: 1 } }
        )
      }
      ctx.body = ctxBody({ success: true, code: 200, msg: '更新导航成功', data: latest })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '更新导航失败', data: e?.message || e })
    }
  }

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
      // 先查询，若状态为启用（使用中）则禁止删除
      const row: any = await Navigation.findOne({ where: { id } })
      if (!row) {
        ctx.body = ctxBody({ success: false, code: 404, msg: '指定导航不存在', data: null })
        return
      }
      if (Number(row.status) === 1) {
        ctx.body = ctxBody({ success: false, code: 403, msg: '当前导航处于使用中，无法删除，请先禁用', data: { id } })
        return
      }
      const count = await Navigation.destroy({ where: { id } })
      if (count === 0) {
        ctx.body = ctxBody({ success: false, code: 404, msg: '指定导航不存在', data: null })
      } else {
        ctx.body = ctxBody({ success: true, code: 200, msg: '删除导航成功', data: { id } })
      }
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '删除导航失败', data: e?.message || e })
    }
  }

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
      const row: any = await Navigation.findOne({ where: { id } })
      if (!row) {
        ctx.body = ctxBody({ success: false, code: 404, msg: '指定导航不存在', data: null })
        return
      }
      // 尝试把 config 解析为对象返回
      let parsedConfig: any = null
      if (row.config) {
        try { parsedConfig = JSON.parse(row.config) } catch (_) { parsedConfig = row.config }
      }
      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '获取导航详情成功',
        data: {
          id: row.id,
          name: row.name,
          scene: row.scene,
          status: row.status,
          editUser: row.editUser,
          description: row.description,
          createTime: formatDateTime(row.createdAt),
          updateTime: formatDateTime(row.updatedAt),
          config: parsedConfig
        }
      })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '获取导航详情失败', data: e?.message || e })
    }
  }

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
      const where: any = {}
      if (scene) where.scene = String(scene)
      if (typeof status !== 'undefined') where.status = Number(status)
      if (name) where.name = { [Op.like]: `%${name}%` }

      const limit = Number(size)
      const offset = (Number(page) - 1) * limit

      const res = await Navigation.findAndCountAll({
        where,
        limit,
        offset,
        order: [['updatedAt', 'DESC']]
      })

      const total = res.count
      const pages = Math.ceil(total / limit)
      const records = (res.rows || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        editUser: row.editUser,
        createTime: formatDateTime(row.createdAt),
        updateTime: formatDateTime(row.updatedAt),
        status: row.status,
        scene: row.scene
      }))

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '获取导航列表成功',
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
      ctx.body = ctxBody({ success: false, code: 500, msg: '获取导航列表失败', data: e?.message || e })
    }
  }
}

export { NavigationController }