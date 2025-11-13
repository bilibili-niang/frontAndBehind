import { computed, defineComponent, onMounted, ref } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { Cascader, Icon, message } from '@anteng/ui'

// ！！！不要用同步代码，数据很大，使用异步加载
// import citiesDate from './cities.json'

//根据省市区编码查询省市区
function getArea(json: any, code: any) {
  let names = [] as any[]
  let codes = [] as any[]

  function findCity(list: any, code: any, father?: any) {
    const index = list.findIndex((ev: any) => {
      // 这里可能有问题，因为code可能是number，但是ev.code是string
      return ev.code + '' === code + ''
    })

    if (index > -1) {
      const child = list[index]
      names.unshift(child.label)
      codes.unshift(child.code)
      father && names.unshift(father.label) && codes.unshift(father.code)
      father && findCity(json || [], father.code)
      return
    }
    list.map((item: any) => {
      if (item.children) {
        findCity(item.children || [], code, item)
      }
    })
  }

  findCity(json, code)
  names = [...new Set(names)]
  codes = [...new Set(codes)]
  return { codes, names }
}

export interface citiesRefType {
  getData: (code: string) => string[] | null
}

/**
 *  config中传入:
 *  changeOnSelect
 *  可选任意一级
 *  optionalNationalOrNot
 *  是否展示全国
 */
export default defineComponent({
  name: 'w_cities',
  props: {
    ...CommonWidgetPropsDefine,
    textOnly: Boolean
  },
  setup(props, { emit, expose }) {
    const onChange = (v: any) => {
      // 清除
      if (v === undefined) {
        props.onChange('')
        return void 0
      }

      if (props.config?.multiple) {
        // 开启多选
        props.onChange(v)
      } else {
        props.onChange(v[v.length - 1])
      }
    }
    const formatedValue = computed(() => {
      if (!props.value) return undefined
      if (props.config?.multiple) {
        // 多选
        return props.value
      } else {
        // 单选时
        return getArea(options.value, props.value).codes
      }
    })

    const options = ref<any[]>([])
    const citiesData = ref<any[]>([])

    const loadData = async () => {
      try {
        const tempData = (await (() => import('./cities.json'))()).default
        if (props.config?.optionalNationalOrNot) {
          options.value = [
            {
              code: '000000',
              label: '全国'
            },
            ...tempData
          ]
          citiesData.value = [
            {
              code: '000000',
              value: '全国'
            },
            ...tempData
          ]
        } else {
          options.value = tempData
          citiesData.value = tempData
        }
      } catch (err) {
        message.error('省市区数据加载失败')
      }
    }

    onMounted(() => {
      loadData()
    })

    expose({
      /*
       * 获取省市区数据
       * @param {string} code 省市区编码
       * @return {string[] | null}
       * @example return
       * [湖南省,衡阳市,石鼓区]
       * */
      getData: (numberOrString: string) => {
        const code = numberOrString + ''
        const findPath = (nodes: any[], targetCode: string, path: string[] = []): string[] | null => {
          for (const node of nodes) {
            if (node.code === targetCode) {
              return [...path, node.value]
            }
            if (node.children) {
              const found = findPath(node.children, targetCode, [...path, node.value])
              if (found) return found
            }
          }
          return null
        }

        const result = findPath(citiesData.value, code)
        return result || null
      }
    })

    const chain = computed(() => {
      if (Array.isArray(props.value)) {
        return props.value
      }
      const code = props.value
      if (!/^\d{6}$/.test(code)) {
        return []
      }
      if (/0000$/.test(code)) {
        return [code]
      } else if (/00$/.test(code)) {
        return [code.slice(0, 2) + '0000', code]
      } else {
        return [code.slice(0, 2) + '0000', code.slice(0, 4) + '00', code]
      }
    })

    const cityPath = computed(() => {
      let scope = citiesData.value
      return chain.value
        .map((code) => {
          const t = scope?.find((item) => item.code === code)
          scope = t?.children
          return t
        })
        .filter((i) => i)
    })

    return () => {
      if (props.textOnly) {
        return (
          <div>
            {cityPath.value.map((item, index) => {
              return (
                <span>
                  &nbsp;
                  {item.label}
                </span>
              )
            })}
          </div>
        )
      }
      return (
        <div class="w_cities">
          <Cascader
            {...props.config}
            allowClear
            value={formatedValue.value}
            fieldNames={{ value: 'code' }}
            options={options.value}
            onChange={onChange}
            expandIcon={<Icon name="right"></Icon>}
          ></Cascader>
        </div>
      )
    }
  }
})
