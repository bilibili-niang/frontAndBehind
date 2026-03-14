/**
 * 数据库自检和初始化工具
 * 在应用启动时自动运行，确保数据库和基础数据已就绪
 */

import sequelize from '@/config/db'
import { info, error } from '@/config/log4j'
import { setAdminUser, setDefaultNavigation, setDefaultSystemPages } from '@/utils/initialize'
import { seedUserRoles } from '../../scripts/seed-user-roles'

/**
 * 检查数据库连接
 */
async function checkDatabaseConnection() {
  try {
    info('检查数据库连接...')
    await sequelize.authenticate()
    info('✅ 数据库连接成功')
  } catch (err) {
    error('❌ 数据库连接失败:', err)
    throw new Error('无法连接到数据库，请检查数据库配置')
  }
}

/**
 * 同步表结构
 */
async function syncDatabaseTables() {
  try {
    info('同步数据库表结构...')
    await sequelize.sync({ alter: true })
    info('✅ 表结构同步完成')
  } catch (err) {
    error('❌ 表结构同步失败:', err)
    throw new Error('数据库表结构同步失败')
  }
}

/**
 * 初始化基础数据
 */
async function initializeBaseData() {
  try {
    info('初始化基础数据...')
    await setAdminUser()
    await setDefaultNavigation()
    await setDefaultSystemPages()
    await seedUserRoles()
    info('✅ 基础数据初始化完成')
  } catch (err) {
    error('❌ 基础数据初始化失败:', err)
    throw new Error('基础数据初始化失败')
  }
}

/**
 * 数据库自检和初始化主函数
 * 按顺序执行：连接检查 -> 表结构同步 -> 数据初始化
 */
export async function initDatabase() {
  try {
    // 1. 检查数据库连接
    await checkDatabaseConnection()
    
    // 2. 同步表结构
    await syncDatabaseTables()
    
    // 3. 初始化基础数据
    await initializeBaseData()
    
    info('🎉 数据库自检和初始化全部完成')
  } catch (err) {
    error('数据库自检过程中断:', err)
    throw err
  }
}
