import { defineComponent, computed, PropType } from 'vue'
import './style.scss'
import { withUnit } from '@anteng/utils'
import { multiLineGoodsType } from '../index'
import Taro from '@tarojs/taro'

export default defineComponent({
  name: 'GoodsItem',
  props: {
    item: {
      type: Object
    },
    // 用来计算当前一行有多少个item,判断宽度
    total: {
      type: Number,
      default: 4
    },
    config: {
      type: Object as PropType<multiLineGoodsType>
    }
  },
  setup(props) {
    const { item, total } = props
    const componentStyle = computed(() => {
      return {
        width: (1 / Number(total)) * 100 - 2 + '%'
      }
    })

    const priceTextStyle = computed(() => {
      const { priceHeaderSize = '12' } = props.config
      return {
        fontSize: withUnit(priceHeaderSize)
      }
    })

    const priceStyle = computed(() => {
      const { priceSize = '10' } = props.config
      return {
        fontSize: withUnit(priceSize)
      }
    })
    const toGoods = () => {
      Taro.navigateTo({
        url: `/packageA/goods/detail/index?gid=${item.id}`
      })
    }

    return () => {
      return (
        <div class="multi-line-goods-item" style={componentStyle.value} onClick={toGoods}>
          <div class="item-image">
            <img src={item?.image} alt={item?.title} />
          </div>
          <div class="text-container">
            <div class="m-l-item-title" style={priceTextStyle.value}>
              {item?.title}
            </div>
            <div class="price" style={priceStyle.value}>
              ¥ {item?.priceMin}
            </div>
          </div>
        </div>
      )
    }
  }
})
