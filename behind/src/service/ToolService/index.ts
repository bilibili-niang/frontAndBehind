import { illegalRequestRepository } from '@/repository/ToolRepository'
import { $transform } from '@/service/tool'

/**
 * 翻译结果
 */
export interface TranslateResult {
  [key: string]: any
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
 * 分页结果
 */
export interface PaginationResult {
  count: number
  rows: IllegalRequestListItem[]
}

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

    const rows: IllegalRequestListItem[] = result.records.map((row: any) => {
      const plain = typeof row.toJSON === 'function' ? row.toJSON() : row
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

    return {
      count: result.total,
      rows
    }
  }
}

export const toolService = new ToolService()
