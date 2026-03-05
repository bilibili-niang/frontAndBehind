import { shopRepository } from '@/repository/ShopRepository'
import { generateShopCode } from '@/utils/generateShopCode'

/**
 * 门店数据
 */
export interface ShopData {
  code?: string
  name: string
  location?: {
    lng: string
    lat: string
  }
  longitude?: number | string
  latitude?: number | string
  [key: string]: any
}

/**
 * 更新门店数据
 */
export interface UpdateShopData extends ShopData {
  id: string
}

/**
 * 门店 Service
 * 处理门店相关的业务逻辑
 */
export class ShopService {
  /**
   * 格式化 location 数据
   * 将 number 转为 string，处理经纬度字段
   */
  private formatLocation(data: ShopData): ShopData {
    const formatted = { ...data }

    // 兜底：若 location 存在但为 number，则统一转为 string
    if (formatted.location) {
      formatted.location = {
        ...formatted.location,
        lng: `${formatted.location.lng ?? ''}`,
        lat: `${formatted.location.lat ?? ''}`
      }
    }

    // 兼容 location 与经纬度的传入
    if (!formatted.location && (formatted.longitude || formatted.latitude)) {
      const lng = `${formatted.longitude ?? ''}`
      const lat = `${formatted.latitude ?? ''}`
      formatted.location = { lng, lat }
    }

    // 删除 longitude 和 latitude 字段，只保留 location
    delete formatted.longitude
    delete formatted.latitude

    return formatted
  }

  /**
   * 创建门店
   * @param shopData 门店数据
   * @returns 创建的门店
   */
  async create(shopData: ShopData) {
    // 若未提供业务编码 code，后端自动生成
    if (!shopData.code) {
      shopData.code = generateShopCode()
    }

    // 格式化 location 数据
    const formattedData = this.formatLocation(shopData)

    return await shopRepository.create(formattedData)
  }

  /**
   * 更新门店
   * @param id 门店 ID
   * @param shopData 门店数据
   * @returns 更新后的门店
   */
  async update(id: string, shopData: ShopData) {
    // 格式化 location 数据
    const formattedData = this.formatLocation(shopData)

    // 执行更新
    await shopRepository.update(id, formattedData)

    // 返回更新后的门店
    return await shopRepository.findById(id)
  }

  /**
   * 获取门店列表
   * @param current 当前页
   * @param size 每页大小
   * @returns 分页结果
   */
  async getShopList(current: number, size: number) {
    return await shopRepository.paginate({ current, size })
  }

  /**
   * 删除门店
   * @param id 门店 ID
   * @returns 删除的记录数
   */
  async deleteShop(id: string): Promise<number> {
    return await shopRepository.deleteById(id)
  }
}

export const shopService = new ShopService()
