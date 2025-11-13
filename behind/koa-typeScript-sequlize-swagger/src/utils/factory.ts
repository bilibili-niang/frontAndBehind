import { ctxBody } from '@/utils'
import seq from '@/config/db'
import { toInteger } from 'lodash'

seq


/*
* 构建一个分页查询
* @param {ctx} koa的Context
* @param {model} sequelize的model
* @param {msg} 分页查询的提示信息
* */
const paginationMiddleware = async (ctx: any, model: any, msg?: string) => {
  const parsed: any = ctx.parsed?.query || {}
  // 兼容 current/page 两种命名
  const size = toInteger(parsed.size)
  const currentFromReq = toInteger((ctx.request?.query as any)?.current)
  const page = toInteger(parsed.page)
  const current = currentFromReq > 0 ? currentFromReq : (page > 0 ? page : 1)

  const limit = size > 0 ? size : 10
  const offset = (current - 1) * limit

  await model.findAndCountAll({
    limit: limit,
    offset: offset,
    // 排除敏感字段
    attributes: { exclude: ['password'] }
  })
    .then((res: any) => {
      const total = toInteger(res?.count ?? 0)
      const pages = total > 0 ? Math.ceil(total / limit) : 0
      const records = Array.isArray(res?.rows) ? res.rows : []

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: `查询${msg}成功`,
        data: {
          countId: '',
          current,
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
    })
    .catch(e => {
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: `查询${msg}失败`,
        data: e
      })
    })
}
/*
* 通过id删除
* */
const deleteByIdMiddleware = async (ctx: any, model: any, msg?: string) => {
  const { id } = ctx.parsed.query
  await model.destroy({
    where: {
      id
    }
  })
    .then((res: any) => {
      if (res === 0) {
        ctx.body = ctxBody({
          success: false,
          code: 500,
          msg: `删除${msg}失败,指定的id不存在`,
          data: res
        })
      } else {
        ctx.body = ctxBody({
          success: true,
          code: 200,
          msg: `删除${msg}成功`,
        })
      }
    })
    .catch(e => {
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: `删除${msg}失败`,
        data: e
      })
    })
}

export {
  paginationMiddleware,
  deleteByIdMiddleware
}


