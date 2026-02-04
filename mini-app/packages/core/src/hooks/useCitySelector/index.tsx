import { computed, ref, watch } from 'vue'
import useModal from '../useModal'
import './style.scss'
import { $getCities } from '../../api'
import { useLoading, useLoadingEnd } from '../useLoading'
import useResponseMessage from '../useResponseMessage'
import { ScrollTab, ScrollTabItem } from '@pkg/ui'
import EmptyStatus, { EmptyAction } from '../../components/empty-status'
import fj from './fj'

type Node = {
  code: string
  label: string
  value: string
  children?: Node[]
  unlimited?: boolean
}

const cities = ref<Node[]>([fj])
const hasError = ref(false)
const fetchCities = () => {
  useLoading()
  $getCities()
    .then(res => {
      cities.value = res as Node[]
      hasError.value = false
    })
    .catch(err => {
      if (hasError.value) {
        useResponseMessage(err)
      }
      hasError.value = true
    })
    .finally(() => {
      useLoadingEnd()
    })
}

export const useCitySelector = (options?: { unlimited?: boolean }) => {
  fetchCities()

  const ALLOW_UNLIMITED = options?.unlimited === false ? false : true

  const cityState = ref<string[]>([])

  const cityPath = computed(() => {
    let scope = cities.value
    return cityState.value
      .map(code => {
        const t = scope?.find(item => item.code === code)
        scope = t?.children
        return t
      })
      .filter(i => i)
  })

  const currentType = ref(Math.max(cityState.value.length - 1, 0))

  watch(
    () => cityState.value,
    () => {
      currentType.value = Math.max(cityState.value.length - 1, 0)
    }
  )

  const typesLabelMap = []
  const types = computed(() => {
    if (!cities.value) return []
    let scopes = cities.value?.slice(0)
    let parent: any
    const list = [...cityState.value, undefined]
      .map((code, index, arr) => {
        if (!(scopes?.length > 0)) return undefined
        const target = scopes.find(item => item.code === code)
        const obj = {
          code,
          label: target?.label || `请选择${typesLabelMap[index] || ''}`,
          active: currentType.value === index,
          options: scopes?.slice(0) || []
        }

        if (ALLOW_UNLIMITED && parent && obj.options.length > 0) {
          obj.options.unshift({
            unlimited: true,
            code: parent.code,
            // label: '不限',
            // value: '不限',
            label: `不限（全${parent.label}）`,
            value: `不限（全${parent.label}）`,
            children: []
          })
        }

        scopes = target?.children || []
        parent = obj
        return obj
      })
      .filter(i => !!i)
    return list
  })

  const currentTypeRef = computed(() => types.value[currentType.value])

  let modal: any

  const selectCity = (callback: (v: string[]) => void) => {
    const onSelect = (code: string) => {
      // 截取这个值之前的类型（因为可能返回之前的某一步选择，那么后面的数据就应该删除）
      const v = cityState.value.slice(0, currentType.value)
      // 追加当前值
      cityState.value = [...v, code]

      // console.log(v,  cityState.value)

      // 如果还有下一级
      if (types.value[currentType.value + 1]) {
        currentType.value++
        if (ALLOW_UNLIMITED) {
          // 自动选择 "不限"
          cityState.value.push(code)
        }
      } else {
        confirm()
      }

      console.log(cityPath.value)
    }

    const confirm = () => {
      modal.close()
      callback(cityState.value)
    }

    modal = useModal({
      title: undefined,
      padding: 0,
      backgroundColor: '#fff',
      closeable: false,
      content: () => {
        if (hasError.value) {
          return (
            <EmptyStatus
              actions={() => {
                // @ts-ignore
                return <EmptyAction onClick={fetchCities}>重试</EmptyAction>
              }}
            />
          )
        }
        return (
          <div class="use-city-selector">
            <div class="use-city-selector__header">
              <div class="use-city-selector__title">
                <div class="use-city-selector__reset" onClick={reset}>
                  重置
                </div>
                <div class="text">选择地区</div>
                <div class="use-city-selector__confirm" onClick={confirm}>
                  确定
                </div>
              </div>

              <ScrollTab current={currentType.value}>
                {types.value.map((item, index) => {
                  return (
                    <ScrollTabItem>
                      <div
                        class={['item', item.active && 'active']}
                        onClick={() => {
                          currentType.value = index
                        }}
                      >
                        {item.label}
                      </div>
                    </ScrollTabItem>
                  )
                })}
              </ScrollTab>
            </div>
            <div class="use-city-selector__content" key={currentType.value}>
              {currentTypeRef.value?.options?.map(item => {
                return (
                  <div
                    class={['item', item.code === cityState.value[currentType.value] && 'active']}
                    onClick={() => {
                      onSelect(item.code)
                    }}
                  >
                    {item.label}
                  </div>
                )
              })}
            </div>
          </div>
        )
      }
    })
  }

  const reset = () => {
    currentType.value = 0
    cityState.value = []
  }

  const set = (code: string) => {
    if (!/^\d{6}$/.test(code)) {
      return void 0
    }
    if (/0000$/.test(code)) {
      cityState.value = [code]
    } else if (/00$/.test(code)) {
      cityState.value = [code.slice(0, 2) + '0000', code]
    } else {
      cityState.value = [code.slice(0, 2) + '0000', code.slice(0, 4) + '00', code]
    }
  }

  return {
    cityState,
    selectCity,
    reset,
    cityPath,
    set
  }
}
