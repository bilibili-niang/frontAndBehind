import { Context } from 'koa'
import { body, routeConfig, z } from 'koa-swagger-decorator'
import { ctxBody } from '@/utils'
import { uploadService, KoaBodyFile } from '@/service/UploadService'

/**
 * 上传控制器
 * 只负责：接收请求、调用 Service、返回响应
 */
class UploadController {
  /**
   * 单文件上传（图片优先）
   */
  @routeConfig({
    method: 'post',
    path: '/upload/image',
    summary: '单文件上传（图片优先）',
    tags: ['系统', '上传']
  })
  @body(z.object({}))
  async uploadImage(ctx: Context) {
    try {
      const files = (ctx.request as any)?.files || {}
      const file: KoaBodyFile | KoaBodyFile[] = (files as any).file || (files as any).image
      const target: KoaBodyFile = Array.isArray(file) ? (file[0] as any) : (file as any)

      if (!target || !(target.filepath || target.path)) {
        ctx.body = ctxBody({ success: false, code: 400, msg: '未接收到文件，请使用字段名 file', data: null })
        return
      }

      const result = uploadService.processSingleFile(target, ctx)

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '上传成功',
        data: result
      })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '上传失败', data: e?.message || e })
    }
  }

  /**
   * 批量上传文件
   */
  @routeConfig({
    method: 'post',
    path: '/upload/batch',
    summary: '批量上传文件',
    tags: ['系统', '上传']
  })
  async uploadBatch(ctx: Context) {
    try {
      const files = (ctx.request as any)?.files || {}
      const list: KoaBodyFile | KoaBodyFile[] = (files as any).files || (files as any).file
      const arr: KoaBodyFile[] = Array.isArray(list) ? (list as any) : [list as any]

      const result = uploadService.processBatchFiles(arr, ctx)

      if (result.length === 0) {
        ctx.body = ctxBody({ success: false, code: 400, msg: '未接收到文件数组，请使用字段名 files', data: null })
        return
      }

      ctx.body = ctxBody({ success: true, code: 200, msg: '批量上传成功', data: result })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '批量上传失败', data: e?.message || e })
    }
  }

  /**
   * 兼容老路径：单文件上传
   */
  @routeConfig({
    method: 'post',
    path: '/null-cornerstone-system/upload/image',
    summary: '兼容路径：单文件上传',
    tags: ['系统', '兼容']
  })
  async legacyImage(ctx: Context) {
    return this.uploadImage(ctx)
  }

  /**
   * 兼容老路径：批量上传
   */
  @routeConfig({
    method: 'post',
    path: '/null-cornerstone-system/upload/batch',
    summary: '兼容路径：批量上传',
    tags: ['系统', '兼容']
  })
  async legacyBatch(ctx: Context) {
    return this.uploadBatch(ctx)
  }
}

export { UploadController }
