import { defineComponent, onMounted, ref } from 'vue'
import { Button, Input, List, ListItem, ListItemSubtitle, ListItemTitle, vuetify, notifySuccess, notifyError } from '@pkg/ui'
import { copyText } from '@/utils/copy'
import { jumpBack } from '@/router/jump'
import { $transform } from '@/api'

// 添加一个辅助函数来转换字符串到驼峰格式
function toCamelCase(str: string) {
  return str
    .split(' ')
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase()
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join('')
}

// 封装浏览器数据库的读写方法
const localStorageKey = 'translationHistory'

function saveToLocalStorage(newRecord: any) {
  let history = readFromLocalStorage()
  if (!history) {
    history = []
  }

  // 去重：如果新记录的关键字已存在，则移除旧记录
  history = history.filter(record => record.query !== newRecord.query)

  // 添加新记录到数组开头
  history.unshift(newRecord)
  localStorage.setItem(localStorageKey, JSON.stringify(history))
}

function readFromLocalStorage(): any[] | null {
  const data = localStorage.getItem(localStorageKey)
  return data ? JSON.parse(data) : null
}

export default defineComponent({
  name: 'componentName',
  props: {},
  emits: [''],
  setup(props, { emit }) {

    const query = ref('局部变量')
    const data = ref([] as string[])
    const history = ref([] as any[])
    const isLoading = ref(false)
    // 已改为使用全局通知：notifySuccess/notifyError

    const handleCopy = async (text: string) => {
      const ok = await copyText(text)
      if (ok) notifySuccess('已复制到剪贴板')
      else notifyError('复制失败，请手动复制')
    }

    console.log('vuetify')
    console.log(vuetify)
    // vuetify.useTheme()


    // 不要在组件内重复创建 vuetify 实例，已在全局启用暗色


    // 从 localStorage 读取所有查询记录并在页面加载时回显
    onMounted(() => {
      init()
    })

    const init = () => {

      const savedHistory = readFromLocalStorage()
      if (savedHistory) {
        history.value = savedHistory
        if (savedHistory.length > 0) {
          const lastRecord = savedHistory[savedHistory.length - 1]
          query.value = lastRecord.query
          data.value = lastRecord.translation
        }
      }
    }

    const handleQuery = () => {
      if (query.value) {
        isLoading.value = true
        $transform({
          keyword: query.value
        })
          .then(res => {
            if (res.success && res.data && Array.isArray(res.data.translation)) {
              // 使用toCamelCase函数处理每个翻译结果
              const translation = res.data.translation.map((item: string) => toCamelCase(item))
              data.value = translation

              // 保存查询结果到 localStorage
              saveToLocalStorage({
                query: query.value,
                translation: translation
              })

              // 更新历史记录
              history.value = readFromLocalStorage() || []

              console.log('data.value:')
              console.log(data.value)
            } else {
              console.error('Invalid response from API:', res)
            }
          })
          .catch(err => {
            console.error('Error in translation:', err)
            notifyError('查询失败')
          })
          .finally(() => {
            isLoading.value = false
          })
      }
    }

    // TSX: Vuetify Button 的 TS 类型未暴露 onClick，这里用 any 规避类型错误
    const UButton = Button as any

    return () => {
      return (
        <div class="flex">
          <div class="flex w-75 mr-auto ml-auto p-3 flex-col">
            <div class="flex flex-row items-center mt-3 mb-3">
              <UButton
                class="mr-2"
                variant="outlined"
                onClick={() => {
                  jumpBack()
                }}
              >
                back
              </UButton>

              <Input
                class="mr-3 ml-3"
                v-model={query.value}
                label={'请输入中/英文'}
              >
              </Input>
              <UButton
                variant="outlined"
                onClick={handleQuery}
              >
                查询
              </UButton>
            </div>

            <div class="flex flex-col">
              {data.value.map(p => (
                <div class="">{p}</div>
              ))}
              {isLoading.value && (
                <div>
                  加载中...
                </div>
              )}
            </div>
            {history.value?.length > 0 && (
              <div class="mt-4 p-3 rounded-lg elevation-2 border border-[var(--ui-border-color)] bg-[var(--ui-bg)] text-[var(--color-text-base)]">
                <div class="flex-row flex justify-between !p-3">
                  <h3 class="text-h6 mb-2 ">历史查询记录</h3>
                  <UButton
                    onClick={() => {
                      localStorage.removeItem(localStorageKey)
                      setTimeout(init, 500)
                    }}
                  >
                    清除一下
                  </UButton>
                </div>
                <List>
                  {history.value.map((record, index) => (
                    <ListItem
                      key={index}
                      class="mb-2 cursor-pointer hover:bg-[var(--ui-bg-hover)] rounded"
                      onClick={() => handleCopy(record.translation.join(', '))}
                    >
                      <ListItemTitle class="cursor-pointer">{record.query}</ListItemTitle>
                      <ListItemSubtitle>{record.translation.join(', ')}</ListItemSubtitle>
                    </ListItem>
                  ))}
                </List>
              </div>
            )}

          </div>
          {/* 已改为全局通知，无需内嵌 VSnackbar */}
        </div>
      )
    }
  }
})
