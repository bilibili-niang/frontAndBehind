import { Resume } from '@/schema'
import { BaseRepository } from './BaseRepository'
import { FindOptions } from 'sequelize'

/**
 * 简历数据
 */
export interface ResumeData {
  id: string
  userId: string
  data?: string | object
  title?: string
  [key: string]: unknown
}

/**
 * 简历 Repository
 * 负责简历相关的数据访问
 */
export class ResumeRepository extends BaseRepository<Resume> {
  constructor() {
    super(Resume)
  }

  /**
   * 根据用户ID查询简历列表
   * @param userId 用户ID
   * @param current 当前页
   * @param size 每页大小
   * @returns 分页结果
   */
  async findByUserId(userId: string, current: number, size: number) {
    return await this.paginate(
      { current, size },
      { where: { userId } }
    )
  }

  /**
   * 根据ID和用户ID查询简历
   * @param id 简历ID
   * @param userId 用户ID
   * @returns 简历或null
   */
  async findByIdAndUserId(id: string, userId: string): Promise<Resume | null> {
    return await this.model.findOne({
      where: { id, userId }
    })
  }

  /**
   * 根据ID和用户ID更新简历
   * @param id 简历ID
   * @param userId 用户ID
   * @param data 更新数据
   * @returns 更新的记录数
   */
  async updateByIdAndUserId(id: string, userId: string, data: Partial<ResumeData>): Promise<number> {
    const [count] = await this.model.update(data, {
      where: { id, userId }
    })
    return count
  }

  /**
   * 根据ID和用户ID删除简历
   * @param id 简历ID
   * @param userId 用户ID
   * @returns 删除的记录数
   */
  async deleteByIdAndUserId(id: string, userId: string): Promise<number> {
    return await this.model.destroy({
      where: { id, userId }
    })
  }
}

export const resumeRepository = new ResumeRepository()
