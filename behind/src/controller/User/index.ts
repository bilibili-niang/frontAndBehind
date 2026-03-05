import md5 from 'md5'
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
import User from '@/schema/user'
import { ctxBody, deleteByIdMiddleware, jwtEncryption, paginationMiddleware } from '@/utils'
import { headerParams, paginationQuery } from '@/controller/common/queryType'
import { jwtMust } from '@/middleware'
import { Op } from 'sequelize'
import { KoaContextWithUser, UserInfo } from '@/types'

class UserController {
  @routeConfig({
    method: 'post',
    path: '/user/create',
    summary: '创建用户',
    tags: ['用户'],
  })
  @body(CreateUserReq)
  @responses(CreateUserRes)
  async CreateUser(ctx: Context, args: ParsedArgs<ICreateUserReq>) {
    const { password, ...restData } = args.body
    try {
      const res = await User.create({
        ...restData,
        password: md5(password)
      })
      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '创建用户成功',
        data: res
      })
    } catch (e: unknown) {
      const error = e as { errors?: Array<{ message: string }> }
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: '创建用户失败',
        data: error?.errors?.[0]?.message
      })
    }
  }

  @routeConfig({
    method: 'post',
    path: '/user/login',
    summary: '用户登录',
    tags: ['用户', '登录']
  })
  @body(LoginReq)
  @responses(UserLoginRes)
  async UserLogin(ctx: Context, args: ParsedArgs<ILoginReq>) {
    const loginError = (e: unknown) => {
      return ctxBody({
        success: false,
        code: 500,
        msg: '用户登录失败',
        data: e
      })
    }
    const { account, userName, phoneNumber, password } = args.body
    // 跨字段校验：至少提供 account、userName 或 phoneNumber 其一
    if (!account && !userName && !phoneNumber) {
      ctx.body = ctxBody({
        success: false,
        code: 400,
        msg: '账号错误：account、userName 或 phoneNumber 至少提供一个',
        data: null
      })
      return
    }

    // 根据提供的字段构建查询条件
    interface WhereCondition {
      password: string
      [Op.or]?: Array<{ userName?: string } | { phoneNumber?: string }>
      userName?: string
      phoneNumber?: string
    }

    let whereCondition: WhereCondition = { password }

    if (account) {
      // 如果提供了通用账号字段，支持用户名或手机号登录
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { userName: account },
          { phoneNumber: account }
        ]
      }
    } else if (userName) {
      whereCondition = { ...whereCondition, userName }
    } else if (phoneNumber) {
      whereCondition = { ...whereCondition, phoneNumber }
    }

    try {
      const res = await User.findOne({
        where: whereCondition
      })
      if (res) {
        const plain = typeof res.toJSON === 'function' ? res.toJSON() : res
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = plain
        const token = jwtEncryption(userWithoutPassword)
        const userInfo: UserInfo = {
          id: plain.id,
          userName: plain.userName,
          avatar: plain.avatar,
          phoneNumber: plain.phoneNumber,
          email: plain.email,
          gender: plain.gender,
          isAdmin: plain.isAdmin,
          status: plain.status,
          createdAt: plain.createdAt,
          updatedAt: plain.updatedAt,
        }
        ctx.body = ctxBody({
          success: true,
          code: 200,
          msg: '用户登录成功',
          data: {
            token,
            userInfo
          }
        })
      } else {
        ctx.body = loginError(null)
      }
    } catch (e: unknown) {
      ctx.body = loginError(e)
    }
  }

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
  @middlewares([
    jwtMust
  ])
  @responses(UserListRes)
  async getUserList(ctx: Context, args: ParsedArgs<ICreateUserReq>) {
    await paginationMiddleware(ctx, User, '用户列表')
  }

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
  @middlewares([
    jwtMust
  ])
  @responses(DeleteUserRes)
  async deleteUser(ctx: Context, args: ParsedArgs<IDeleteUserQuery>) {
    await deleteByIdMiddleware(ctx, User, '用户')
  }
}

export { UserController }
