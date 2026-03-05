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

/**
 * 用户控制器
 * 处理用户相关的业务逻辑，包括用户创建、登录、查询和删除
 */
class UserController {
  /**
   * 创建用户
   * @param ctx - Koa 上下文对象
   * @param args - 请求参数，包含用户创建信息
   * @description
   * 1. 接收用户创建请求，密码使用 MD5 加密存储
   * 2. 调用 User.create 创建用户记录
   * 3. 返回创建结果，成功返回 200，失败返回 500
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

  /**
   * 用户登录
   * @param ctx - Koa 上下文对象
   * @param args - 请求参数，包含登录凭证
   * @description
   * 登录逻辑说明：
   * 1. 支持三种登录方式：
   *    - account: 通用账号（可以是用户名或手机号）
   *    - userName: 用户名登录
   *    - phoneNumber: 手机号登录
   * 2. 必须提供至少一种账号标识，否则返回 400 错误
   * 3. 密码使用 MD5 加密后与数据库比对
   * 4. 登录成功后：
   *    - 生成 JWT Token（不包含密码字段）
   *    - 返回用户基本信息
   * 5. 登录失败返回 500 错误
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

  /**
   * 获取用户列表
   * @param ctx - Koa 上下文对象
   * @param args - 请求参数，包含分页信息
   * @description
   * 使用分页中间件查询用户列表，需要 JWT 认证
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
  @middlewares([
    jwtMust
  ])
  @responses(UserListRes)
  async getUserList(ctx: Context, args: ParsedArgs<ICreateUserReq>) {
    await paginationMiddleware(ctx, User, '用户列表')
  }

  /**
   * 删除指定用户
   * @param ctx - Koa 上下文对象
   * @param args - 请求参数，包含用户 ID
   * @description
   * 使用删除中间件删除指定用户，需要 JWT 认证
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
  @middlewares([
    jwtMust
  ])
  @responses(DeleteUserRes)
  async deleteUser(ctx: Context, args: ParsedArgs<IDeleteUserQuery>) {
    await deleteByIdMiddleware(ctx, User, '用户')
  }
}

export { UserController }
