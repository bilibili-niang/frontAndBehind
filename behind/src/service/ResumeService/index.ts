import { resumeRepository, ResumeData } from '@/repository/ResumeRepository'
import { Model } from 'sequelize'

/**
 * 创建简历数据
 */
export interface CreateResumeData {
  userId: string
  data?: object
  title?: string
  [key: string]: unknown
}

/**
 * 更新简历数据
 */
export interface UpdateResumeData {
  data?: object
  title?: string
  [key: string]: unknown
}

/**
 * 简历列表项
 */
export interface ResumeListItem {
  id: string
  userId: string
  data: object
  title?: string
  createdAt?: Date
  updatedAt?: Date
}

/**
 * 简历 Service
 * 处理简历相关的业务逻辑
 */
export class ResumeService {
  /**
   * 将简历数据转换为普通对象
   * 处理 data 字段的 JSON 解析
   */
  private toPlain(resume: Model | null): ResumeListItem {
    if (!resume) {
      return { id: '', userId: '', data: {} }
    }

    // 转换为普通对象
    const base = resume.toJSON() as ResumeListItem & { data: string | object }

    // 处理 data 字段
    try {
      if (typeof base?.data === 'string') {
        base.data = JSON.parse(base.data || '{}')
      } else if (!base?.data || typeof base.data !== 'object') {
        base.data = {}
      }
    } catch {
      base.data = {}
    }

    return base
  }

  /**
   * 创建简历
   * @param data 简历数据
   * @returns 创建的简历
   */
  async create(data: CreateResumeData): Promise<ResumeListItem> {
    // 将 data 对象转为 JSON 字符串
    const createData: any = { ...data }
    if (data.data && typeof data.data === 'object') {
      createData.data = JSON.stringify(data.data)
    }

    const resume = await resumeRepository.create(createData)
    return this.toPlain(resume)
  }

  /**
   * 获取用户简历列表
   * @param userId 用户ID
   * @param current 当前页
   * @param size 每页大小
   * @returns 简历列表和总数
   */
  async getResumeList(userId: string, current: number, size: number): Promise<{ count: number; rows: ResumeListItem[] }> {
    const result = await resumeRepository.findByUserId(userId, current, size)

    const rows = result.records.map((r) => this.toPlain(r))

    return {
      count: result.total,
      rows
    }
  }

  /**
   * 获取简历详情
   * @param id 简历ID
   * @param userId 用户ID
   * @returns 简历详情或null
   */
  async getResumeDetail(id: string, userId: string): Promise<ResumeListItem | null> {
    const resume = await resumeRepository.findByIdAndUserId(id, userId)
    if (!resume) {
      return null
    }
    return this.toPlain(resume)
  }

  /**
   * 更新简历
   * @param id 简历ID
   * @param userId 用户ID
   * @param data 更新数据
   * @returns 更新后的简历或null
   */
  async update(id: string, userId: string, data: UpdateResumeData): Promise<ResumeListItem | null> {
    // 将 data 对象转为 JSON 字符串
    const updateData: any = { ...data }
    if (data.data && typeof data.data === 'object') {
      updateData.data = JSON.stringify(data.data)
    }

    const count = await resumeRepository.updateByIdAndUserId(id, userId, updateData)

    if (count === 0) {
      return null
    }

    // 返回更新后的数据
    const latest = await resumeRepository.findByIdAndUserId(id, userId)
    return latest ? this.toPlain(latest) : null
  }

  /**
   * 删除简历
   * @param id 简历ID
   * @param userId 用户ID
   * @returns 删除的记录数
   */
  async deleteResume(id: string, userId: string): Promise<number> {
    return await resumeRepository.deleteByIdAndUserId(id, userId)
  }
}

export const resumeService = new ResumeService()
