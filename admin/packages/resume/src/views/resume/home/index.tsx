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
      $resumeList({ size: 9999 } as any)
        .then(res => {
          if ((res as any).success) {
            dataList.value = (res as any).data.records
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
              {dataList.value?.length ? dataList.value.map(p => <ResumeCard data={p} />) : <ResumeCard empty={true} />}
            </TabPane>
          </Tabs>
        </div>
      </div>
    )
  }
})