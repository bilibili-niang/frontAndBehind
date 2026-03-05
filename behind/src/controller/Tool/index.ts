import { body, responses, routeConfig } from 'koa-swagger-decorator'
import { Context } from 'koa'
import { TranslateReqType, TranslateResType, IllegalLogListRes } from './type'
import { ctxBody } from '@/utils'
import { paginationQuery } from '@/controller/common'
import { toolService } from '@/service/ToolService'

/**
 * 工具控制器
 * 只负责：接收请求、调用 Service、返回响应
 */
class ToolController {
  /**
   * 翻译
   */
  @routeConfig({
    method: 'post',
    path: '/tool/translate',
    summary: '翻译',
    tags: ['工具', '翻译'],
  })
  @body(TranslateReqType)
  @responses(TranslateResType)
  async translateWord(ctx: Context, args) {
    const { keyword } = args.body
    const res = await toolService.translate(keyword)

    ctx.body = ctxBody({
      success: true,
      code: 200,
      msg: `翻译一下`,
      data: res
    })
  }

  /**
   * 非法请求日志-分页查询
   */
  @routeConfig({
    method: 'get',
    path: '/tool/illegal-request/list',
    summary: '非法请求日志-分页查询',
    tags: ['工具', '系统日志'],
    request: {
      query: paginationQuery()
    }
  })
  @responses(IllegalLogListRes)
  async getIllegalRequestList(ctx: Context) {
    try {
      const { size, page } = ctx.parsed.query
      const res = await toolService.getIllegalRequestList(Number(page), Number(size))

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
