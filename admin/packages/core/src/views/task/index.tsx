import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import './style.scss'
import { Button, Empty, Icon, Pagination, Spin, Tag } from '@pkg/ui'
import Dayjs from 'dayjs'
import { getBackgroundTasks } from '../../api/task'
import { useRequestErrorMessage } from '../../hooks/useRequestErrorMessage'
import emitter from '../../utils/emitter'
import SpinVue from '../../components/spin'

const TASK_STATUS_ERROR = -1
const TASK_STATUS_PENDING = 0
const TASK_STATUS_SUCCESS = 1
const TASK_STATUS_RUNNING = 2

interface downloadObjType {
  download?: string
  exception?: string
}

interface ITaskRecord {
  completedTime: string
  createTime: string
  executeTime: string
  id: string
  result: downloadObjType | { result?: string }
  status: number
  taskName: string
  updateTime: string
}

export default defineComponent({
  name: 'BackgroundTask',
  setup() {
    const data = ref<ITaskRecord[]>([])
    const hasError = ref(false)
    const loading = ref(false)
    const scrollerRef = ref<HTMLElement>()
    const pagination = reactive({
      size: 10,
      current: 1,
      total: 0
    })

    const onPaginationChange = (page: number, size: number) => {
      pagination.current = page
      pagination.size = size
      fetchData()
    }

    const fetchData = () => {
      loading.value = true
      getBackgroundTasks({
        current: pagination.current,
        size: pagination.size
      })
        .then((res: any) => {
          if (res.code === 200) {
            data.value = res.data.records
            emitter.emit('setTaskCount', res.data.total)
            pagination.total = res.data.total
            pagination.size = res.data.size
            pagination.current = res.data.current
            if (scrollerRef.value) {
              scrollerRef.value!.scrollTop = 0
            }
          } else {
            hasError.value = true
            useRequestErrorMessage(res)
          }
        })
        .catch((err) => {
          hasError.value = true
          useRequestErrorMessage(err)
        })
        .finally(() => {
          loading.value = false
        })
    }

    onMounted(() => {
      fetchData()
    })

    const list = computed(() => {
      const result: {
        date: string
        list: ITaskRecord[]
      }[] = []
      data.value.forEach((item) => {
        const d = Dayjs(item.createTime).format('YYYY年 MM月 DD日')
        const t = result.find((item) => item.date === d)
        if (t) {
          t.list.push(item)
        } else {
          result.push({
            date: d,
            list: [item]
          })
        }
      })
      return result.sort((a, b) => {
        return Dayjs(a.date).isBefore(Dayjs(b.date)) ? -1 : 1
      })
    })

    const StatusTag = (status: number) => {
      switch (status) {
        case TASK_STATUS_SUCCESS:
          return <Tag color="success">执行成功</Tag>
        case TASK_STATUS_ERROR:
          return <Tag color="error">执行失败</Tag>
        case TASK_STATUS_PENDING:
          return <Tag color="warning">等待执行</Tag>
        case TASK_STATUS_RUNNING:
          return <Tag color="processing">执行中</Tag>
        default:
          return null
      }
    }

    const StatusClass = (status: number) => {
      switch (status) {
        case TASK_STATUS_SUCCESS:
          return 'success'
        case TASK_STATUS_ERROR:
          return 'error'
        case TASK_STATUS_PENDING:
          return 'pending'
        case TASK_STATUS_RUNNING:
          return 'running'
        default:
          return null
      }
    }

    return () => {
      return (
        <div class="background-task-modal">
          <Spin indicator={<SpinVue />} spinning={loading.value}>
            <div class="background-task ui-scrollbar" ref={scrollerRef}>
              {list.value.map((group) => {
                return (
                  <div class="task-group">
                    <h3 class="task-date">{group.date}</h3>
                    {group.list.map((item) => {
                      // const isSuccess = item.status === TASK_STATUS_SUCCESS
                      // const isPending = item.status === TASK_STATUS_PENDING
                      // const isError = item.status === TASK_STATUS_ERROR
                      // const isRunning = item.status === TASK_STATUS_RUNNING
                      return (
                        <div class="task-item">
                          <div class="task-item__title">
                            <div class="tag-title-row">
                              <h4>{item.taskName}</h4>
                              <div class="tag-limted">{StatusTag(item.status)}</div>
                            </div>

                            {item.result && item.result?.result && (
                              <div class="resultDownload">
                                有部分数据导入失败,请查看:
                                <a class="task-item__link clickable" href={item.result.result} target="_blank">
                                  <Icon name="click"></Icon>点击下载附件
                                </a>
                              </div>
                            )}

                            {item.result?.download && (
                              <a class="task-item__link clickable" href={item.result.download} target="_blank">
                                <Icon name="click"></Icon>点击下载附件
                              </a>
                            )}
                          </div>
                          <div class={['task-item__progress', StatusClass(item.status)]}>
                            <div class="task-item__progress-bar"></div>
                          </div>
                          {item.result?.exception && <div class="task-item__msg">{item.result.exception}</div>}
                          <div class="task-item__date">
                            创建于：{item.createTime} {item.updateTime && `丨 更新于：${item.updateTime}`}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
              {list.value.length === 0 && <Empty style="margin-top: 120px;" />}
            </div>
          </Spin>
          <div class="background-task__pagination">
            <Pagination
              current={pagination.current}
              pageSize={pagination.size}
              total={pagination.total}
              onChange={onPaginationChange}
              showLessItems
              showQuickJumper
              showSizeChanger
            />
            <Button style="margin-left: 16px;" type="primary" onClick={fetchData}>
              刷新
            </Button>
          </div>
        </div>
      )
    }
  }
})
