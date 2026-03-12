import { addAliases } from 'module-alias'
import path from 'path'

addAliases({
  '@': path.join(__dirname, '../src')
})

import { Sequelize } from 'sequelize-typescript'
import User from '@/schema/user'
import Authority from '@/schema/authority'
import * as process from 'node:process'
import * as mysql from 'mysql2/promise'
import { info } from '@/config/log4j'
import { setAdminUser, setDefaultNavigation, setDefaultSystemPages } from '@/utils/initialize'
import Resume from '@/schema/resume'
import IllegalRequest from '@/schema/illegalRequest'
import Navigation from '@/schema/navigation'
import SystemPage from '@/schema/systemPage'
import CustomPage from '@/schema/customPage'
import AuthWeapp from '@/schema/authWeapp'
import Shop from '@/schema/shop'
import Role from '@/schema/role'
import Permission from '@/schema/permission'
import UserRole from '@/schema/userRole'
import RolePermission from '@/schema/rolePermission'
import Menu from '@/schema/menu'
import DataPermission from '@/schema/dataPermission'

// 根据环境确定数据库名称
const NODE_ENV = process.env.NODE_ENV || 'local'
console.log('NODE_ENV:', NODE_ENV)

const getDatabaseName = () => {
  if (NODE_ENV === 'local') {
    return 'birthdayDb_test'
  }
  return 'birthdayDb'
}

const DATABASE_NAME = getDatabaseName()

const dbHost = process.env.DATABASE_HOST || '127.0.0.1';
const dbPort = Number(process.env.DATABASE_PORT) || 3306;
const dbUser = process.env.USER_NAME;
const dbPass = process.env.DATABASE_PASSWORD;

const seq = new Sequelize(DATABASE_NAME, dbUser, dbPass, {
  dialect: 'mysql',
  host: dbHost,
  port: dbPort,
  logging: false,
  models: [
    User, 
    Authority, 
    Resume, 
    IllegalRequest, 
    Navigation, 
    SystemPage, 
    CustomPage, 
    AuthWeapp, 
    Shop,
    Role,
    Permission,
    UserRole,
    RolePermission,
    Menu,
    DataPermission
  ],
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    connectTimeout: 10000
  }
})

async function init() {
  try {
    info(`正在初始化数据库: Host=${dbHost}, Port=${dbPort}, User=${dbUser}, DB=${DATABASE_NAME}`);

    // 1. 创建数据库（如果不存在）
    const tempConnection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPass,
      connectTimeout: 10000
    })

    info('检查/创建数据库...')
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DATABASE_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`)
    await tempConnection.end()
    info(`数据库 ${DATABASE_NAME} 检查/创建完成`)

    // 2. 同步表结构
    info('开始同步表结构...')
    await seq.sync({ alter: true })
    info('表结构同步完成')

    // 3. 初始化默认数据
    info('开始初始化默认数据...')
    await setAdminUser()
    await setDefaultNavigation()
    await setDefaultSystemPages()
    info('默认数据初始化完成')

    console.log('\x1b[32m%s\x1b[0m', '数据库初始化成功！')
    process.exit(0)
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '数据库初始化失败:', error)
    process.exit(1)
  }
}

init()
