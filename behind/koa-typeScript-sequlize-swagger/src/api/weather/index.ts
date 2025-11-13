import { request } from '@/api/request'
import { weatherKeyForGaode } from '@/constant'
/*
* 获取高德天气
* @param city 获取天气城市
* */
export const $getWeatherFromGaode = (city = '350211') => {
  return request({
    url: 'https://restapi.amap.com/v3/weather/weatherInfo?parameters',
    method: 'get',
    params: {
      key: weatherKeyForGaode,
      city,
      output: 'json'
    }
  })
}