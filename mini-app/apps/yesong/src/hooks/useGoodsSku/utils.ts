export type SpecKvMap = {
  k: string
  kId: string
  v: string
  vId: string
  image?: string
}

export type SkuItem = {
  id: string
  goodsId: string
  specCode: string
  underlinePrice: number
  price: number
  cost: number
  stock: number
  weight: number
  sort: number
  path: string
  specs: SpecKvMap[]
}

type SkuSpecItem = {
  id: string
  name: string
  children: {
    id: string
    name: string
    image?: string
  }[]
}

export const restoreSpecs = (skus: SkuItem[]): SkuSpecItem[] => {
  const specs = ([] as SpecKvMap[]).concat(...skus.map(item => item.specs))
  const specMap: { [key: string]: SkuSpecItem } = {}

  specs.forEach(spec => {
    const { k, kId, v, vId, image } = spec
    if (!specMap[k]) {
      specMap[k] = {
        id: kId,
        name: k,
        children: []
      }
    }
    const specItem = specMap[k]
    const existingChild: any = specItem.children.find(child => child.id === vId)
    if (!existingChild) {
      specItem.children.push({
        id: vId,
        name: v,
        image: image
      })
    }
  })

  return Object.values(specMap)
}

export function findIntersection(arrays: any[][]): any[] {
  if (arrays.length === 0) return []

  // 将第一个数组转换为 Set
  const intersection = new Set(arrays[0])

  // 遍历其他数组，保留与当前交集中相同的元素
  for (let i = 1; i < arrays.length; i++) {
    const currentSet = new Set(arrays[i])
    for (const item of intersection) {
      if (!currentSet.has(item)) {
        intersection.delete(item)
      }
    }
  }

  return Array.from(intersection)
}
