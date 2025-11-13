import { Sequelize } from 'sequelize-typescript'
import User from '@/schema/user'
import Authority from '@/schema/authority'
import * as process from 'node:process'
import * as mysql from 'mysql2/promise'
import { info } from './log4j'
import { setAdminUser, setDefaultNavigation, setDefaultSystemPages } from '@/utils/initialize'
import Resume from '@/schema/resume'
import IllegalRequest from '@/schema/illegalRequest'
import Navigation from '@/schema/navigation'
import SystemPage from '@/schema/systemPage'
import CustomPage from '@/schema/customPage'
import AuthWeapp from '@/schema/authWeapp'
import Shop from '@/schema/shop'

// 根据环境确定数据库名称
const NODE_ENV = process.env.NODE_ENV || 'local' // 默认使用 local 环境
console.log('NODE_ENV:')
console.log(NODE_ENV)

// 根据运行环境选择不同的数据库名称
const getDatabaseName = () => {
  // 如果是测试环境，使用测试数据库
  if (NODE_ENV === 'local') {
    return 'birthdayDb_test'
  }
  // 如果是生产环境，使用正式环境数据库
  return 'birthdayDb'
}

// 获取最终使用的数据库名称
const DATABASE_NAME = getDatabaseName()

// 记录当前环境和使用的数据库
info(`当前运行环境: ${NODE_ENV}`)
info(`使用数据库: ${DATABASE_NAME}`)

//实例化对象
const seq = new Sequelize(DATABASE_NAME, process.env.USER_NAME, process.env.DATABASE_PASSWORD, {
    dialect: 'mysql',
    port: Number(process.env.DATABASE_PORT),
    logging: false,
    models: [User, Authority, Resume, IllegalRequest, Navigation, SystemPage, CustomPage, AuthWeapp, Shop],
    query: {
      raw: true
    }
  })

;(async () => {
  try {
    // 先创建数据库（如果不存在）
    const tempConnection = await mysql.createConnection({
      host: process.env.DATABASE_HOST || '127.0.0.1',
      port: Number(process.env.DATABASE_PORT) || 3306,
      user: process.env.USER_NAME,
      password: process.env.DATABASE_PASSWORD
    })

    info('尝试创建数据库（如果不存在）...')
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DATABASE_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`)
    await tempConnection.end()
    info(`数据库 ${DATABASE_NAME} 检查/创建完成`)

    // 然后连接到数据库并创建表
    info(`开始同步数据库表结构，已加载模型: [${Object.keys(seq.models).join(', ')}]`)
    try {
      // 使用alter:true更新表结构，保留现有数据
      // 这会保留表中的数据，只更新表结构
      await seq.sync({ alter: true })
      info('数据库表结构创建/更新完成！')
      // 清除控制台
      setAdminUser()
      // 生成默认导航（仅在首次启动且表为空时）
      await setDefaultNavigation()
      // 生成默认系统页面（仅在首次启动且指定场景无记录时）
      await setDefaultSystemPages()
    } catch (syncError) {
      info(`表同步错误: ${syncError.message}`)
      throw syncError
    }
  } catch (error) {
    console.error('无法连接或初始化数据库:', error)
  }
})()

export default seq