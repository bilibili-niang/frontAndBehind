import Navigation from '@/schema/navigation'
import { BaseRepository } from './BaseRepository'
import { Op, WhereOptions } from 'sequelize'

/**
 * 导航数据
 */
export interface NavigationData {
  id?: string
  name: string
  scene: string
  status?: number
  editUser?: string
  config?: string | object
  description?: string
  [key: string]: any
}

/**
 * 查询导航条件
 */
export interface FindNavigationCriteria {
  scene?: string
  name?: string
  status?: number
}

/**
 * 导航 Repository
 * 负责导航相关的数据访问
 */
export class NavigationRepository extends BaseRepository<Navigation> {
  constructor() {
    super(Navigation)
  }

  /**
   * 根据场景获取激活的导航
   * @param scene 场景
   * @returns 导航或null
   */
  async findActiveByScene(scene: string): Promise<Navigation | null> {
    return await this.model.findOne({
      where: { scene, status: 1 },
      order: [['updatedAt', 'DESC']]
    })
  }

  /**
   * 根据条件查询导航列表
   * @param criteria 查询条件
   * @param current 当前页
   * @param size 每页大小
   * @returns 分页结果
   */
  async findByCriteria(criteria: FindNavigationCriteria, current: number, size: number) {
    const where: WhereOptions = {}

    if (criteria.scene) {
      where.scene = criteria.scene
    }
    if (typeof criteria.status !== 'undefined') {
      where.status = criteria.status
    }
    if (criteria.name) {
      where.name = { [Op.like]: `%${criteria.name}%` }
    }

    return await this.paginate(
      { current, size },
      { where, order: [['updatedAt', 'DESC']] }
    )
  }

  /**
   * 禁用同场景的其他激活导航
   * @param scene 场景
   * @param excludeId 排除的导航ID
   */
  async deactivateOthersByScene(scene: string, excludeId: string): Promise<void> {
    await this.model.update(
      { status: 0 },
      { where: { scene, id: { [Op.ne]: excludeId }, status: 1 } }
    )
  }
}

export const navigationRepository = new NavigationRepository()
