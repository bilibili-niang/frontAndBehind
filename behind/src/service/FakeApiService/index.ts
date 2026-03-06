import { generateByDataSchema, DataSchemaSpec } from '@/utils/fake'
import { navigationRepository } from '@/repository/NavigationRepository'
import { StandardPaginationResult } from '@/types/common'
import { Model } from 'sequelize'

/**
 * DataSchema 规范
 */
export interface DataSchemaInput {
  type: 'object' | 'array'
  schema: Record<string, unknown>
}

/**
 * 生成测试数据结果
 */
export interface GenerateResult {
  data: unknown
  type: 'object' | 'array'
}

/**
 * 导航列表项
 */
export interface NavigationListItem {
  id: string
  name: string
  editUser?: string
  createTime: string | null
  updateTime: string | null
  status?: number
  scene?: string
}

/**
 * 分页结果
 */
export type PaginationResult = StandardPaginationResult<NavigationListItem>

/**
 * FakeApi Service
 * 处理测试数据生成和模拟 API 相关的业务逻辑
 */
export class FakeApiService {
  /**
   * 根据 DataSchema 生成测试数据
   * @param dataSchema 数据模式
   * @param count 生成数量
   * @returns 生成的测试数据
   */
  generateTestData(dataSchema: DataSchemaInput, count: number): GenerateResult {
    const spec: DataSchemaSpec = {
      type: dataSchema.type,
      schema: dataSchema.schema
    }

    const result = generateByDataSchema(spec, count)

    return {
      data: result,
      type: spec.type
    }
  }

  /**
   * 获取导航列表
   * @param criteria 查询条件
   * @param current 当前页
   * @param size 每页大小
   * @returns 分页结果
   */
  async getNavigationList(
    criteria: {
      scene?: string
      name?: string
      status?: number
    },
    current: number,
    size: number
  ): Promise<PaginationResult> {
    const result = await navigationRepository.findByCriteria(criteria, current, size)

    const pages = Math.ceil(result.total / result.size)

    const records: NavigationListItem[] = result.records.map((row: Model) => {
      const plain = row.toJSON() as NavigationListItem & { createdAt: Date; updatedAt: Date }
      return {
        id: plain.id,
        name: plain.name,
        editUser: plain.editUser,
        createTime: plain.createdAt ? new Date(plain.createdAt).toISOString() : null,
        updateTime: plain.updatedAt ? new Date(plain.updatedAt).toISOString() : null,
        status: plain.status,
        scene: plain.scene
      }
    })

    return {
      countId: '',
      current: result.current,
      maxLimit: result.size,
      optimizeCountSql: true,
      orders: [],
      pages,
      records,
      searchCount: true,
      size: result.size,
      total: result.total
    }
  }
}

export const fakeApiService = new FakeApiService()
