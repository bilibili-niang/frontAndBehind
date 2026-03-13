import md5 from 'md5'
/*
 * 数据库初始化操作
 * */
import User from '@/schema/user'
import Navigation from '@/schema/navigation'
import { info, error } from '@/config/log4j'
import SystemPage from '@/schema/systemPage'
import CustomPage from '@/schema/customPage'
import { defaultPages } from '@/config'
import Role from '@/schema/role'
import UserRole from '@/schema/userRole'
import { sequelize } from '@/config/db'

// 初始化管理员用户并关联 admin 角色
export const setAdminUser = async () => {
  try {
    const adminUser = await User.findOne({
      where: {
        isAdmin: true
      }
    })
    
    if (!adminUser) {
      info('添加 admin 用户')
      const newUser = await User.create({
        userName: process.env.ADMIN_USER_NAME,
        password: md5(process.env.ADMIN_USER_PASSWORD),
        isAdmin: true
      })
      info(`admin 用户创建成功，ID: ${newUser.id}`)
      
      // 为新创建的 admin 用户关联 admin 角色
      await assignAdminRoleToUser(newUser.id)
    } else {
      info('admin 用户已存在')
      // 检查已存在的 admin 用户是否有关联角色，如果没有则关联
      await assignAdminRoleToUser(adminUser.id)
    }
  } catch (err) {
    error('初始化 admin 用户失败:', err)
  }
}

// 为管理员用户分配 admin 角色
const assignAdminRoleToUser = async (userId: string) => {
  try {
    // 查找 admin 角色
    const adminRole = await Role.findOne({
      where: { name: 'admin' }
    })
    
    if (!adminRole) {
      info('未找到 admin 角色，跳过角色关联')
      return
    }
    
    // 检查是否已有关联
    const existingUserRole = await UserRole.findOne({
      where: {
        userId,
        roleId: adminRole.id
      }
    })
    
    if (!existingUserRole) {
      await UserRole.create({
        userId,
        roleId: adminRole.id
      })
      info(`用户 ${userId} 已关联 admin 角色`)
    } else {
      info(`用户 ${userId} 已关联 admin 角色，跳过`)
    }
  } catch (err) {
    error('关联 admin 角色失败:', err)
  }
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
              url: 'https://dev-cdn.cardcat.cn/dev-cdn.ice/system-solid-68-savings.gif',
              width: 400,
              height: 400
            },
            active: {
              url: 'https://dev-cdn.cardcat.cn/dev-cdn.ice/system-solid-41-home.gif',
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
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e)
    info(`系统页面种子：创建失败 -> ${errorMsg}`)
  }
}