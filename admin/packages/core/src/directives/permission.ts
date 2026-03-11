import type { Directive, DirectiveBinding } from 'vue'
import usePermissionStore from '../stores/permission'

/**
 * 权限指令 v-permission
 * 用于控制元素的显示/隐藏
 *
 * 使用方式：
 * - v-permission="'user:create'" - 需要单个权限
 * - v-permission="['user:create', 'user:update']" - 需要任意一个权限
 * - v-permission.all="['user:create', 'user:update']" - 需要所有权限
 */

/**
 * 检查权限
 * @param el 元素
 * @param binding 指令绑定
 */
function checkPermission(el: HTMLElement, binding: DirectiveBinding) {
  const permissionStore = usePermissionStore()
  const { value, modifiers } = binding

  // 获取需要的权限
  const permissions = Array.isArray(value) ? value : [value]

  // 检查权限
  let hasPermission = false

  if (modifiers.all) {
    // 需要所有权限
    hasPermission = permissions.every(p => permissionStore.hasPermission(p))
  } else {
    // 需要任意一个权限
    hasPermission = permissions.some(p => permissionStore.hasPermission(p))
  }

  // 没有权限时移除元素
  if (!hasPermission) {
    el.parentNode?.removeChild(el)
  }
}

/**
 * 权限指令
 */
export const permissionDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding)
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding)
  }
}

/**
 * 角色指令 v-role
 * 用于根据角色控制元素的显示/隐藏
 *
 * 使用方式：
 * - v-role="'admin'" - 需要单个角色
 * - v-role="['admin', 'user']" - 需要任意一个角色
 * - v-role.all="['admin', 'user']" - 需要所有角色
 */

/**
 * 检查角色
 * @param el 元素
 * @param binding 指令绑定
 */
function checkRole(el: HTMLElement, binding: DirectiveBinding) {
  const permissionStore = usePermissionStore()
  const { value, modifiers } = binding

  // 获取需要的角色
  const roles = Array.isArray(value) ? value : [value]

  // 检查角色
  let hasRole = false

  if (modifiers.all) {
    // 需要所有角色
    hasRole = roles.every(r => permissionStore.hasRole(r))
  } else {
    // 需要任意一个角色
    hasRole = roles.some(r => permissionStore.hasRole(r))
  }

  // 没有角色时移除元素
  if (!hasRole) {
    el.parentNode?.removeChild(el)
  }
}

/**
 * 角色指令
 */
export const roleDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    checkRole(el, binding)
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    checkRole(el, binding)
  }
}

/**
 * 注册权限指令
 * @param app Vue 应用实例
 */
export function setupPermissionDirectives(app: any) {
  app.directive('permission', permissionDirective)
  app.directive('role', roleDirective)
}

export default {
  permission: permissionDirective,
  role: roleDirective
}
