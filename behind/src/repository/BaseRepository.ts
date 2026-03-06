import { Model, FindOptions, ModelCtor } from 'sequelize'
import { PaginationOptions, PaginationResult } from '@/types/common'

export { PaginationOptions, PaginationResult }

/**
 * 基础 Repository 类
 * 提供通用的 CRUD 和分页功能
 */
export abstract class BaseRepository<T extends Model> {
  protected model: ModelCtor<T>

  constructor(model: ModelCtor<T>) {
    this.model = model
  }

  /**
   * 分页查询
   * @param options 分页选项
   * @param findOptions 额外的查询选项
   * @returns 分页结果
   */
  async paginate(
    options: PaginationOptions,
    findOptions?: FindOptions
  ): Promise<PaginationResult<T>> {
    const { current, size } = options
    const offset = (current - 1) * size

    const { count, rows } = await this.model.findAndCountAll({
      ...findOptions,
      limit: size,
      offset,
    })

    return {
      records: rows as T[],
      total: count,
      current,
      size,
      pages: Math.ceil(count / size),
    }
  }

  /**
   * 根据 ID 删除
   * @param id 记录 ID
   * @returns 删除的记录数
   */
  async deleteById(id: string): Promise<number> {
    return await this.model.destroy({ where: { id } })
  }

  /**
   * 根据 ID 查找
   * @param id 记录 ID
   * @returns 记录或 null
   */
  async findById(id: string): Promise<T | null> {
    return await this.model.findByPk(id)
  }

  /**
   * 创建记录
   * @param data 记录数据
   * @returns 创建的记录
   */
  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data)
  }

  /**
   * 更新记录
   * @param id 记录 ID
   * @param data 更新数据
   * @returns 更新的记录数
   */
  async update(id: string, data: Partial<T>): Promise<number> {
    return await this.model.update(data, { where: { id } })
  }
}
