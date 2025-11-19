// 商品的搜索结果
export interface searchResultList {
  id: string
  title: string
  type: number
  code: string
  coverImages: string[]
  sort: number
  status: number
  priceMin: string
  priceMax: string
  underlinePrice: string
}

// 搜索api的传参类型
export interface SearchParams {
  // 商户id
  merchantId: string | null
  // 关键字
  keyword?: string
  // 数量
  size?: number
  //偏移量
  current?: number
}
