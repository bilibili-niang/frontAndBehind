import IllegalRequest from '@/schema/illegalRequest'
import { BaseRepository } from './BaseRepository'

/**
 * 非法请求日志数据
 */
export interface IllegalRequestData {
  id?: string
  ip?: string
  url?: string
  method?: string
  headers?: string
  body?: string
  query?: string
  reason?: string
  [key: string]: any
}

/**
 * 非法请求日志 Repository
 */
export class IllegalRequestRepository extends BaseRepository<IllegalRequest> {
  constructor() {
    super(IllegalRequest)
  }
}

export const illegalRequestRepository = new IllegalRequestRepository()
