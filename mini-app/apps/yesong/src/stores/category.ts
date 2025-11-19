import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { IGoodsCategory, requestGetGoodsCategories } from '../api/goods/category'

const useCategoryStore = defineStore('category', () => {
  const categoryData = shallowRef<IGoodsCategory[] | null>(null)
  const isLoading = ref(false)
  const getCategoryData = () => {
    isLoading.value = true
    requestGetGoodsCategories()
      .then(res => {
        if (res.code === 200) {
          categoryData.value = res.data
        } else {
          // 错误处理
        }
      })
      .catch(() => {
        // 错误处理
      })
      .finally(() => {
        isLoading.value = false
      })
  }

  return {
    categoryData,
    isLoading,
    loadCategoryData: getCategoryData
  }
})

export default useCategoryStore
