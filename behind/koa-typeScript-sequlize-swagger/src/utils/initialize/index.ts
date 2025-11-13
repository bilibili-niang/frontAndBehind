import md5 from 'md5'
/*
 * 数据库初始化操作
 * */
import User from '@/schema/user'
import Navigation from '@/schema/navigation'
import { info } from '@/config/log4j'
import SystemPage from '@/schema/systemPage'
import CustomPage from '@/schema/customPage'
import { defaultPages } from '@/config'

// 初始化管理员用户
export const setAdminUser = () => {
  User.findOne({
    where: {
      isAdmin: true
    }
  })
    .then(res => {
      if (!res) {
        console.log('添加admin用户')
        User.create({
          userName: process.env.ADMIN_USER_NAME,
          password: md5(process.env.ADMIN_USER_PASSWORD),
          isAdmin: true
        })
      }
    })
}

// 初始化默认导航（仅在首次启动且没有任何导航记录时创建）
export const setDefaultNavigation = async () => {
  try {
    // 仅在指定场景（weapp）不存在任何记录时创建默认导航
    const scene = 'yesong'
    const count = await Navigation.count({ where: { scene } })
    if (count > 0) {
      info(`默认导航种子：检测到 scene=${scene} 已存在 ${count} 条记录，跳过创建`)
      return
    }

    const defaultConfig = {
      theme: 'common',
      borderRadius: [0, 0, 0, 0],
      backgroundColor: 'rgba(255, 255, 255, 1)',
      color: '#999',
      activeColor: 'rgba(0, 0, 0, 1)',
      list: [
        { page: { id: 'service-list', name: '服务列表' } },
        { page: { id: 'profile', name: '个人中心' } },
        {
          page: { id: 'index', name: '首页' },
          text: '测试名字',
          icon: {
            normal: {
              url: 'https://dev-cdn.cardcat.cn/kacat/system-solid-68-savings.gif',
              width: 400,
              height: 400
            },
            active: {
              url: 'https://dev-cdn.cardcat.cn/kacat/system-solid-41-home.gif',
              width: 400,
              height: 400
            }
          }
        }
      ]
    }

    await Navigation.create({
      name: '默认导航',
      scene,
      status: 1,
      editUser: 'system',
      description: '系统首次启动自动生成的默认导航',
      config: JSON.stringify(defaultConfig)
    })

    info('默认导航种子：创建成功')
  } catch (e) {
    info(`默认导航种子：创建失败 -> ${e?.message ?? e}`)
  }
}

// 初始化系统页面（仅当指定 scene 下不存在未删除记录时）
export const setDefaultSystemPages = async () => {
  try {
    // 需要确保的系统页面键值
    const requiredPages = defaultPages

    // 收集所有已存在的场景（Navigation、CustomPage、SystemPage）
    const scenes = new Set<string>()

    const navScenes = await Navigation.findAll({ attributes: ['scene'] })
    navScenes.forEach(s => s.scene && scenes.add(s.scene))

    const customScenes = await CustomPage.findAll({ attributes: ['scene'] })
    customScenes.forEach(s => s.scene && scenes.add(s.scene))

    const sysScenes = await SystemPage.findAll({ attributes: ['scene'] })
    sysScenes.forEach(s => s.scene && scenes.add(s.scene))

    // 如果系统内尚未出现任何场景，则默认以 yesong 为初始场景
    if (scenes.size === 0) {
      scenes.add('yesong')
    }

    let createdCount = 0
    for (const scene of scenes) {
      for (const page of requiredPages) {
        const exist = await SystemPage.findOne({ where: { scene, key: page.key, isDeleted: 0 } })
        if (!exist) {
          await SystemPage.create({
            ...page,
            scene,
            isProtected: 1,
            editUser: 'system',
            description: '系统初始化默认页面（不可删除）'
          })
          createdCount++
        }
      }
    }

    if (createdCount > 0) {
      info(`系统页面种子：已为 ${[...scenes].join(', ')} 创建 ${createdCount} 条缺失页面`)
    } else {
      info(`系统页面种子：所有场景的必备页面均已存在，无需创建`)
    }
  } catch (e: any) {
    info(`系统页面种子：创建失败 -> ${e?.message ?? e}`)
  }
}