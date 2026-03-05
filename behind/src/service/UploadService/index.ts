import path from 'path'
import fs from 'fs'
import { Context } from 'koa'

/**
 * 上传文件类型
 */
export interface KoaBodyFile {
  filepath?: string
  path?: string
  size?: number
  type?: string
  mimetype?: string
  name?: string
  originalFilename?: string
}

/**
 * 上传结果
 */
export interface UploadResult {
  url: string
  uri: string
  size: number
  mime: string
  filename: string
}

/**
 * 上传 Service
 * 处理文件上传相关的业务逻辑
 */
export class UploadService {
  /**
   * 确保上传目录存在
   */
  ensureUploadDir(absUploadDir: string): void {
    try {
      if (!fs.existsSync(absUploadDir)) {
        fs.mkdirSync(absUploadDir, { recursive: true })
      }
    } catch (_) {}
  }

  /**
   * 获取安全的文件名
   */
  getSafeFilename(file: KoaBodyFile): string {
    const fp = (file.filepath || file.path || '') as string
    return path.basename(fp)
  }

  /**
   * 构建公共访问 URL
   */
  buildPublicUrl(ctx: Context, filename: string): string {
    const origin = ctx.origin || `${ctx.protocol}://${ctx.host}`
    return `${origin}/upload/${filename}`
  }

  /**
   * 处理单文件上传
   * @param file 上传的文件
   * @param ctx Koa 上下文
   * @returns 上传结果
   */
  processSingleFile(file: KoaBodyFile, ctx: Context): UploadResult {
    const filename = this.getSafeFilename(file)
    const url = this.buildPublicUrl(ctx, filename)

    return {
      url,
      uri: filename,
      size: file.size || 0,
      mime: (file.mimetype || file.type || ''),
      filename: (file.originalFilename || file.name || filename)
    }
  }

  /**
   * 处理批量文件上传
   * @param files 上传的文件数组
   * @param ctx Koa 上下文
   * @returns 上传结果数组
   */
  processBatchFiles(files: KoaBodyFile[], ctx: Context): UploadResult[] {
    return files
      .filter(f => f && (f.filepath || f.path))
      .map(f => this.processSingleFile(f, ctx))
  }
}

export const uploadService = new UploadService()
