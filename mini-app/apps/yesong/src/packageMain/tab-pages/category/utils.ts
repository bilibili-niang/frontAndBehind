import { IGoodsCategory } from '../../../api/goods/category'

/**
 * 查找指定 ID 的类目，并返回类目、层级和路径
 * @param categories - 类目数组
 * @param id - 要查找的类目 ID
 * @param level - 当前层级，默认为 1
 * @param path - 当前路径，默认为 []
 * @returns 返回包含类目对象、层级和路径的对象，找不到时返回 undefined
 */
export function findCategoryById(
  categories: IGoodsCategory[],
  id: string,
  level: number = 1,
  path: number[] = []
): { category: IGoodsCategory; level: number; path: number[] } | undefined {
  for (let index = 0; index < categories.length; index++) {
    const category = categories[index]
    const currentPath = [...path, index]
    if (category.id === id) {
      return { category, level, path: currentPath } // 找到目标，返回类目、层级和路径
    }
    const foundInChild = findCategoryById(category.childCategories || [], id, level + 1, currentPath)
    if (foundInChild) {
      return foundInChild // 在子类目中找到目标，返回类目、层级和路径
    }
  }
  return undefined // 在所有类目中都未找到目标
}
