/**
 * RBAC 权限系统数据库初始化脚本
 * 创建角色、权限、菜单相关表
 */

import { addAliases } from 'module-alias'
import path from 'path'

addAliases({
  '@': path.join(__dirname, '../src')
})

import sequelize from '../src/config/db'
import { info, error } from '../src/config/log4j'

async function initPermissionTables() {
  try {
    info('开始初始化权限系统数据库表...')

    // 1. 创建 roles 表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(36) PRIMARY KEY COMMENT '主键 UUID',
        name VARCHAR(50) NOT NULL UNIQUE COMMENT '角色名称（英文标识）',
        display_name VARCHAR(100) NOT NULL COMMENT '角色显示名称',
        description VARCHAR(255) COMMENT '角色描述',
        status TINYINT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
        is_default TINYINT DEFAULT 0 COMMENT '是否默认角色：0-否 1-是',
        data_scope TINYINT DEFAULT 1 COMMENT '数据权限范围：1-全部 2-本部门 3-本人',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_is_default (is_default)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表'
    `)
    info('✅ roles 表创建成功')

    // 2. 创建 permissions 表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id VARCHAR(36) PRIMARY KEY COMMENT '主键 UUID',
        name VARCHAR(100) NOT NULL UNIQUE COMMENT '权限名称（英文标识）',
        display_name VARCHAR(100) NOT NULL COMMENT '权限显示名称',
        type VARCHAR(20) NOT NULL COMMENT '权限类型：menu/button/api/data',
        resource VARCHAR(50) NOT NULL COMMENT '资源标识',
        action VARCHAR(20) NOT NULL COMMENT '操作：view/create/update/delete',
        parent_id VARCHAR(36) COMMENT '父权限ID',
        sort INT DEFAULT 0 COMMENT '排序',
        status TINYINT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_type (type),
        INDEX idx_parent_id (parent_id),
        INDEX idx_status (sort),
        FOREIGN KEY (parent_id) REFERENCES permissions(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表'
    `)
    info('✅ permissions 表创建成功')

    // 3. 创建 role_permissions 表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id VARCHAR(36) PRIMARY KEY COMMENT '主键 UUID',
        role_id VARCHAR(36) NOT NULL COMMENT '角色ID',
        permission_id VARCHAR(36) NOT NULL COMMENT '权限ID',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_role_permission (role_id, permission_id),
        INDEX idx_role_id (role_id),
        INDEX idx_permission_id (permission_id),
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联表'
    `)
    info('✅ role_permissions 表创建成功')

    // 4. 创建 user_roles 表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id VARCHAR(36) PRIMARY KEY COMMENT '主键 UUID',
        user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
        role_id VARCHAR(36) NOT NULL COMMENT '角色ID',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_user_role (user_id, role_id),
        INDEX idx_user_id (user_id),
        INDEX idx_role_id (role_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表'
    `)
    info('✅ user_roles 表创建成功')

    // 5. 创建 menus 表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS menus (
        id VARCHAR(36) PRIMARY KEY COMMENT '主键 UUID',
        name VARCHAR(100) NOT NULL COMMENT '菜单名称',
        path VARCHAR(200) COMMENT '路由路径',
        component VARCHAR(200) COMMENT '组件路径',
        icon VARCHAR(50) COMMENT '图标',
        permission VARCHAR(100) COMMENT '关联权限标识',
        parent_id VARCHAR(36) COMMENT '父菜单ID',
        sort INT DEFAULT 0 COMMENT '排序',
        hidden TINYINT DEFAULT 0 COMMENT '是否隐藏：0-否 1-是',
        keep_alive TINYINT DEFAULT 0 COMMENT '是否缓存：0-否 1-是',
        status TINYINT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_parent_id (parent_id),
        INDEX idx_permission (permission),
        INDEX idx_status (status),
        INDEX idx_sort (sort),
        FOREIGN KEY (parent_id) REFERENCES menus(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单表'
    `)
    info('✅ menus 表创建成功')

    info('🎉 权限系统数据库表初始化完成！')
    process.exit(0)
  } catch (err) {
    error('初始化权限系统数据库表失败:', err)
    process.exit(1)
  }
}

initPermissionTables()
