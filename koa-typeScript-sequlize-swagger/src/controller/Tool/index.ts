import { body, responses, routeConfig } from 'koa-swagger-decorator'
import { Context } from 'koa'
import { TranslateReqType, TranslateResType, IllegalLogListRes } from './type'
import { $transform } from '@/service/tool'
import { ctxBody } from '@/utils'
import { paginationQuery } from '@/controller/common'
import { IllegalRequest } from '@/schema'

class ToolController {

  @routeConfig({
    method: 'post',
    path: '/api/tool/translate',
    summary: '翻译',
    tags: ['工具', '翻译'],
  })
  @body(TranslateReqType)
  @responses(TranslateResType)
  async translateWord(ctx: Context, args) {
    const { keyword } = args.body
    await $transform(keyword)
      .then(res => {
        ctx.body = ctxBody({
          success: true,
          code: 200,
          msg: `翻译一下`,
          data: res
        })
      })

  }

  @routeConfig({
    method: 'get',
    path: '/api/tool/illegal-request/list',
    summary: '非法请求日志-分页查询',
    tags: ['工具', '系统日志'],
    request: {
      query: paginationQuery()
    }
  })
  @responses(IllegalLogListRes)
  async getIllegalRequestList(ctx: Context) {
    const { size, page } = ctx.parsed.query
    try {
      const res = await IllegalRequest.findAndCountAll({
        limit: Number(size),
        offset: Number((page - 1) * size),
        order: [['createdAt', 'DESC']]
      })
      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '获取非法请求日志成功',
        data: res
      })
    } catch (e) {
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: '获取非法请求日志失败',
        data: e?.message || '服务器错误'
      })
    }
  }

}

export {
  ToolController
}