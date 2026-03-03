import { Sequelize } from 'sequelize-typescript'
import User from '@/schema/user'
import Authority from '@/schema/authority'
import * as process from 'node:process'
import { info } from './log4j'
import Resume from '@/schema/resume'
import IllegalRequest from '@/schema/illegalRequest'
import Navigation from '@/schema/navigation'
import SystemPage from '@/schema/systemPage'
import CustomPage from '@/schema/customPage'
import AuthWeapp from '@/schema/authWeapp'
import Shop from '@/schema/shop'

// 根据环境确定数据库名称
const NODE_ENV = process.env.NODE_ENV || 'local' // 默认使用 local 环境
console.log('NODE_ENV:', NODE_ENV)

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
  host: process.env.DATABASE_HOST || '127.0.0.1',
  port: Number(process.env.DATABASE_PORT),
  logging: false,
  models: [User, Authority, Resume, IllegalRequest, Navigation, SystemPage, CustomPage, AuthWeapp, Shop],
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    connectTimeout: 5000
  },
  query: {
    raw: true
  }
})

// 验证连接
seq.authenticate()
  .then(() => {
    info('数据库连接成功')
  })
  .catch((err) => {
    console.error('无法连接到数据库:', err)
  })

export default seq
