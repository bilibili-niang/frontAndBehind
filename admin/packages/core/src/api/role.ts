import { request } from '@pkg/core'

// 删除指定路由/按钮权限
export const $removeRolePermission = (id: string) => {
  return request({
    url: `/blade-system/menu/deleteUnderTopMenu/${id}`,
    method: 'post'
  })
}

// 修改菜单
export const $requestUpdateRole = (data: {
  /**
   * 菜单编号
   */
  code: string
  /**
   * 是否隐藏（true隐藏/false不隐藏）
   */
  hidden?: boolean
  /**
   * 菜单id
   */
  id: number
  /**
   * 菜单名称
   */
  name: string
  /**
   * 菜单父节点id（根节点带0）
   */
  parentId: number
  /**
   * 请求地址
   */
  path?: string
  /**
   * 排序
   */
  sort?: number
}) => {
  return request({
    url: '/blade-system/menu/updateUnderTopMenu',
    method: 'post',
    data
  })
}

// 添加菜单
export const $requestCreateRole = (topMenuId: string, data: any) =>
  request({
    url: `/blade-system/menu/addUnderTopMenu/${topMenuId}`,
    method: 'post',
    data
  })
