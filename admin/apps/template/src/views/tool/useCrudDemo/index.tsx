import { defineComponent, ref } from 'vue'
import type { RouteMeta } from '@/router/routeMeta'
import { Button, InputNumber, message, Select } from '@anteng/ui'
import { useCrud } from '@anteng/core'
import { useRouter } from 'vue-router'

type User = {
  id?: string
  userName: string
  password: string
  status: 0 | 1
}

export default defineComponent({
  name: 'UseCrudDemo',
  setup() {
    const current = ref<User | null>(null)
    const router = useRouter()

    enum couponGoodsRangeType {
      all = 0,
      valid = 1,
      invalid = 2
    }

    const COUPON_GOODS_RANGE_TYPE_OPTIONS = [
      { label: '全部可用', value: couponGoodsRangeType.all },
      { label: '指定商品可用', value: couponGoodsRangeType.valid },
      { label: '指定商品不可用', value: couponGoodsRangeType.invalid }
    ]

    enum goodsType {
      goods = 0,
      group = 1,
      category = 2,
      supplier = 3
    }

    const goodsTypeOptions = [
      { label: '商品', value: goodsType.goods },
      { label: '商品分组', value: goodsType.group },
      { label: '商品分类', value: goodsType.category },
      { label: '供应商', value: goodsType.supplier }
    ]

    enum couponScope {
      all = 0,
      supplier = 1,
      goods = 2
    }

    const { onCreate, onRemove, onUpdate, onRead, onToggleStatus } = useCrud({
      title: '储值卡',
      width: 800,
      schema: () => {
        return {
          type: 'object',
          properties: {
            name: {
              title: '储值卡名称',
              type: 'string',
              required: true,
              config: {
                placeholder: '请输入'
              }
            },
            valid: {
              title: '有效期',
              type: 'object',
              widget: (props) => {
                return (
                  <div class="order-flow-form-item" style="display:flex;align-items:center;gap:8px">
                    自激活后
                    <InputNumber
                      style="width:100px"
                      value={props.rootValue.validityPeriod}
                      placeholder="不限"
                      onChange={(v) => {
                        props.rootValue.validityPeriod = v
                        props.onChange(props.value)
                      }}
                      max={7500}
                      min={1}
                    />
                    <Select
                      style="width:80px"
                      options={[
                        { label: '天', value: 0 },
                        { label: '小时', value: 1 }
                      ]}
                      value={props.rootValue.validityPeriodUnit}
                      onChange={(v) => {
                        props.rootValue.validityPeriodUnit = v
                        props.onChange(props.value)
                      }}
                    />
                    &nbsp; 有效
                  </div>
                )
              }
            },
            cardStyle: {
              title: '卡面样式',
              type: 'string',
              required: true,
              widget: 'radio-button',
              config: {
                options: [
                  { label: '默认卡面', value: 0 },
                  { label: '自定义卡面', value: 1 }
                ]
              }
            },
            images: {
              title: '卡面图片',
              type: 'array',
              widget: 'images',
              required: true,
              config: {
                compact: true,
                width: 'calc((100% - 8px * 3) / 9)',
                ratio: '16:9',
                min: 1,
                max: 6
              }
            },
            purchasingNotice: {
              title: '购买须知',
              type: 'string',
              widget: 'rich-text',
              config: {
                placeholder: '请输入',
                maxlength: 255
              }
            },
            linkType: {
              // TODO 前台还没写储值卡页面
              title: '使用链接',
              type: 'string',
              required: true,
              widget: 'radio-button',
              config: {
                options: [
                  { label: '首页', value: 0 },
                  { label: '指定页面', value: 1 }
                ]
              }
            },
            linkUrl: {
              title: '跳转页面',
              type: 'object',
              required: true,
              widget: 'action',
              condition: (rootV) => rootV.linkType === 1
            }
          }
        }
      },
      onChange: (e) => {
      },
      defaultValue: () => {
        return {
          useRange: 0,
          name: '',
          cardStyle: 0,
          images: [],
          purchasingNotice: '',
          linkType: 0,
          linkUrl: [],
          goods: {
            scope: couponScope.all,
            goodsType: 0
          },
          validityPeriod: undefined,
          validityPeriodUnit: 0
        }
      }
    })

    const create = () => onCreate(data => {
      console.log('data')
      console.log(data)
    }, () => {
      console.log('创建成功了')
    })
    const edit = () => current.value ? onUpdate(current.value) : message.error('请先创建或选择用户')
    const read = () => current.value ? onRead(current.value) : message.error('暂无数据可查看')
    const toggle = () => onToggleStatus(current.value?.status ?? 1)

    return () => (
      <div class="p-4">
        <div class="mb-3">演示包含：新建 / 编辑 / 查看 / 删除 / 状态切换</div>

        <div class="flex gap-2 mb-4">
          <Button color="primary" onClick={create}>新建储值卡</Button>
          <Button onClick={edit}>编辑用户</Button>
          <Button onClick={read}>查看用户</Button>
          <Button onClick={toggle}>切换状态</Button>
          <Button color="danger" onClick={() => {
            onRemove(() => {
              console.log('移除成功')
            })
          }}>删除</Button>
          <Button onClick={() => router.push('/tool/useSearchTableDemo')}>查看 useSearchTable 示例</Button>
        </div>

        <div class="mb-4 p-3 rounded border border-[var(--ui-border-color)]">
          <div class="mb-2 font-semibold">当前数据：</div>
          <pre class="text-xs">{JSON.stringify(current.value, null, 2)}</pre>
        </div>
      </div>
    )
  }
})

export const routeMeta: RouteMeta = {
  title: 'useCrud 示例',
  order: 10
}