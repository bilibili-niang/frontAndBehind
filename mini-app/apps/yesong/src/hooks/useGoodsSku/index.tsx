import { usePopup, usePreviewImages, useToast } from '@pkg/core'
import { computed, ComputedRef, defineComponent, isRef, PropType, Ref, ref, watch } from 'vue'
import './style.scss'
import { formatPrice } from '@pkg/utils'
import { Image, ScrollView } from '@tarojs/components'
import { restoreSpecs, SkuItem } from './utils'
import { cloneDeep } from 'lodash-es'
import { useGoodsStore } from '../../stores'

export const useGoodsSku = (options: {
  skus: SkuItem[] | Ref<SkuItem[]> | ComputedRef<SkuItem[]>
  selectedSkuId?: string
  count?: number
  minCount?: number
  maxCount?: number
  defaultImage?: string
}) => {
  const skus = computed(() =>
    (isRef(options.skus) ? options.skus.value : options.skus).map(item => {
      return {
        ...item,
        _specs: item.specs.map(i => i.vId),
        image: item.specs[0].image
      }
    })
  )

  const minCount = computed(() => options.minCount ?? 1)
  const maxCount = computed(() => {
    if (options.maxCount && options.maxCount < minCount.value) return minCount.value
    return options.maxCount ?? null
  })

  /** 有货的 sku 列表，符合：最少购买数量 ≤ 库存 */
  const availableSkus = computed(() => {
    return skus.value.filter(item => {
      if (!item.stock) return false
      if (item.stock < minCount.value) return false
      return true
    })
  })

  // console.log(availableSkus.value.map(item => item.specs))

  // console.log(availableSkus.value)

  const specs = computed(() => {
    return restoreSpecs(isRef(options.skus) ? options.skus.value : options.skus)
  })

  // console.log(specs.value)

  const selectedSpces = ref<string[]>([])

  const initSelectedSpces = () => {
    selectedSpces.value = new Array(specs.value.length).fill('')
  }

  /** 默认选择 */
  const defaultSelect = () => {
    const target =
      skus.value.find(item => item.id === options.selectedSkuId) ??
      // TODO 这里同时要判断是否可购买
      [...availableSkus.value].sort((a, b) => b.sort! - a.sort!)[0]
    if (target) {
      selectedSpces.value = [...target._specs]
    }
  }

  watch(
    () => skus.value,
    () => {
      initSelectedSpces()
      defaultSelect()
    },
    { immediate: true }
  )

  const selectSpec = (kId: string, vId: string) => {
    const index = specs.value.findIndex(item => item.id === kId)
    selectedSpces.value[index] = selectedSpces.value[index] === vId ? '' : vId
    resetCount()
  }

  const selectSku = (specs: string[]) => {
    selectedSpces.value = specs
    resetCount()
  }

  /** 可选中的 sku 列表，从当前已选中规格计算得出 */
  const selectableSkus = computed(() => {
    // TODO 可以支持规格联动
    return [...availableSkus.value]
  })

  const matchedSkus = computed(() => {
    const specs = selectedSpces.value.filter(id => id)
    return skus.value.filter(item => {
      return specs.every(id => item._specs.includes(id))
    })
  })

  const stocks = computed(() => {
    return matchedSkus.value.reduce((v, item) => {
      return v + (item.stock ?? 0)
    }, 0)
  })

  const currentImage = computed(() => {
    return specs.value[0]?.children?.find(item => item.id === selectedSpces.value[0])?.image ?? options.defaultImage
  })
  const images = computed(() => {
    return specs.value[0]?.children.map(item => item.image).filter(item => item) ?? []
  })

  const count = ref(options.count! >= 1 ? options.count! : minCount.value ?? 1)
  const resetCount = () => {
    count.value = options.count! >= 1 ? options.count! : minCount.value ?? 1
  }

  const validateSpecs = () => {
    let res = true
    for (let i = 0; i < selectedSpces.value.length; i++) {
      if (!selectedSpces.value[i]) {
        res = false
        useToast(`请选择${specs.value[i].name}`)
        break
      }
    }

    return res
  }

  const onIncrease = () => {
    if (!validateSpecs()) {
      return void 0
    }
    const v = count.value + 1
    if (v > matchedSkus.value[0].stock!) {
      useToast('超出库存范围')
      return void 0
    }
    if (maxCount.value && v > maxCount.value) {
      useToast(`最多购买${maxCount.value}件`)
      return void 0
    }
    count.value = v
  }
  const onDecrease = () => {
    if (!validateSpecs()) {
      return void 0
    }
    const v = count.value - 1
    if (v < minCount.value) {
      useToast(`最少购买${minCount.value}件`)
      return void 0
    }
    count.value = v
  }

  const price = computed(() => {
    const list = matchedSkus.value
      .map(item => item.price)
      .sort((a, b) => a! - b!)
      .filter(i => i)
    if (list.length === 0) return []
    const min = list[0]
    const max = list[list.length - 1]
    if (min === max) return [min]
    return [min, max]
  })

  const listPrice = computed(() => {
    const list = matchedSkus.value
      .map(item => item.underlinePrice)
      .sort((a, b) => a! - b!)
      .filter(i => i)
    if (list.length === 0) return []
    const min = list[0]
    const max = list[list.length - 1]
    if (min === max) return [min]
    return [min, max]
  })

  return {
    skus,
    minCount,
    maxCount,
    availableSkus,
    specs,
    selectedSpces,
    selectableSkus,
    matchedSkus,
    stocks,
    currentImage,
    images,
    count,
    price,
    listPrice,
    resetCount,
    selectSpec,
    selectSku,
    onIncrease,
    onDecrease,
    validateSpecs
  }
}

