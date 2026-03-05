import { Context } from 'koa'
import { body, middlewares, ParsedArgs, responses, routeConfig } from 'koa-swagger-decorator'
import { ctxBody } from '@/utils'
import { getCurrentUserId } from '@/utils/auth'
import {
  resumeCreateReq,
  resumeDeleteRes,
  resumeDetailRes,
  resumeListRes,
  resumeUpdateReq,
  resumeUpdateRes
} from './type'
import { jwtMust, validateUserExist } from '@/middleware'
import { headerParams, paginationQuery } from '@/controller/common'
import { Resume } from '@/schema'
import { KoaContextWithUser } from '@/types'

// Resume 数据类型
interface ResumeData {
  id: string
  userId: string
  data?: string | object
  title?: string
  [key: string]: unknown
}

// 防脏数据的通用归一化
const toPlain = (r: Resume | ResumeData | null): ResumeData => {
  if (!r) return { id: '', userId: '', data: {} }
  const base: ResumeData = r && typeof (r as Resume).toJSON === 'function'
    ? (r as Resume).toJSON() as ResumeData
    : (typeof r === 'object' ? { ...r } : { id: '', userId: '', data: r })
  try {
    if (typeof base?.data === 'string') {
      base.data = JSON.parse(base.data || '{}')
    } else if (!base?.data || typeof base.data !== 'object') {
      base.data = {}
    }
  } catch {
    base.data = {}
  }
  return base
}

