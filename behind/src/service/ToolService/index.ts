import { illegalRequestRepository } from '@/repository/ToolRepository'
import { $transform } from '@/service/tool'
import { PaginationResult as CommonPaginationResult } from '@/types/common'
import { Model } from 'sequelize'

/**
 * 翻译结果
 */
export interface TranslateResult {
  [key: string]: unknown
}

/**
 * 非法请求日志列表项
 */
export interface IllegalRequestListItem {
  id: string
  ip?: string
  url?: string
  method?: string
  headers?: string
  body?: string
  query?: string
  reason?: string
  createTime: string
}

/**
 * 分页结果（使用通用分页类型）
 */
export interface PaginationResult extends CommonPaginationResult<IllegalRequestListItem> {}

/**
 * 工具 Service
 * 处理工具相关的业务逻辑
 */
export class ToolService {
  /**
   * 翻译文本
   * @param keyword 要翻译的关键词
   * @returns 翻译结果
   */
  async translate(keyword: string): Promise<TranslateResult> {
    return await $transform(keyword)
  }

  /**
   * 获取非法请求日志列表
   * @param page 当前页
   * @param size 每页大小
   * @returns 分页结果
   */
  async getIllegalRequestList(page: number, size: number): Promise<PaginationResult> {
    const result = await illegalRequestRepository.paginate(
      { current: page, size },
      { order: [['createdAt', 'DESC']] }
    )

    const rows: IllegalRequestListItem[] = result.records.map((row: Model) => {
      const plain = row.toJSON() as IllegalRequestListItem & { createdAt: string }
      return {
        id: plain.id,
        ip: plain.ip,
        url: plain.url,
        method: plain.method,
        headers: plain.headers,
        body: plain.body,
        query: plain.query,
        reason: plain.reason,
        createTime: plain.createdAt
      }
    })

    const pages = Math.ceil(result.total / size)

    return {
      records: rows,
      total: result.total,
      current: page,
      size,
      pages
    }
  }
}

export const toolService = new ToolService()
