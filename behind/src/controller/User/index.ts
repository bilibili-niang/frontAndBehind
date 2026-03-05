import { Context } from 'koa'
import { body, middlewares, ParsedArgs, responses, routeConfig } from 'koa-swagger-decorator'
import {
  CreateUserReq,
  CreateUserRes,
  DeleteUserQuery,
  DeleteUserRes,
  IDeleteUserQuery,
  LoginReq,
  UserListRes,
  UserLoginRes
} from './type'
import { ICreateUserReq, ILoginReq } from '@/controller/User/type'
import { userService } from '@/service/UserService'
import { userRepository } from '@/repository/UserRepository'
import { ctxBody } from '@/utils'
import { headerParams, paginationQuery } from '@/controller/common/queryType'
import { jwtMust } from '@/middleware'
import { toInteger } from 'lodash'

/**
 * 用户控制器
 * 只负责：接收请求、调用 Service、返回响应
 */
class UserController {
  /**
   * 创建用户
   */
  @routeConfig({
    method: 'post',
    path: '/user/create',
    summary: '创建用户',
    tags: ['用户'],
  })
  @body(CreateUserReq)
  @responses(CreateUserRes)
  async CreateUser(ctx: Context, args: ParsedArgs<ICreateUserReq>) {
    try {
      const res = await userService.create(args.body)
      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '创建用户成功',
        data: res
      })
    } catch (e: unknown) {
      const error = e as { message?: string; errors?: Array<{ message: string }> }
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: error.message || '创建用户失败',
        data: error?.errors?.[0]?.message
      })
    }
  }

  /**
   * 用户登录
   */
  @routeConfig({
    method: 'post',
    path: '/user/login',
    summary: '用户登录',
    tags: ['用户', '登录']
  })
  @body(LoginReq)
  @responses(UserLoginRes)
  async UserLogin(ctx: Context, args: ParsedArgs<ILoginReq>) {
    try {
      const result = await userService.login(args.body)
      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '用户登录成功',
        data: result
      })
    } catch (e: unknown) {
      const error = e as { message?: string }
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: error.message || '用户登录失败',
        data: null
      })
    }
  }

  /**
   * 获取用户列表
   */
  @routeConfig({
    method: 'get',
    path: '/user/list',
    summary: '用户列表',
    tags: ['用户'],
    request: {
      headers: headerParams(),
      query: paginationQuery()
    },
  })
  @middlewares([jwtMust])
  @responses(UserListRes)
  async getUserList(ctx: Context) {
    try {
      const parsed = ctx.parsed?.query || {}
      const size = toInteger(parsed.size) || 10
      const current = toInteger(parsed.current) || toInteger(parsed.page) || 1

      const result = await userService.getUserList(current, size)

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '查询用户列表成功',
        data: {
          countId: '',
          current: result.current,
          maxLimit: result.size,
          optimizeCountSql: true,
          orders: [],
          pages: result.pages,
          records: result.records,
          searchCount: true,
          size: result.size,
          total: result.total
        }
      })
    } catch (e: unknown) {
      const error = e as { message?: string }
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: error.message || '查询用户列表失败',
        data: null
      })
    }
  }

  /**
   * 删除指定用户
   */
  @routeConfig({
    method: 'delete',
    path: '/user/delete',
    summary: '删除指定用户',
    tags: ['用户'],
    request: {
      headers: headerParams(),
      query: DeleteUserQuery
    }
  })
  @middlewares([jwtMust])
  @responses(DeleteUserRes)
  async deleteUser(ctx: Context, args: ParsedArgs<IDeleteUserQuery>) {
    try {
      const { id } = args.query
      const res = await userService.deleteUser(id)

      if (res === 0) {
        ctx.body = ctxBody({
          success: false,
          code: 500,
          msg: '删除用户失败，指定的用户不存在',
          data: res
        })
      } else {
        ctx.body = ctxBody({
          success: true,
          code: 200,
          msg: '删除用户成功'
        })
      }
    } catch (e: unknown) {
      const error = e as { message?: string }
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: error.message || '删除用户失败',
        data: null
      })
    }
  }
}

export { UserController }
