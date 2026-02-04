import { toRaw } from 'vue'
import { DeckComponentConfig } from '../../canvas-components/defineDeckComponent'
import { cloneDeep, defaultsDeep } from 'lodash'
import useComponentStore from '../component'
import { message } from '@pkg/ui'

/** 嵌套关系计算结果缓存 */
const cachedNestableMap = new Map<string, boolean>()

const getNestRelation = (value: any = {}) => {
  return defaultsDeep(cloneDeep(toRaw(value)), {
    allowedParents: {
      includes: ['*'],
      excludes: []
    },
    allowedChildren: {
      includes: [],
      excludes: []
    },
    condition: () => true
  } as DeckComponentConfig['nestRelation'])
}

const isExcluded = (excludes: string[], key: string) => {
  if (excludes.includes('*') || excludes.includes(key)) {
    return true
  }
  return false
}

const isIncluded = (includes: string[], key: string) => {
  if (includes.includes('*') || includes.includes(key)) {
    return true
  }
  return false
}

/** 判断组件是否可以嵌套 */
export const checkIsNestable = (childKey: string, parentKey: string, showTip: boolean = false) => {
  const childPkg = useComponentStore().getComponentPackage(childKey)
  const parentPkg = useComponentStore().getComponentPackage(parentKey)

  // 找不到组件包，直接返回
  if (!childPkg || !parentPkg) {
    return false
  }

  // 0. 读取缓存计算结果，有结果直接返回 true／false
  const cacheKey = `${childKey} -> ${parentKey}`
  const cachedResult = cachedNestableMap.get(cacheKey)
  if (typeof cachedResult === 'boolean') {
    if (!cachedResult && showTip) {
      message.info(
        <span>
          <u style="text-underline-offset: 4px;">{parentPkg.manifest.name}</u>
          <span>不支持插入</span>
          <u style="text-underline-offset: 4px;">{childPkg.manifest.name}</u>
        </span>
      )
    }

    return cachedResult
  }

  // 子关系
  const child = getNestRelation(childPkg.manifest.nestRelation)
  // 父关系
  const parent = getNestRelation(parentPkg.manifest.nestRelation)

  let result = true

  if (!child || !parent) {
    result = false
  } else if (isExcluded(parent.allowedChildren.excludes, childKey)) {
    // 1. 如果父节点 allowedChildren.excludes 包含 * 或者 childrenKey => 不允许嵌套
    result = false
  } else if (isExcluded(child.allowedParents.excludes, parentKey)) {
    // 2. 如果子节点 allowedParents.excludes 包含 * 或者 parentKey => 不允许嵌套
    result = false
  } else if (!isIncluded(parent.allowedChildren.includes, childKey)) {
    // 3. 如果父节点 allowedChildren.includes 不包含 * 或者 childrenKey => 不允许嵌套
    result = false
  } else if (!isIncluded(child.allowedParents.includes, parentKey)) {
    // 4. 如果子节点 allowedParents.includes 不包含 * 或者 parentKey => 不允许嵌套
    result = false
  } else {
    // 5. 默认允许嵌套，判断调用双方 condition 判断是否均非 false
  }

  if (!result && showTip) {
    message.info(
      <span>
        <u style="text-underline-offset: 4px;">{parentPkg.manifest.name}</u>
        <span>不支持插入</span>
        <u style="text-underline-offset: 4px;">{childPkg.manifest.name}</u>
      </span>
    )
  }

  // 缓存计算结果，返回结果
  cachedNestableMap.set(cacheKey, result)

  return result
}
