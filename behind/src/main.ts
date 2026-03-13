import { addAliases } from 'module-alias'
import dotenv from 'dotenv'

// 配置路径别名，需要在项目的入口
addAliases({
  '@': __dirname
})
import app from './app'
import '@/config/db'
import { info, error } from '@/config/log4j'
import { initDatabase } from './utils/database-check'

const env = dotenv.config().parsed

// 应用启动函数
const startServer = () => {
  app.listen(Number(env.PORT), () => {
    // 清除一下控制台
    // process.stdout.write('\x1Bc')
    info(`Server is running at http://localhost:${env.PORT}`)
    info(`swaggerDoc is running at http://localhost:${env.PORT}/swagger-html`)
  })
}

// 启动时自动进行数据库自检和初始化
async function bootstrap() {
  try {
    info('开始数据库自检和初始化...')
    await initDatabase()
    info('数据库自检和初始化完成，启动应用...')
    startServer()
  } catch (err) {
    error('数据库自检失败，应用无法启动:', err)
    process.exit(1)
  }
}

bootstrap()

export {
  env
}