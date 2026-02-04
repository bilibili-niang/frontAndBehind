import { Context } from 'koa'
import path from 'path'
import fs from 'fs'
import { body, routeConfig, z } from 'koa-swagger-decorator'
import { ctxBody } from '@/utils'

type KoaBodyFile = {
  filepath?: string
  path?: string
  size?: number
  type?: string
  mimetype?: string
  name?: string
  originalFilename?: string
}

const ensureUploadDir = (absUploadDir: string) => {
  try {
    if (!fs.existsSync(absUploadDir)) {
      fs.mkdirSync(absUploadDir, { recursive: true })
    }
  } catch (_) {}
}

const getSafeFilename = (file: KoaBodyFile) => {
  const fp = (file.filepath || file.path || '') as string
  return path.basename(fp)
}

const buildPublicUrl = (ctx: Context, filename: string) => {
  const origin = ctx.origin || `${ctx.protocol}://${ctx.host}`
  return `${origin}/upload/${filename}`
}

class UploadController {
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

      const filename = getSafeFilename(target)
      const url = buildPublicUrl(ctx, filename)

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '上传成功',
        data: {
          url,
          uri: filename,
          size: target.size || 0,
          mime: (target.mimetype || target.type || ''),
          filename: (target.originalFilename || target.name || filename)
        }
      })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '上传失败', data: e?.message || e })
    }
  }

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
      const result = arr
        .filter(f => f && (f.filepath || f.path))
        .map(f => {
          const filename = getSafeFilename(f)
          return {
            url: buildPublicUrl(ctx, filename),
            uri: filename,
            size: f.size || 0,
            mime: (f.mimetype || f.type || ''),
            filename: (f.originalFilename || f.name || filename)
          }
        })

      if (result.length === 0) {
        ctx.body = ctxBody({ success: false, code: 400, msg: '未接收到文件数组，请使用字段名 files', data: null })
        return
      }

      ctx.body = ctxBody({ success: true, code: 200, msg: '批量上传成功', data: result })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '批量上传失败', data: e?.message || e })
    }
  }

  // 兼容老路径：/null-cornerstone-system/upload/image
  @routeConfig({ method: 'post', path: '/null-cornerstone-system/upload/image', summary: '兼容路径：单文件上传', tags: ['系统', '兼容'] })
  async legacyImage(ctx: Context) { return this.uploadImage(ctx) }

  // 兼容老路径：/null-cornerstone-system/upload/batch
  @routeConfig({ method: 'post', path: '/null-cornerstone-system/upload/batch', summary: '兼容路径：批量上传', tags: ['系统', '兼容'] })
  async legacyBatch(ctx: Context) { return this.uploadBatch(ctx) }
}

export { UploadController }