import './index.scss'
import { defineComponent, onMounted, ref, withModifiers } from 'vue'
import { Icon, Tooltip } from '@anteng/ui'
import { useCrud } from '../../../lib'
import type { Schema } from '@anteng/jsf'
import request from '../../api/request'

export default defineComponent({
  name: 'Category',
  props: {
    // 增删改查的url,请遵循Restful API 规范,不遵循让后端改
    url: {
      type: String,
      required: true
    },
    // 标题要展示的名词
    noun: {
      type: String,
      default: '分类'
    },
    // useCrud要用到的
    schema: {
      type: [Object, Function],
      required: true
    },
    defaultValue: {
      type: Object,
      default: () => ({})
    },
    // 数据转换函数
    transform: {
      type: Function,
      default: (data: any) => data
    },
    // 更新时的数据转换函数
    transformForUpdate: {
      type: Function,
      default: (data: any) => data
    },
    // 附加的查询参数
    params: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['select', 'clickedAll'],
  setup(props, { emit, expose, slots }) {
    const categories = ref<any[]>([])
    const currentCategoryId = ref('')

    // 使用 useCrud，支持 schema 和 defaultValue 为函数
    const { onCreate, onUpdate, onRemove } = useCrud({
      title: props.noun,
      schema: typeof props.schema === 'function' ? props.schema() : (props.schema as Schema),
      defaultValue: () => props.defaultValue
    })

    // 初始化数据
    const init = async () => {
      try {
        const res = await request.get(props.url, {
          params: {
            current: 1,
            size: 9999,
            ...props.params
          }
        })
        if (res?.data?.records) {
          categories.value = res.data.records
        }
      } catch (error) {
        console.error('获取分类列表失败:', error)
      }
    }

    // 创建分类
    const handleCreate = () => {
      onCreate(async (data) => {
        const transformedData = props.transform(data)
        return request.post(props.url, transformedData)
      }, init)
    }

    // 更新分类
    const handleUpdate = (record: any) => {
      onUpdate(
        props.transformForUpdate(record),
        async (data) => {
          const transformedData = props.transform(data)
          return request.put(`${props.url}/${record.id}`, transformedData)
        },
        init
      )
    }

    // 删除分类
    const handleRemove = (record: any) => {
      onRemove(async () => {
        return request.delete(`${props.url}/${record.id}`)
      }, init)
    }

    onMounted(init)
    // 切换分类
    const toggleCategory = (id: string) => {
      currentCategoryId.value = id
      emit('select', id)
    }
    expose({
      categories,
      currentId: currentCategoryId,
      // 搜索
      init
    })
    return () => {
      return (
        <div class="n-category-content">
          <h2>
            {props.noun}管理
            <a onClick={handleCreate}>
              <Icon name="add" />
              新建{props.noun}
            </a>
          </h2>
          {/* 你可以在这里放一个搜索框 */}
          {slots?.default?.()}
        <div class="category-list ui-scrollbar">
            <div
              class={['category-item clickable', !currentCategoryId.value && 'active']}
              onClick={() => {
                toggleCategory('')
                init()
                emit('clickedAll')
              }}
            >
              全部
            </div>
            {categories.value.map((item) => {
              return (
                <div
                  class={['category-item clickable', currentCategoryId.value === item.id && 'active']}
                  onClick={() => toggleCategory(item.id)}
                >
                  <div class="category-item__name">{item.name}</div>
                  <div class="category-item__btns">
                    <Tooltip title="编辑">
                      <Icon
                        name="edit"
                        onClick={withModifiers(() => {
                          handleUpdate(item)
                        }, ['stop'])}
                      />
                    </Tooltip>
                    <Tooltip title="删除">
                      <Icon
                        name="tag-delete"
                        onClick={withModifiers(() => {
                          handleRemove(item)
                        }, ['stop'])}
                      />
                    </Tooltip>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  }
})
