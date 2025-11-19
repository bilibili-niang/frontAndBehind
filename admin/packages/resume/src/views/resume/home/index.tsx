import './index.scss'
import { defineComponent, ref } from 'vue'
import { Button, Tabs, TabPane, TestFloat } from '@anteng/ui'
import { $resumeList } from '@anteng/core'
import { useRequestErrorMessage } from '@anteng/core'
import ResumeCard from './components/resumeCard'

export default defineComponent({
  setup() {
    const dataList = ref<any[]>([])
    const init = () => {
      $resumeList({ size: 9999, current: 1 } as any)
        .then((res: any) => {
          if (res?.success) {
            dataList.value = Array.isArray(res?.data?.rows) ? res.data.rows : []
          }
        })
        .catch(useRequestErrorMessage)
    }

    init()

    return () => (
      <div class="resume-home-page">
        <TestFloat label="测试请求">
          <div>
            <Button onClick={() => init()}>init</Button>
          </div>
        </TestFloat>
        <div class="tabs-container p-3">
          <Tabs>
            <TabPane key={1} tab={'我的简历'}>
              <ResumeCard empty={true} />
              {dataList.value.map((p: any) => <ResumeCard data={p} />)}
            </TabPane>
          </Tabs>
        </div>
      </div>
    )
  }
})