class ResumeController {
  @routeConfig({
    method: 'post',
    path: '/resume/create',
    summary: '创建简历',
    tags: ['简历'],
    request: {
      headers: headerParams(),
    }
  })
  @body(resumeCreateReq)
  @middlewares([
    jwtMust,
    validateUserExist
  ])
  async createResume(ctx: Context, args: ParsedArgs<{ body: ResumeData }>) {
    const body: ResumeData = { ...(args.body || {}) }
    if (body && typeof body.data === 'object') {
      body.data = JSON.stringify(body.data)
    }
    try {
      const res = await Resume.create(body)
      const plain = toPlain(res)
      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '创建成功',
        data: plain
      })
    } catch (e: unknown) {
      const error = e as { errors?: Array<{ message: string }> }
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: '创建失败',
        data: error?.errors?.[0]?.message
      })
    }
  }

  @routeConfig({
    method: 'get',
    path: '/resume/list',
    summary: '获取用户简历列表',
    tags: ['简历'],
    request: {
      headers: headerParams(),
      query: paginationQuery()
    }
  })
  @middlewares([
    jwtMust
  ])
  @responses(resumeListRes)
  async getResumeList(ctx: Context) {
    try {
      // 获取当前登录用户ID（兼容 ctx.decode 与 JWT 请求头）
      const userId = getCurrentUserId(ctx)
      if (!userId) {
        ctx.body = ctxBody({ success: false, code: 401, msg: '未登录或凭证无效', data: null })
        return
      }
      // 修改Sequelize查询参数，增加用户ID筛选
      const { size, page } = (ctx as KoaContextWithUser).parsed?.query || { size: 20, page: 1 }
      // 执行分页查询，只返回当前用户的简历
      const pageNum = Number(size ? page : 1) || 1
      const sizeNum = Number(size) || 20
      const result = await Resume.findAndCountAll({
        limit: sizeNum,
        offset: (pageNum - 1) * sizeNum,
        where: {
          userId
        }
      })
      const rows = (result.rows || []).map((r) => toPlain(r))
      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '获取简历列表成功',
        data: { count: result.count || rows.length, rows }
      })
    } catch (e: unknown) {
      const error = e as { message?: string }
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: '获取简历列表失败',
        data: error?.message || '服务器错误'
      })
    }
  }

  @routeConfig({
    method: 'get',
    path: '/resume/detail/:id',
    summary: '获取简历详情',
    tags: ['简历'],
    request: {
      headers: headerParams()
    }
  })
  @middlewares([
    jwtMust
  ])
  @responses(resumeDetailRes)
  async getResumeDetail(ctx: Context) {
    try {
      // 从URL路径参数获取ID，保留字符串格式
      const id = ctx.params.id
      if (!id) {
        ctx.body = ctxBody({
          success: false,
          code: 400,
          msg: '缺少简历ID参数',
          data: null
        })
        return
      }
      const userId = (ctx as KoaContextWithUser).decode?.id
      if (!userId) {
        ctx.body = ctxBody({
          success: false,
          code: 401,
          msg: '未登录或凭证无效',
          data: null
        })
        return
      }
      // 获取指定ID的简历，并确保属于当前用户
      // 使用字符串类型的id进行查询
      const resume = await Resume.findOne({
        where: {
          id: id.toString(), // 确保转换为字符串
          userId
        }
      })
      if (!resume) {
        ctx.body = ctxBody({
          success: false,
          code: 404,
          msg: '简历不存在或无权访问',
          data: null
        })
        return
      }
      const plain = toPlain(resume)
      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '获取简历详情成功',
        data: plain
      })
    } catch (e: unknown) {
      const error = e as { message?: string }
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: '获取简历详情失败',
        data: error?.message || '服务器错误'
      })
    }
  }

  @routeConfig({
    method: 'put',
    path: '/resume/update/:id',
    summary: '更新简历',
    tags: ['简历'],
    request: {
      headers: headerParams()
    }
  })
  @body(resumeUpdateReq)
  @middlewares([
    jwtMust
  ])
  @responses(resumeUpdateRes)
  async updateResume(ctx: Context, args: ParsedArgs<{ body: ResumeData }>) {
    try {
      // 从URL路径参数获取ID，保留字符串格式
      const id = ctx.params.id
      if (!id) {
        ctx.body = ctxBody({
          success: false,
          code: 400,
          msg: '缺少简历ID参数',
          data: null
        })
        return
      }
      const userId = (ctx as KoaContextWithUser).decode?.id
      if (!userId) {
        ctx.body = ctxBody({
          success: false,
          code: 401,
          msg: '未登录或凭证无效',
          data: null
        })
        return
      }
      const updateData: ResumeData = { ...(args.body || {}) }
      if (updateData && typeof updateData.data === 'object') {
        updateData.data = JSON.stringify(updateData.data)
      }
      // 采用静态更新，避免实例方法在某些场景不可用的问题
      const [count] = await Resume.update(updateData, {
        where: { id: id.toString(), userId }
      })
      if (count === 0) {
        ctx.body = ctxBody({
          success: false,
          code: 404,
          msg: '简历不存在或无权更新',
          data: null
        })
        return
      }
      // 读取最新数据返回
      const latest = await Resume.findOne({ where: { id: id.toString(), userId } })
      const plain = toPlain(latest)
      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '更新简历成功',
        data: plain
      })
    } catch (e: unknown) {
      const error = e as { message?: string }
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: '更新简历失败',
        data: error?.message || '服务器错误'
      })
    }
  }

  @routeConfig({
    method: 'delete',
    path: '/resume/delete/:id',
    summary: '删除简历',
    tags: ['简历'],
    request: {
      headers: headerParams()
    }
  })
  @middlewares([
    jwtMust
  ])
  @responses(resumeDeleteRes)
  async deleteResume(ctx: Context) {
    try {
      // 从URL路径参数获取ID
      const id = ctx.params.id

      // 如果ID为空或undefined，则返回错误
      if (!id) {
        ctx.body = ctxBody({
          success: false,
          code: 400,
          msg: '缺少简历ID参数',
          data: null
        })
        return
      }
      const userId = (ctx as KoaContextWithUser).decode?.id
      if (!userId) {
        ctx.body = ctxBody({
          success: false,
          code: 401,
          msg: '未登录或凭证无效',
          data: null
        })
        return
      }

      // 直接通过条件删除简历，不需要先查询再删除
      const result = await Resume.destroy({
        where: {
          id: id.toString(), // 确保转换为字符串
          userId  // 确保只能删除当前用户的简历
        }
      })

      // 如果删除了 0 条记录，说明简历不存在或不属于当前用户
      if (result === 0) {
        ctx.body = ctxBody({
          success: false,
          code: 404,
          msg: '简历不存在或无权删除',
          data: null
        })
        return
      }
      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '删除简历成功',
        data: null
      })
    } catch (e: unknown) {
      const error = e as { message?: string }
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: '删除简历失败',
        data: error?.message || '服务器错误'
      })
    }
  }
}

export {
  ResumeController
}
