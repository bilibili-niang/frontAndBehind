import { $getWeatherFromGaode } from '@/api/weather'
import { debug, error } from '@/config/log4j'

/**
 * 天气查询结果
 */
export interface WeatherResult {
  [key: string]: any
}

/**
 * 高德天气 Service
 * 处理天气查询相关的业务逻辑
 */
export class WeatherForGaodeService {
  /**
   * 从高德 API 获取天气信息
   * @param code 城市编码
   * @returns 天气查询结果
   */
  async getWeather(code: string): Promise<WeatherResult> {
    debug('进入 $getWeatherFromGaode 接口逻辑了')
    return await $getWeatherFromGaode()
  }
}

export const weatherForGaodeService = new WeatherForGaodeService()
