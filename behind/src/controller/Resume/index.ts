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
import { resumeService } from '@/service/ResumeService'
import { KoaContextWithUser } from '@/types'

/**
 * 简历控制器
 * 只负责：接收请求、调用 Service、返回响应
 */
class ResumeController {
  /**
   * 创建简历
   */
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
  @middlewares([jwtMust, validateUserExist])
  async createResume(ctx: Context, args: ParsedArgs<{ body: any }>) {
    try {
      const userId = getCurrentUserId(ctx)
      if (!userId) {
        ctx.body = ctxBody({ success: false, code: 401, msg: '未登录或凭证无效', data: null })
        return
      }

      const res = await resumeService.create({
        userId,
        ...args.body
      })

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '创建成功',
        data: res
      })
    } catch (e: unknown) {
      const error = e as { errors?: Array<{ message: string }>; message?: string }
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: error.message || '创建失败',
        data: error?.errors?.[0]?.message
      })
    }
  }

  /**
   * 获取用户简历列表
   */
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
  @middlewares([jwtMust])
  @responses(resumeListRes)
  async getResumeList(ctx: Context) {
    try {
      const userId = getCurrentUserId(ctx)
      if (!userId) {
        ctx.body = ctxBody({ success: false, code: 401, msg: '未登录或凭证无效', data: null })
        return
      }

      const { size, page, current } = (ctx as KoaContextWithUser).parsed?.query || { size: 20, page: 1 }
      const pageNum = Number(current ? current : (page || 1)) || 1
      const sizeNum = Number(size) || 20

      const result = await resumeService.getResumeList(userId, pageNum, sizeNum)

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '获取简历列表成功',
        data: { count: result.count, rows: result.rows }
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

  /**
   * 获取简历详情
   */
  @routeConfig({
    method: 'get',
    path: '/resume/detail/:id',
    summary: '获取简历详情',
    tags: ['简历'],
    request: {
      headers: headerParams()
    }
  })
  @middlewares([jwtMust])
  @responses(resumeDetailRes)
  async getResumeDetail(ctx: Context) {
    try {
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

      const resume = await resumeService.getResumeDetail(id.toString(), userId)

      if (!resume) {
        ctx.body = ctxBody({
          success: false,
          code: 404,
          msg: '简历不存在或无权访问',
          data: null
        })
        return
      }

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '获取简历详情成功',
        data: resume
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

  /**
   * 更新简历
   */
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
  @middlewares([jwtMust])
  @responses(resumeUpdateRes)
  async updateResume(ctx: Context, args: ParsedArgs<{ body: any }>) {
    try {
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

      const resume = await resumeService.update(id.toString(), userId, args.body)

      if (!resume) {
        ctx.body = ctxBody({
          success: false,
          code: 404,
          msg: '简历不存在或无权更新',
          data: null
        })
        return
      }

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '更新简历成功',
        data: resume
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

  /**
   * 删除简历
   */
  @routeConfig({
    method: 'delete',
    path: '/resume/delete/:id',
    summary: '删除简历',
    tags: ['简历'],
    request: {
      headers: headerParams()
    }
  })
  @middlewares([jwtMust])
  @responses(resumeDeleteRes)
  async deleteResume(ctx: Context) {
    try {
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

      const result = await resumeService.deleteResume(id.toString(), userId)

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

export { ResumeController }
