import { computed, ref, watch } from 'vue'
import useModal from '../useModal'
import './style.scss'
import { $getIndustry } from '../../api'
import { useLoading, useLoadingEnd } from '../useLoading'
import useResponseMessage from '../useResponseMessage'
import { Icon, ScrollTab, ScrollTabItem } from '@pkg/ui'
import EmptyStatus, { EmptyAction } from '../../components/empty-status'
import useToast from '../useToast'

type Node = {
  code: string
  name: string
  children?: Node[]
  unlimited?: boolean
}

const trees = ref<Node[]>([])
const hasError = ref(false)
const hasLoaded = ref(false)
const fetchTrees = () => {
  useLoading()
  $getIndustry()
    .then(res => {
      trees.value = res as Node[]
      hasError.value = false
      hasLoaded.value = true
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

export const useIndustrySelector = (options?: { unlimited?: boolean }) => {
  fetchTrees()

  const ALLOW_UNLIMITED = options?.unlimited === true

  const state = ref<(string | null)[]>([])

  const path = computed(() => {
    let scope = trees.value
    return state.value
      .map(code => {
        const t = scope?.find(item => item.code === code)
        scope = t?.children!
        return t
      })
      .filter(i => i)
  })

  const lastIndustry = computed(() => {
    return path.value[path.value.length - 1]
  })

  const currentType = ref(Math.max(state.value.length - 1, 0))

  watch(
    () => state.value,
    () => {
      currentType.value = Math.max(state.value.length - 1, 0)
    }
  )

  const typesLabelMap = []
  const types = computed(() => {
    if (!trees.value) return []
    let scopes = trees.value?.slice(0)
    let parent: any
    const list = [...state.value, undefined]
      .map((code, index, arr) => {
        if (!(scopes?.length > 0)) return undefined
        const target = scopes.find(item => item.code === code)
        const obj = {
          code,
          name: target?.name || `请选择${typesLabelMap[index] || ''}`,
          active: currentType.value === index,
          options: scopes?.slice(0) || []
        }

        if (ALLOW_UNLIMITED && parent && obj.options.length > 0) {
          obj.options.unshift({
            unlimited: true,
            code: parent.code,
            // label: '不限',
            // value: '不限',
            name: `不限（全${parent.name}）`,
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

  let tempState = [...state.value]

  const select = (callback: (v: string[]) => void) => {
    tempState = [...state.value]

    const onSelect = (code: string) => {
      // 截取这个值之前的类型（因为可能返回之前的某一步选择，那么后面的数据就应该删除）
      const v = state.value.slice(0, currentType.value)
      // 追加当前值
      state.value = [...v, code]

      // console.log(v,  state.value)

      setTimeout(() => {
        // 如果还有下一级
        if (types.value[currentType.value + 1]) {
          currentType.value++
          if (ALLOW_UNLIMITED) {
            // 自动选择 "不限"
            state.value.push(code)
          } else {
            state.value.push(null)
          }
        } else {
          confirm()
        }
      }, 300)
    }

    const confirm = () => {
      if (!state.value[state.value.length - 1]) {
        useToast('请选择完整信息')
        return void 0
      }
      modal.close()
      callback(state.value as string[])
    }

    modal = useModal({
      title: undefined,
      padding: 0,
      backgroundColor: '#fff',
      closeable: false,
      onClose: () => {
        if (!state.value[state.value.length - 1]) {
          useToast('请选择完整信息')
          state.value = [...tempState]
          console.log(tempState)
        }
      },
      content: () => {
        if (hasError.value) {
          return (
            <EmptyStatus
              actions={() => {
                // @ts-ignore
                return <EmptyAction onClick={fetchTrees}>重试</EmptyAction>
              }}
            />
          )
        }
        return (
          <div class="use-industry-selector">
            <div class="use-industry-selector__header">
              <div class="use-industry-selector__title">
                <div class="use-industry-selector__reset" onClick={reset}>
                  重置
                </div>
                <div class="text">选择行业</div>
                <div class="use-industry-selector__confirm" onClick={confirm}>
                  确定
                </div>
              </div>

              <ScrollTab current={currentType.value}>
                <div class="use-industry-selector__tabs">
                  {types.value.map((item, index, arr) => {
                    return (
                      <>
                        <ScrollTabItem>
                          <div
                            class={['item', item.active && 'active']}
                            onClick={() => {
                              currentType.value = index
                            }}
                          >
                            {item.name}
                          </div>
                        </ScrollTabItem>
                        {index < arr.length - 1 && <Icon name="right" />}
                      </>
                    )
                  })}
                </div>
              </ScrollTab>
            </div>
            <div class="use-industry-selector__content" key={currentType.value}>
              {currentTypeRef.value?.options?.map(item => {
                return (
                  <div
                    class={['item', item.code === state.value[currentType.value] && 'active']}
                    onClick={() => {
                      onSelect(item.code)
                    }}
                  >
                    <div class="code">{item.code}.</div>
                    {item.name}
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
    state.value = []
  }

  const setState = (code: string) => {
    if (!hasLoaded.value) {
      watch(
        () => hasLoaded.value,
        () => {
          hasLoaded.value && setState(code)
        },
        { once: true }
      )
      return void 0
    }
    const list: string[] = []
    for (let i = 2; i <= code.length; i++) {
      list.push(code.slice(0, i))
    }
    const prefix = trees.value.find(item => item.children?.find(child => child.code === list[0]))?.code
    state.value = [prefix!, ...list]
  }

  return {
    state,
    select,
    reset,
    path,
    lastIndustry,
    setState
  }
}
