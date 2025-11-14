import { $getMerchantId } from '@anteng/core';

export const getMerchantId = appId => {
  return $getMerchantId(appId)
}

export * from './goods'
export * from './goods/group'

export * from './search'
export * from './pay'
export * from './order'
export * from './express'
export * from './cart'
export * from './shop'
export * from './merchant'
export * from './blance'
export * from './information'
