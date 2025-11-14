import { useToast } from '@anteng/core'
import { Search } from '@anteng/ui'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Dokit',
  setup() {
    const onSearch = (text: string) => {
      useToast(text)
    }
    return () => {
      return (
        <div>
          <Search placeholder="搜索你感兴趣的商品" onSearch={onSearch} />
          <Search placeholder="搜索你感兴趣的商品" onSearch={onSearch} keywords={'小米手机'} />
          <Search
            placeholder="搜索你感兴趣的商品"
            onSearch={onSearch}
            keywords={['办公用品', '小米手机', '三得利乌龙茶']}
          />
        </div>
      )
    }
  }
})
