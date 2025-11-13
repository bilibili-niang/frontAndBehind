import type { PaginationData } from '../../api/request'

export const buildPagination = <T>(data: T[]): PaginationData<T> => {
  return {
    records: data,
    total: data.length,
    size: data.length,
    current: 1,
    orders: [],
    optimizeCountSql: true,
    searchCount: true,
    maxLimit: null as unknown as number,
    countId: null as unknown as string,
    pages: 1
  }
}
