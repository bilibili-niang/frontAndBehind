import { Context } from 'koa'
import path from 'path'
import fs from 'fs'
import { responses, routeConfig, z } from 'koa-swagger-decorator'
import { ctxBody } from '@/utils'
import { commonResponse } from '@/controller/common'

type ImageItem = {
  url: string
  uri?: string
  width: number
  height: number
  name?: string
  alias?: string
}

type SourceTab = {
  title: string
  icon?: string
  cover?: string
  col?: number
  sources: ImageItem[]
}

const isImage = (filename: string) => {
  return filename.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)
}

const toPosixPath = (p: string) => p.split(path.sep).join('/')

const collectImagesRecursive = (dir: string, baseRoot: string): string[] => {
  const result: string[] = []
  const items = fs.readdirSync(dir)
  for (const name of items) {
    const full = path.join(dir, name)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      result.push(...collectImagesRecursive(full, baseRoot))
    } else if (stat.isFile() && isImage(name)) {
      const rel = path.relative(baseRoot, full)
      result.push(toPosixPath(rel))
    }
  }
  return result
}

class IconsController {
  @routeConfig({
    method: 'get',
    path: '/icons/list',
    summary: '获取静态图标素材（按分类分组，支持 cate 过滤）',
    tags: ['资源', '图标'],
    request: {
      // 可选查询参数：按分类过滤返回结果
      query: z.object({
        cate: z.string().optional()
      })
    }
  })
  @responses(commonResponse({
    data: z.array(z.object({
      title: z.string(),
      icon: z.string().optional(),
      cover: z.string().optional(),
      col: z.number().optional(),
      sources: z.array(z.object({
        url: z.string(),
        uri: z.string().optional(),
        width: z.number(),
        height: z.number(),
        name: z.string().optional(),
        alias: z.string().optional()
      }))
    }))
  }))
  async list(ctx: Context) {
    try {
      // 与 app/index.ts 保持一致的静态目录定位
      const iconsRoot = path.join(__dirname, '../../static/icons')

      console.log('iconsRoot', iconsRoot)

      if (!fs.existsSync(iconsRoot)) {
        ctx.body = ctxBody({ success: true, code: 200, msg: '目录不存在，返回空列表', data: [] })
        return
      }

      const origin = ctx.origin || `${ctx.protocol}://${ctx.host}`
      const cateFromQuery = (ctx.query?.cate as string) || ''
      let categories = fs
        .readdirSync(iconsRoot)
        .filter((name) => fs.statSync(path.join(iconsRoot, name)).isDirectory())

      if (cateFromQuery) {
        categories = categories.filter((name) => name === cateFromQuery)
      }

      const data: SourceTab[] = categories
        .map((cate) => {
          const relPaths = collectImagesRecursive(path.join(iconsRoot, cate), iconsRoot)
          if (!relPaths.length) return null
          const sources: ImageItem[] = relPaths.map((rel) => ({
            url: encodeURI(`${origin}/${rel}`),
            uri: encodeURI(`/${rel}`),
            width: 400,
            height: 400,
            name: path.basename(rel),
            alias: ''
          }))

          return {
            title: cate,
            sources
          }
        })
        .filter(Boolean) as SourceTab[]

      ctx.body = ctxBody({ success: true, code: 200, msg: '获取图标素材成功', data })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: '获取图标素材失败', data: e?.message || e })
    }
  }
}

export { IconsController }