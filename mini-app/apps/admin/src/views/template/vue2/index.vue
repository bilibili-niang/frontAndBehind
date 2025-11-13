<template>
  <div class="vue2-demo-page">
    <div class="card">
      <h2>Vue2 风格测试页面（Options API）</h2>
      <div class="form-row">
        <label>输入文本：</label>
        <input v-model="text" placeholder="随便输入点什么"/>
      </div>
      <div class="form-row">
        <label>计数器：</label>
        <span class="count">{{ count }}</span>
        <Button @click="inc">+1</Button>
        <Button @click="reset">重置</Button>
      </div>
      <div class="summary">当前摘要：{{ summary }}</div>
    </div>

    <div class="card">
      <h2>useSearchTable 在 Vue2（Options API）中的使用</h2>
      <h2>一般表单页面直接放 SearchTable 即可,不用为它包裹外层容器,例如下面一个菜单(Vue2的SearchTable)</h2>
      <!-- 纯 Vue2 写法：直接使用 SearchTable 组件与插槽，无 setup -->
      <SearchTable
        :tableKey="tableKey"
        :title="'示例列表'"
        :filter="filter"
        :table="table"
        :initialSize="pageSize"
        :customRequest="customRequest"
      >
        <template #toolbar>
          <div class="flex gap-2">
            <div class='p-r-2'>
              <Button type="primary" @click="onCreateRealize">新建
              </Button>
            </div>
            <div class='p-r-2'>
              <Button type="primary" @click="refresh">刷新数据</Button>
            </div>
            <div class=''>
              <Button @click="silentRefresh">静默刷新</Button>
            </div>

          </div>
        </template>
      </SearchTable>
    </div>

    <div class="code-block">
      <!-- 展示本页面源码 -->
      <SourceView :filename="'src/views/test/vue2-demo/index.vue'" :code="sourceCode" lang="html"/>
    </div>
  </div>
</template>

<script>
import {Button, SourceView} from '@anteng/ui'
import {SearchTable, useCrud, useTableAction} from '@anteng/core'
import sourceCode from './index.vue?raw' // 路由元信息（用于菜单标题与排序）

// 路由元信息（用于菜单标题与排序）,这个是每个页面必须的
export const routeMeta = {
  title: 'Vue2测试页面',
  order: 3,
  hideInMenu: true
}

// 纯 Vue2 + useCrud：在模块作用域初始化 CRUD（参考其他页面写法）
const TABLE_KEY = 'vue2-demo-search-table'
const {onCreate, onUpdate, onRemove, refresh, silentRefresh} = useCrud({
  title: '示例项',
  schema: (type) => ({
    type: 'object',
    properties: {
      name: {title: '名称', type: 'string', required: true},
      status: {title: '状态', type: 'boolean'}
    },
    required: type === 'create' ? ['name'] : []
  }),
  retrieve: (row) => ({name: row.name, status: row.status}),
  // 提交前格式化（演示用直接返回）
  format: (v) => v
})

export default {
  name: 'Vue2DemoPage',
  components: {SourceView, Button, SearchTable},
  data() {
    return {
      text: '',
      count: 0,
      // 将上方模块内的源码字符串注入到实例，供模板使用
      sourceCode,
      // SearchTable 所需配置（纯 Vue2 写法）,一般不用写,有默认值
      pageSize: 10,
      tableKey: TABLE_KEY,
      filter: {
        list: [
          {key: 'keywords', label: '关键词', type: 'input', fixed: true, flex: 6, config: {placeholder: '按名称过滤'}},
          {
            key: 'status',
            label: '状态',
            type: 'select',
            fixed: true,
            flex: 4,
            config: {options: [{label: '启用', value: 1}, {label: '停用', value: 0}]}
          },
          {key: 'createTime', label: '创建时间', type: 'range-picker', flex: 8}
        ]
      },
      table: {
        columns: [
          {dataIndex: 'id', title: 'ID', width: 120},
          {dataIndex: 'name', title: '名称', width: 260},
          {dataIndex: 'status', title: '状态', width: 120, customRender: ({text}) => (text === 1 ? '启用' : '停用')},
          {dataIndex: 'createTime', title: '创建时间', width: 200},
          {
            title: '操作',
            width: 160,
            customRender: ({record}) => {
              return useTableAction({
                list: [
                  {title: '编辑', onClick: () => onUpdate(record)},
                  {
                    title: '删除',
                    type: 'danger',
                    onClick: () => onRemove(() => Promise.resolve({code: 200, msg: '删除成功'}))
                  }
                ]
              })
            }
          }
        ]
      }
    }
  },
  computed: {
    summary() {
      return `${this.text || '空'}（计数：${this.count}）`
    }
  },
  methods: {
    // SearchTable 的自定义请求（与模板示例保持一致）,仅用于构建假数据
    async customRequest(params) {
      const current = Number(params.current || 1)
      const size = Number(params.size || this.pageSize)
      const keywords = params.keywords
      const status = params.status
      const records = Array.from({length: size}).map((_, i) => {
        const id = `${(current - 1) * size + i + 1}`
        const baseName = `演示数据-${id}`
        const name = keywords ? `${baseName}-${keywords}` : baseName
        const st = typeof status === 'number' ? (status === 1 ? 1 : 0) : (i % 2 === 0 ? 1 : 0)
        const createTime = new Date(Date.now() - i * 3600_000).toISOString().slice(0, 19).replace('T', ' ')
        return {id, name, status: st, createTime}
      })
      const total = 57
      return Promise.resolve({
        code: 200,
        success: true,
        msg: 'ok',
        data: {
          countId: '',
          current,
          maxLimit: 0,
          optimizeCountSql: true,
          orders: [],
          pages: Math.ceil(total / size),
          records,
          searchCount: true,
          size,
          total
        }
      })
    },
    inc() {
      this.count++
    },
    reset() {
      this.text = ''
      this.count = 0
    },
    onCreateRealize() {
      onCreate(data => {
        console.log('这是新建后的数据', data)
        // 返回一个异步请求,请求结束,会自动调用第二个方法
        return Promise.resolve({code: 200, msg: '创建成功'})
      }, refresh)
    }
  }
}
</script>

<style scoped>
.vue2-demo-page {
  padding: 16px;
  overflow: auto;
}
.card {
  background: var(--v-color-bg-50);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}
.form-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}
.form-row input {
  flex: 1;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #2a2a2a;
  background: var(--v-color-bg-50);
}
.count {
  min-width: 40px;
  display: inline-block;
  text-align: center;
}
button {
  padding: 6px 10px;
}
.summary {
  margin-top: 8px;
  color: #aaa;
}
.code-block {
  margin-top: 12px;
}
</style>