/**
 * 用户角色关联初始化
 * 为现有用户分配默认角色（user 角色）
 */

import { sequelize } from '@/config/db'
import { info, error } from '@/config/log4j'
import User from '@/schema/user'
import Role from '@/schema/role'
import UserRole from '@/schema/userRole'

export async function seedUserRoles() {
  const transaction = await sequelize.transaction()

  try {
    info('开始初始化用户角色关联...')

    // 1. 获取所有用户
    const users = await User.findAll()
    info(`找到 ${users.length} 个用户`)

    // 2. 获取默认角色（user 角色）
    const defaultRole = await Role.findOne({
      where: { name: 'user' }
    })

    if (!defaultRole) {
      info('未找到默认角色，跳过用户角色关联')
      return
    }

    info(`找到默认角色：${defaultRole.name} (${defaultRole.id})`)

    // 3. 为每个用户分配默认角色（如果没有关联的话）
    let assignedCount = 0
    for (const user of users) {
      // 检查是否已有关联角色
      const existingRoles = await UserRole.findAll({
        where: { userId: user.id }
      })

      if (existingRoles.length === 0) {
        // 没有关联任何角色，分配默认角色
        await UserRole.create(
          {
            userId: user.id,
            roleId: defaultRole.id
          },
          { transaction }
        )
        assignedCount++
        info(`为用户 ${user.userName} (${user.id}) 分配默认角色：${defaultRole.name}`)
      } else {
        info(`用户 ${user.userName} (${user.id}) 已关联 ${existingRoles.length} 个角色，跳过`)
      }
    }

    await transaction.commit()
    info(`🎉 用户角色关联初始化完成！已为 ${assignedCount} 个用户分配默认角色`)
  } catch (err) {
    await transaction.rollback()
    error('初始化用户角色关联失败:', err)
    throw err
  }
}

// 如果直接运行此脚本，则执行初始化
if (require.main === module) {
  seedUserRoles()
    .then(() => {
      info('脚本执行完成')
      process.exit(0)
    })
    .catch(err => {
      error('脚本执行失败:', err)
      process.exit(1)
    })
}
