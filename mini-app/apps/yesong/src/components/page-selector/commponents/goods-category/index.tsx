// 商品分类列表,作为选择器使用
import './style.scss'
import { defineComponent, ref } from 'vue'
import { requestGetGoodsCategories } from '../../../../api/goods/category'
import { Image } from '@tarojs/components'

export default defineComponent({
  name: 'GoodsCategory',
  props: {},
  emits: ['change'],
  setup(props, { emit }) {
    const dataList = ref([])
    const init = () => {
      requestGetGoodsCategories().then(res => {
        if (res.success) {
          dataList.value = res.data
        }
      })
    }

    init()

    return () => {
      return (
        <div class="goods-category">
          {dataList.value.map(it => {
            return (
              <div class="categories-item">
                <div
                  class="fa-content"
                  onClick={() => {
                    emit('change', {
                      faId: it.id,
                      title: it.name
                    })
                  }}
                >
                  <div class="fa-item-image">
                    <Image class="image-item" src={it.icon} mode="aspectFill" />
                  </div>
                  {it.name}
                </div>
                <div class="children-content">
                  {it.childCategories?.map(item => {
                    return (
                      <div
                        class="children-item"
                        onClick={() => {
                          emit('change', {
                            faId: it.id,
                            id: item.id,
                            title: item.name
                          })
                        }}
                      >
                        <div class="children-item-image">
                          <Image class="image-item" src={item.icon} mode="aspectFill" />
                        </div>
                        {item.name}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )
    }
  }
})
