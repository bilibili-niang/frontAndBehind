/**
 * RBAC 权限系统基础数据初始化
 * 创建默认角色、权限和菜单
 */

import { sequelize } from '../src/config/db'
import { info, error } from '../src/config/log4j'
import { v4 as uuidv4 } from 'uuid'

async function seedPermissionData() {
  const transaction = await sequelize.transaction()

  try {
    info('开始初始化权限系统基础数据...')

    // 1. 创建默认角色
    const adminRoleId = uuidv4()
    const userRoleId = uuidv4()
    const guestRoleId = uuidv4()

    await sequelize.query(
      `INSERT INTO roles (id, name, display_name, description, status, is_default, data_scope) VALUES
       (?, 'admin', '管理员', '系统管理员，拥有所有权限', 1, 0, 1),
       (?, 'user', '普通用户', '普通用户，拥有基础权限', 1, 1, 2),
       (?, 'guest', '访客', '访客，仅查看权限', 1, 0, 3)`,
      {
        replacements: [adminRoleId, userRoleId, guestRoleId],
        transaction
      }
    )
    info('✅ 默认角色创建成功')

    // 2. 创建权限（菜单权限）
    const permissions = [
      // 仪表盘
      { id: uuidv4(), name: 'menu:dashboard', displayName: '仪表盘', type: 'menu', resource: 'dashboard', action: 'view', sort: 1 },

      // 用户管理
      { id: uuidv4(), name: 'menu:user', displayName: '用户管理', type: 'menu', resource: 'user', action: 'view', sort: 2 },
      { id: uuidv4(), name: 'button:user:create', displayName: '创建用户', type: 'button', resource: 'user', action: 'create', sort: 1 },
      { id: uuidv4(), name: 'button:user:update', displayName: '更新用户', type: 'button', resource: 'user', action: 'update', sort: 2 },
      { id: uuidv4(), name: 'button:user:delete', displayName: '删除用户', type: 'button', resource: 'user', action: 'delete', sort: 3 },

      // 角色管理
      { id: uuidv4(), name: 'menu:role', displayName: '角色管理', type: 'menu', resource: 'role', action: 'view', sort: 3 },
      { id: uuidv4(), name: 'button:role:create', displayName: '创建角色', type: 'button', resource: 'role', action: 'create', sort: 1 },
      { id: uuidv4(), name: 'button:role:update', displayName: '更新角色', type: 'button', resource: 'role', action: 'update', sort: 2 },
      { id: uuidv4(), name: 'button:role:delete', displayName: '删除角色', type: 'button', resource: 'role', action: 'delete', sort: 3 },

      // 权限管理
      { id: uuidv4(), name: 'menu:permission', displayName: '权限管理', type: 'menu', resource: 'permission', action: 'view', sort: 4 },

      // 菜单管理
      { id: uuidv4(), name: 'menu:menu', displayName: '菜单管理', type: 'menu', resource: 'menu', action: 'view', sort: 5 },
    ]

    for (const perm of permissions) {
      await sequelize.query(
        `INSERT INTO permissions (id, name, display_name, type, resource, action, sort) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [perm.id, perm.name, perm.displayName, perm.type, perm.resource, perm.action, perm.sort],
          transaction
        }
      )
    }
    info('✅ 权限数据创建成功')

    // 3. 为 admin 角色分配所有权限
    for (const perm of permissions) {
      await sequelize.query(
        `INSERT INTO role_permissions (id, role_id, permission_id) VALUES (?, ?, ?)`,
        {
          replacements: [uuidv4(), adminRoleId, perm.id],
          transaction
        }
      )
    }

    // 4. 为 user 角色分配基础权限（不包括角色、权限、菜单管理）
    const userPermissions = permissions.filter(p =>
      p.name === 'menu:dashboard' ||
      p.name === 'menu:user' ||
      p.name.startsWith('button:user:')
    )
    for (const perm of userPermissions) {
      await sequelize.query(
        `INSERT INTO role_permissions (id, role_id, permission_id) VALUES (?, ?, ?)`,
        {
          replacements: [uuidv4(), userRoleId, perm.id],
          transaction
        }
      )
    }

    // 5. 为 guest 角色分配只读权限
    const guestPermissions = permissions.filter(p =>
      p.name === 'menu:dashboard' ||
      p.name === 'menu:user'
    )
    for (const perm of guestPermissions) {
      await sequelize.query(
        `INSERT INTO role_permissions (id, role_id, permission_id) VALUES (?, ?, ?)`,
        {
          replacements: [uuidv4(), guestRoleId, perm.id],
          transaction
        }
      )
    }
    info('✅ 角色权限关联创建成功')

    // 6. 创建菜单
    const menus = [
      { id: uuidv4(), name: '仪表盘', path: '/dashboard', component: 'Dashboard', icon: 'DashboardOutlined', permission: 'menu:dashboard', sort: 1 },
      { id: uuidv4(), name: '用户管理', path: '/user', component: 'User', icon: 'UserOutlined', permission: 'menu:user', sort: 2 },
      { id: uuidv4(), name: '角色管理', path: '/role', component: 'Role', icon: 'TeamOutlined', permission: 'menu:role', sort: 3 },
      { id: uuidv4(), name: '权限管理', path: '/permission', component: 'Permission', icon: 'SafetyOutlined', permission: 'menu:permission', sort: 4 },
      { id: uuidv4(), name: '菜单管理', path: '/menu', component: 'Menu', icon: 'MenuOutlined', permission: 'menu:menu', sort: 5 },
    ]

    for (const menu of menus) {
      await sequelize.query(
        `INSERT INTO menus (id, name, path, component, icon, permission, sort) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [menu.id, menu.name, menu.path, menu.component, menu.icon, menu.permission, menu.sort],
          transaction
        }
      )
    }
    info('✅ 菜单数据创建成功')

    await transaction.commit()
    info('🎉 权限系统基础数据初始化完成！')
    process.exit(0)
  } catch (err) {
    await transaction.rollback()
    error('初始化权限系统基础数据失败:', err)
    process.exit(1)
  }
}

seedPermissionData()
