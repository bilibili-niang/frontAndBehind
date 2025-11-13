import { Context } from 'koa'
import { body, middlewares, ParsedArgs, responses, routeConfig } from 'koa-swagger-decorator'
import Shop from '@/schema/shop'
import { generateShopCode } from '@/utils/generateShopCode'
import { ctxBody, deleteByIdMiddleware, paginationMiddleware } from '@/utils'
import { headerParams, paginationQuery } from '@/controller/common/queryType'
import { jwtMust } from '@/middleware'
import { CreateShopReq, ShopCreateRes, ShopListRes, UpdateShopReq, ShopUpdateRes, DeleteShopQuery, ShopDeleteRes } from './type'

class ShopController {
  @routeConfig({ method: 'post', path: '/shop/create', summary: '创建门店', tags: ['门店'] })
  @body(CreateShopReq)
  @responses(ShopCreateRes)
  async create(ctx: Context, args: ParsedArgs<any>) {
    const data = args.body
    // 若未提供业务编码 code，后端自动生成，避免前端必须传
    if (!data.code) {
      data.code = generateShopCode()
    }
    // 兜底：若 location 存在但为 number，则统一转为 string
    if (data.location) {
      data.location = {
        ...(data.location || {}),
        lng: `${data.location?.lng ?? ''}`,
        lat: `${data.location?.lat ?? ''}`
      }
    }
    // 兼容 location 与经纬度的传入
    if (!data.location && (data.longitude || data.latitude)) {
      const lng = `${data.longitude ?? ''}`
      const lat = `${data.latitude ?? ''}`
      data.location = { lng, lat }
    }
    await Shop.create(data)
      .then((res: any) => {
        ctx.body = ctxBody({ success: true, code: 200, msg: '创建门店成功', data: res })
      })
      .catch((e) => {
        ctx.body = ctxBody({ success: false, code: 500, msg: '创建门店失败', data: e?.errors?.[0]?.message })
      })
  }

  @routeConfig({ method: 'put', path: '/shop/update/:id', summary: '更新门店', tags: ['门店'] })
  @body(UpdateShopReq)
  @responses(ShopUpdateRes)
  async update(ctx: Context, args: ParsedArgs<any>) {
    const id = ctx.params.id
    if (!id) {
      ctx.body = ctxBody({ success: false, code: 400, msg: '缺少门店ID参数', data: null })
      return
    }
    const rest = args.body
    // 兜底：若 location 存在但为 number，则统一转为 string
    if (rest.location) {
      rest.location = {
        ...(rest.location || {}),
        lng: `${rest.location?.lng ?? ''}`,
        lat: `${rest.location?.lat ?? ''}`
      }
    }
    if (!rest.location && (rest.longitude || rest.latitude)) {
      const lng = `${rest.longitude ?? ''}`
      const lat = `${rest.latitude ?? ''}`
      rest.location = { lng, lat }
    }
    await Shop.update(rest, { where: { id: id.toString() } })
      .then(async () => {
        const target = await Shop.findByPk(id)
        ctx.body = ctxBody({ success: true, code: 200, msg: '更新门店成功', data: target })
      })
      .catch((e) => {
        ctx.body = ctxBody({ success: false, code: 500, msg: '更新门店失败', data: e?.errors?.[0]?.message })
      })
  }

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
    // 支持 name 查询：paginationMiddleware 会自动读取 ctx.request.query 的分页参数
    await paginationMiddleware(ctx, Shop, '门店列表')
  }

  @routeConfig({ method: 'delete', path: '/shop/delete', summary: '删除门店', tags: ['门店'], request: { headers: headerParams(), query: DeleteShopQuery } })
  @middlewares([jwtMust])
  @responses(ShopDeleteRes)
  async delete(ctx: Context, args: ParsedArgs<any>) {
    await deleteByIdMiddleware(ctx, Shop, '门店')
  }
}

export { ShopController }