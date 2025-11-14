// 商品的选择器
import './style.scss'
import { ScrollList, ScrollListRefType } from '@anteng/core'
import { defineComponent, ref } from 'vue'
import { $getGoodsBySearchParams, $getGoodsList } from '../../../../api'
import { Image } from '@tarojs/components'

export default defineComponent({
  name: 'GoodsSelector',
  props: {
    select: {
      type: Function,
      default: () => ({})
    },
    keyword: {
      type: String,
      default: ''
    }
  },
  emits: ['change'],
  setup(props, { emit, expose }) {
    const scrollRef = ref<ScrollListRefType>(null)

    const itemRender = (item, index) => {
      return (
        <div
          key={index}
          class="goods-item-layout"
          onClick={() => {
            emit('change', item)
          }}
        >
          <div class="left-image">
            <Image class="image-ele" mode="aspectFill" src={item?.coverImages?.[0]} />
          </div>
          <div class="right-info">
            <div class="goods-title">{item.title}</div>
            <div class="price-layout">
              <div class="rmb-icon">¥</div>
              {item.priceMin}~{item.priceMax}
            </div>
          </div>
        </div>
      )
    }
    expose({
      refreshData: (e?: string) => {
        console.log('props.keyword:----------')
        console.log(props.keyword)
        scrollRef.value?.refreshData()
      }
    })

    {
      /* 有搜索参数调用搜索接口,没有搜索参数,调用分页接口 */
    }
    return () => {
      return (
        <ScrollList
          height="70vh"
          ref={scrollRef}
          request={props.keyword ? $getGoodsBySearchParams : $getGoodsList}
          pars={{
            keyword: props.keyword
          }}
          class="goods-selector"
        >
          {itemRender}
        </ScrollList>
      )
    }
  }
})
