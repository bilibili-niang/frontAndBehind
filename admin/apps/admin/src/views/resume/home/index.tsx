import './index.scss'
import { defineComponent, ref } from 'vue'
import { RouteMeta } from '@/router/routeMeta'
import { Button, Tabs, TabPane, TestFloat } from '@anteng/ui'
import { $resumeList } from '@/api/resume'
import type { RequestPagination } from '@/api/request'
import { useRequestErrorMessage } from '@anteng/core'
import ResumeCard from './components/resumeCard'

export default defineComponent({
  props: {},
  emits: [''],
  setup(props, { emit }) {
    // 简历列表
    const dataList = ref([])
    const init = () => {
      $resumeList({
        size: 9999
      } as RequestPagination)
        .then(res => {
          console.log(res)
          if (res.success) {
            dataList.value = res.data.records
          }
        })
        .catch(useRequestErrorMessage)
    }

    init()

    return () => {
      return (
        <div class="resume-home-page">


          {/* 测试环境浮动工具，包含测试请求按钮 */}
          <TestFloat label="测试请求">
            <div>
              <Button
                onClick={() => {
                  init()
                }}>
                init
              </Button>
            </div>
          </TestFloat>
          <div class="tabs-container p-3">

            <Tabs>
              <TabPane
                key={1}
                tab={'我的简历'}
              >
                {dataList.value.map(ResumeCard)}
              </TabPane>
            </Tabs>
          </div>

        </div>
      )
    }
  }
})
export const routeMeta: RouteMeta = {
  title: '简历首页',
  purePage: true,
  order: 2,
  keepAlive: true
}
