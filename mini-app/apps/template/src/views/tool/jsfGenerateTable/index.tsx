import { defineComponent, reactive, ref } from 'vue'
import type { RouteMeta } from '@/router/routeMeta'
import { type ErrorSchema, type Schema, SchemaForm, validateForm } from '@anteng/jsf'
import { Button, message, Switch, Empty } from '@anteng/ui'

// 通过 Schema 生成数据填写表单的示例
const schema: Schema = {
  type: 'object',
  title: '示例表单',
  properties: {
    name: {
      type: 'string',
      title: '姓名',
      required: true,
      default: '',
      validator: {
        compile: (v: any) => !!v,
        message: '请输入姓名'
      }
    },
    age: {
      type: 'number',
      title: '年龄',
      required: true,
      default: 18,
      validator: {
        compile: (v: any) => v === undefined || v === null || (!Number.isNaN(Number(v)) && Number(v) >= 0),
        message: '年龄必须为非负数'
      }
    },
    subscribed: {
      type: 'boolean',
      title: '订阅新闻',
      default: false
    },
    address: {
      type: 'object',
      title: '地址',
      properties: {
        city: { type: 'string', title: '城市', default: '上海' },
        street: { type: 'string', title: '街道' }
      }
    },
    tags: {
      type: 'array',
      title: '标签',
      items: { type: 'string', title: '标签项' },
      default: ['示例']
    }
  },
  default: {
    name: '张三'
  }
}

export const routeMeta: RouteMeta = {
  title: 'jsfGenerateTable测试页面'
}

export default defineComponent({
  name: 'JsfGenerateTableDemo',
  setup() {
    const isChecked = ref(false)
    // SchemaForm 会根据 schema.default 深度合并到 value
    const data = reactive<any>({})
    const errorSchema = ref<ErrorSchema | null>(null)

    const onChange = (value: any) => {
      // 统一写入，保持联动（对象引用不变）
      Object.assign(data, value)
    }

    const onValidate = () => {
      const res = validateForm(schema, data)
      if (!res.valid) {
        errorSchema.value = { valid: false, errorMap: res.errorMap } as any
        message.error('存在未通过的校验项')
      } else {
        errorSchema.value = { valid: true, errorMap: {} } as any
        message.success('校验通过')
      }
    }

    return () => (
      <div class="p-2 jsfContent">
        一个测试开关:
        <Switch
          checked={isChecked.value}
          onChange={e => {
            console.log(e)
            isChecked.value = e
          }}
        />
        <div class="mb-3 text-sm">通过 Schema 生成的表单示例（含对象、数组、校验）</div>
        <div class="mb-3 flex gap-2">
          <Button color="primary" onClick={onValidate}>校验并提示</Button>
        </div>
        <SchemaForm
          schema={schema}
          value={data}
          onChange={onChange}
          theme="standard"
          errorSchema={errorSchema.value as any}
        />
        <div class="mt-4 p-3 rounded border border-[var(--ui-border-color)]">
          <div class="mb-2 font-semibold">Empty 封装演示：</div>
          <Empty description="暂无数据（自定义图片）" />
        </div>
        <div class="mt-4 p-3 rounded border border-[var(--ui-border-color)]">
          <div class="mb-2 font-semibold">当前数据：</div>
          <pre class="text-xs">{JSON.stringify(data, null, 2)}</pre>
        </div>
      </div>
    )
  }
})
