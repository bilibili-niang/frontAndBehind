export type Pagination = {
  /** 当前页码, 1 开始 */
  current: number
  /** 一页数量 */
  size: number
}

export type ResponseBody<Data> = Promise<{
  code: number
  success: boolean
  data: Data
  msg: string
}>

export type ResponsePaginationData<Record> = ResponseBody<{
  countId: string
  current: number
  maxLimit: number
  optimizeCountSql: boolean
  orders: string[]
  pages: number
  records: Record[]
  searchCount: boolean
  size: number
  total: number
}>