const SkuModalContent = defineComponent({
  name: 'GoodsSkuModalContent',
  props: {
    skus: { type: Array as PropType<SkuItem[]>, required: true },
    selectedSkuId: {
      type: String
    },
    defaultImage: {
      type: String
    },
    footer: {},
    actions: {
      type: Array as PropType<GoodsSkuModalOptions['actions']>
    },
    onConfirm: {
      type: Function as PropType<GoodsSkuModalOptions['onConfirm']>
    },
    count: {
      type: Number
    },
    minCount: {
      type: Number,
      default: 1
    },
    maxCount: {
      type: Number,
      default: null
    }
  },
  emits: ['change'],
  setup(props, { emit }) {
    const goodsStore = useGoodsStore()

    const {
      skus,
      minCount,
      maxCount,
      availableSkus,
      specs,
      selectedSpces,
      selectSpec,
      selectableSkus,
      matchedSkus,
      stocks,
      currentImage,
      images,
      count,
      price,
      listPrice,
      onIncrease,
      onDecrease,
      validateSpecs
    } = useGoodsSku({
      skus: props.skus,
      selectedSkuId: props.selectedSkuId,
      count: props.count,
      minCount: props.minCount > 1 ? props.minCount : 1,
      maxCount: props.maxCount
    })

    const limitTip = computed(() => {
      if (minCount.value === maxCount.value) return `每单限购${minCount.value}件`
      const list: string[] = []
      if (minCount.value > 1) list.push(`最少购买${minCount.value}件`)
      if (maxCount.value && maxCount.value > 1) list.push(`最多购买${maxCount.value}件`)
      if (list.length === 0) return null
      return `每单${list.join('，')}`
    })

    const previewImage = () => {
      const image = currentImage.value || props.defaultImage
      if (image) {
        usePreviewImages({
          urls: [image]
        })
      }
    }

    const responseData = computed(() => {
      return {
        ...matchedSkus.value[0],
        count: count.value
      }
    })

    return () => {
      return (
        <div class="goods-sku-modal">
          <div class="header">
            <div class="goods-image" onClick={previewImage}>
              {currentImage.value || props.defaultImage ? (
                <Image class="image" mode="aspectFill" src={(currentImage.value || props.defaultImage)!} />
              ) : (
                '暂无图片'
              )}
            </div>
            <div class="goods-info">
              <div class="price-info">
                <div class="current-price number-font">
                  <div class="yen">&yen;</div>
                  <div class="value">{formatPrice(price.value[0]!)}</div>
                  {price.value.length > 1 && <div class="minimum">起</div>}
                </div>
                {/* 价格标签 */}
                {goodsStore.sellingPriceText && <div class="price-tag">{goodsStore.sellingPriceText}</div>}
                {/* <div class="commission">
                  <div class="tag">赚</div>
                  佣金3.5元
                </div> */}
                {listPrice.value[0] > price.value[0] && (
                  <div class="list-price">
                    <div class="line-through">
                      {goodsStore.dashPriceText} &yen;{formatPrice(listPrice.value[0]!)}
                    </div>
                    {/* <div style="opacity:0.4"> ／ </div>
                    <div class="line-through">原价 &yen;????</div> */}
                  </div>
                )}

                {limitTip.value && <div class="limit">{limitTip.value}</div>}
              </div>
            </div>
          </div>
          <div class="content-wrap">
            <ScrollView class="content" scrollY showScrollbar>
              <div class="spec-content">
                {specs.value.map((item, index) => {
                  return (
                    <>
                      <div class="spec-type">{item.name}</div>
                      <div class="spec-list">
                        {item.children.map(spec => {
                          const selectable = selectableSkus.value.find(sku => sku._specs.includes(spec.id))
                          const selected = selectedSpces.value.includes(spec.id)
                          return (
                            <div
                              class={['spec-item', !selectable && 'disabled', selected && 'selected']}
                              onClick={() => {
                                // if (!selectable) {
                                //   return void 0
                                // }
                                selectSpec(item.id, spec.id)
                              }}
                            >
                              {!selectable && <span class="stockout">缺货</span>}
                              {spec.name}
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )
                })}
              </div>
            </ScrollView>
          </div>

          <div class="footer">
            {props.footer}
            <div class="count-info">
              <div class="stock-wrap">
                <div class="label">数量</div>
                <div class="stock">库存：{stocks.value}</div>
                {limitTip.value && <div class="stock-desc">{limitTip.value}</div>}
              </div>
              <div class="steper">
                <div class={['decrease', count.value <= minCount.value && 'disabled']} onClick={onDecrease}>
                  －
                </div>
                <div class="count">{count.value}</div>
                <div
                  class={['increase', maxCount.value && count.value >= maxCount.value && 'disabled']}
                  onClick={onIncrease}
                >
                  ＋
                </div>
              </div>
            </div>
            <div class="actions">
              {stocks.value > 0 ? (
                props.actions?.map(item => {
                  return (
                    <div
                      class={['action-item', item.type]}
                      onClick={() => {
                        if (!validateSpecs()) return void 0
                        item.onClick?.(cloneDeep(responseData.value))
                      }}
                    >
                      {item.text}
                    </div>
                  )
                }) ?? (
                  <div
                    class="action-item"
                    onClick={() => {
                      if (!validateSpecs()) return void 0
                      props.onConfirm?.(cloneDeep(responseData.value))
                    }}
                  >
                    确定
                  </div>
                )
              ) : (
                <div class="action-item disabled">商品无货</div>
              )}
            </div>
          </div>
        </div>
      )
    }
  }
})

type GoodsSkuModalOptions = {
  skus: SkuItem[]
  /** 当前选中的 */
  selectedSkuId?: string
  defaultImage?: string
  count?: number
  minCount?: number
  maxCount?: number
  footer?: any
  actions?: {
    text: string
    type?: 'primary' | 'minor'
    onClick?: (data: any) => void | Promise<any>
  }[]
  onConfirm?: (data: any) => void | Promise<any>
  onChnage?: (data: any) => void
}
const useGoodsSkuModal = (options: GoodsSkuModalOptions) => {
  const { close } = usePopup({
    content: () => <SkuModalContent {...options} />,
    placement: 'bottom'
  })
  return {
    close
  }
}

export default useGoodsSkuModal
