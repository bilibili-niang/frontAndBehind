import Shop from '@/schema/shop'
import { BaseRepository } from './BaseRepository'

/**
 * 门店 Repository
 * 负责门店相关的数据访问
 */
export class ShopRepository extends BaseRepository<Shop> {
  constructor() {
    super(Shop)
  }
}

export const shopRepository = new ShopRepository()
