import { Context } from 'koa'
import { body, middlewares, ParsedArgs, responses, routeConfig } from 'koa-swagger-decorator'
import { ctxBody } from '@/utils'
import { headerParams, paginationQuery } from '@/controller/common/queryType'
import { jwtMust } from '@/middleware'
import { shopService } from '@/service/ShopService'
import { CreateShopReq, ShopCreateRes, ShopListRes, UpdateShopReq, ShopUpdateRes, DeleteShopQuery, ShopDeleteRes } from './type'

/**
 * 门店控制器
 * 只负责：接收请求、调用 Service、返回响应
 */
class ShopController {
  /**
   * 创建门店
   */
  @routeConfig({ method: 'post', path: '/shop/create', summary: '创建门店', tags: ['门店'] })
  @body(CreateShopReq)
  @responses(ShopCreateRes)
  async create(ctx: Context, args: ParsedArgs<any>) {
    try {
      const res = await shopService.create(args.body)
      ctx.body = ctxBody({ success: true, code: 200, msg: '创建门店成功', data: res })
    } catch (e: unknown) {
      const error = e as { errors?: Array<{ message: string }>; message?: string }
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: error.message || '创建门店失败',
        data: error?.errors?.[0]?.message
      })
    }
  }

  /**
   * 更新门店
   */
  @routeConfig({ method: 'put', path: '/shop/update/:id', summary: '更新门店', tags: ['门店'] })
  @body(UpdateShopReq)
  @responses(ShopUpdateRes)
  async update(ctx: Context, args: ParsedArgs<any>) {
    const id = ctx.params.id
    if (!id) {
      ctx.body = ctxBody({ success: false, code: 400, msg: '缺少门店ID参数', data: null })
      return
    }

    try {
      const res = await shopService.update(id, args.body)
      ctx.body = ctxBody({ success: true, code: 200, msg: '更新门店成功', data: res })
    } catch (e: unknown) {
      const error = e as { errors?: Array<{ message: string }>; message?: string }
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: error.message || '更新门店失败',
        data: error?.errors?.[0]?.message
      })
    }
  }

  /**
   * 门店列表
   */
  @routeConfig({
    method: 'get',
    path: '/shop/list',
    summary: '门店列表',
    tags: ['门店'],
    request: { headers: headerParams(), query: paginationQuery() }
  })
  @middlewares([jwtMust])
  @responses(ShopListRes)
  async list(ctx: Context) {
    try {
      const parsed = ctx.parsed?.query || {}
      const size = parseInt(parsed.size) || 10
      const current = parseInt(parsed.current) || parseInt(parsed.page) || 1

      const result = await shopService.getShopList(current, size)

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '查询门店列表成功',
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
        msg: error.message || '查询门店列表失败',
        data: null
      })
    }
  }

  /**
   * 删除门店
   */
  @routeConfig({
    method: 'delete',
    path: '/shop/delete',
    summary: '删除门店',
    tags: ['门店'],
    request: { headers: headerParams(), query: DeleteShopQuery }
  })
  @middlewares([jwtMust])
  @responses(ShopDeleteRes)
  async delete(ctx: Context, args: ParsedArgs<any>) {
    try {
      const { id } = args.query
      const res = await shopService.deleteShop(id)

      if (res === 0) {
        ctx.body = ctxBody({
          success: false,
          code: 500,
          msg: '删除门店失败，指定的门店不存在',
          data: res
        })
      } else {
        ctx.body = ctxBody({
          success: true,
          code: 200,
          msg: '删除门店成功'
        })
      }
    } catch (e: unknown) {
      const error = e as { message?: string }
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: error.message || '删除门店失败',
        data: null
      })
    }
  }
}

export { ShopController }
