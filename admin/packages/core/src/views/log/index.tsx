import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { useSearchTable } from '../../components/search-table'
import { $getOperateLogFilterOptions, $getOperateLogList, type OperateLogFilterItem } from '../../api/log'
import { Cascader, Descriptions, DescriptionsItem, Icon, JsonView, Popover, Tooltip } from '@pkg/ui'
import useAppStore from '../../stores/app'
import { SCENE_CENTER, SCENE_OPTIONS } from '@pkg/config'
import { OperateLogSourceOptions, OperateLogStatus, OperateLogStatusOptions, OperateLogTypeOptions } from './type'
import useBasicLayoutStore from '../../stores/basic-layout'
import './style.scss'
import { safeParse } from '@pkg/utils'
import useModal from '../../hooks/useModal'
import { parse } from 'lossless-json'

export const OperateLog = defineComponent({
  name: 'OperateLog',
  setup() {
    const scene = computed(() => {
      const s = useAppStore().scene
      return s === SCENE_CENTER ? undefined : s
    })

    const basicLayoutStore = useBasicLayoutStore()

    const sceneMap = computed(() => {
      return basicLayoutStore.headerMenus.reduce((acc, curr) => {
        if (!curr?.value) return acc
        acc[curr?.value] = curr?.customName ?? curr?.title
        return acc
      }, {})
    })

    const { Table } = useSearchTable({
      title: '操作日志',
      customRequest(params) {
        return $getOperateLogList({ scene: scene.value, ...params })
      },
      filter: {
        format: (rawParams) => {
          const { scene, ...rest } = rawParams
          return { ...rest, ...scene }
        },
        list: [
          {
            key: 'scene',
            label: '操作场景',
            widget: (props) => <Filter {...props} scene={scene.value}/>,
            withWrap: true,
            flex: 10,
            fixed: true,
            minWidth: 300,
            maxWidth: 450
          },
          {
            key: 'startTime',
            label: '操作时间',
            type: 'range-picker',
            flex: 7,
            fixed: true,
            minWidth: 300,
            maxWidth: 400
          },
          {
            key: 'status',
            label: '操作状态',
            type: 'select',
            config: { options: OperateLogStatusOptions },
            flex: 4,
            minWidth: 200,
            maxWidth: 250,
            fixed: true
          },
          {
            key: 'operateType',
            label: '操作类型',
            type: 'select',
            config: {
              options: OperateLogTypeOptions
            },
            flex: 4,
            minWidth: 150,
            maxWidth: 200
          },
          {
            key: 'source',
            label: '操作来源',
            type: 'select',
            config: { options: OperateLogSourceOptions },
            flex: 4,
            minWidth: 200,
            maxWidth: 250
          },
          {
            key: 'objectId',
            label: '唯一标识',
            type: 'input',
            flex: 4,
            minWidth: 200,
            maxWidth: 250
          },
          {
            key: 'oldParam',
            label: '原对象',
            type: 'input',
            flex: 4,
            minWidth: 200,
            maxWidth: 250
          },
          {
            key: 'userName',
            label: '操作用户',
            type: 'input',
            flex: 4,
            minWidth: 200,
            maxWidth: 250
          },
          {
            key: 'userMobile',
            label: '用户手机号',
            type: 'input',
            flex: 4,
            minWidth: 200,
            maxWidth: 250
          },
          {
            key: 'remark',
            label: '备注',
            type: 'input',
            flex: 4,
            minWidth: 200,
            maxWidth: 250
          }
        ]
      },
      defaultDescs: 'start_time',
      table: {
        columns: [
          {
            dataIndex: 'scene',
            title: '应用场景',
            width: 120,
            hidden: !!scene.value,
            customRender: ({ text }) => {
              const s = sceneMap.value[text] ?? SCENE_OPTIONS.find((item) => item.value === text)?.label ?? text
              if (!s) return null
              return <span class="user-scene">{s}</span>
            }
          },
          {
            dataIndex: 'module',
            title: '模块',
            width: 200
          },
          {
            dataIndex: 'action',
            title: '行为',
            width: 200,
            customRender: ({ record, text }) => {
              const type = OperateLogTypeOptions.find((item) => item.value === record.operateType)
              return (
                <div style="margin-left: -4px;">
                  <small
                    class="operate-log-type"
                    style={{
                      '--color': type?.color
                    }}
                  >
                    {type?.label}
                  </small>
                  {text}
                </div>
              )
            }
          },
          {
            dataIndex: 'status',
            title: '操作状态',
            width: 110,
            customRender: ({ text, record }) => {
              if (text === OperateLogStatus.Success)
                return (
                  <a class="cursor-default color-success">
                    <Icon name="ok-bold"/>
                    &nbsp;成功
                  </a>
                )
              if (text === OperateLogStatus.Fail)
                return (
                  <Tooltip
                    title={
                      <div>
                        <div style="opacity: 0.6">失败原因</div>
                        <div>{record.failReason ?? '-'}</div>
                      </div>
                    }
                  >
                    <a class="color-error">失败原因 ？</a>
                  </Tooltip>
                )
              return null
            }
          },
          { dataIndex: 'oldValue', width: 200, title: '旧值' },
          { dataIndex: 'newValue', width: 200, title: '新值' },
          {
            dataIndex: 'objectId',
            title: '唯一标识',
            width: 210
          },
          {
            dataIndex: 'oldParam',
            title: '原对象',
            width: 90,
            align: 'center',
            customRender: ({ text }) => {
              return (
                <a
                  onClick={() => {
                    showOldParam(text)
                  }}
                >
                  查看
                </a>
              )
            }
          },
          {
            dataIndex: 'remark',
            title: '备注',
            width: 250
          },
          {
            title: '操作用户',
            width: 150,
            customRender: ({ record }) => {
              const showPhone = record.userName != record.userMobile
              return (
                <div>
                  <div>{record.userName}</div>
                  {showPhone && <div>{record.userMobile}</div>}
                </div>
              )
            }
          },
          {
            dataIndex: 'source',
            title: '操作来源',
            width: 110,
            customRender: ({ text }) => {
              return OperateLogSourceOptions.find((item) => item.value === text)?.label ?? text
            }
          },
          {
            dataIndex: 'location',
            title: '操作地址',
            width: 300,
            customRender: ({ text, record }) => {
              return (
                <div style="margin:-10px 0 -12px 0;">
                  <div>{text?.split('|').join('丨')}</div>
                  <div class="color-disabled">{record.ip}</div>
                </div>
              )
            }
          },
          // {
          //   dataIndex: 'userAgent',
          //   title: '操作环境',
          //   width: 150,
          //   customRender: ({ text }) => {
          //     return text?.split('|').join('丨')
          //   }
          // },
          {
            dataIndex: 'device',
            title: '设备',
            width: 90,
            align: 'center',
            customRender: ({ text, record }) => {
              return (
                <Popover
                  trigger="click"
                  content={
                    <div>
                      <Descriptions bordered column={1} labelStyle={{ width: '120px' }}>
                        <DescriptionsItem label="设备">{text}</DescriptionsItem>
                        <DescriptionsItem label="IP">{record.ip}</DescriptionsItem>
                        <DescriptionsItem label="操作系统">{record.platform}</DescriptionsItem>
                        <DescriptionsItem label="Referer">{record.referer}</DescriptionsItem>
                        <DescriptionsItem label="用户代理">{record.userAgent}</DescriptionsItem>
                      </Descriptions>
                    </div>
                  }
                >
                  <a>查看</a>
                </Popover>
              )
            }
          },
          {
            dataIndex: 'endTime',
            title: '操作结束时间',
            width: 200
          },
          {
            dataIndex: 'start_time',
            title: '操作时间',
            width: 200,
            fixed: 'right',
            sorter: true,
            customRender: ({ record, text }) => {
              return text ?? record.startTime
            }
          }
        ]
      }
    })

    return () => {
      return <div class="p_operate-log">{Table}</div>
    }
  }
})

export default OperateLog

const Filter = defineComponent({
  props: {
    scene: String,
    value: Object
  },
  emits: {
    change: (value: Record<string, any>) => true
  },
  setup(props, { emit }) {
    const getOptions = () => {
      $getOperateLogFilterOptions().then((res) => {
        rawOptions.value = res.data
      })
    }

    const rawOptions = ref<OperateLogFilterItem[]>([])
    const options = computed(() => {
      if (props.scene) {
        return rawOptions.value.find((item) => item.value === props.scene)?.children
      }
      return rawOptions.value
    })

    onMounted(() => {
      getOptions()
    })

    const state = ref<string[]>(Object.values(props.value ?? {}) ?? [])

    const onChange = (value: any[]) => {
      state.value = value
      emit('change', params.value)
    }

    watch(
      () => props.value,
      (v) => {
        state.value = Object.values(v ?? {}) ?? []
      }
    )

    const params = computed(() => {
      let _options = options.value
      return (
        state.value?.reduce(
          (res, item) => {
            const target = _options?.find((i) => i.value === item)
            if (target) {
              res[target?.key] = item
              _options = target?.children ?? []
            }
            return res
          },
          {} as Record<string, any>
        ) ?? {}
      )
    })

    return () => {
      return (
        <div class="p_operate-log-filter" style="flex:1;overflow:hidden;">
          <Cascader
            allowClear
            changeOnSelect
            showCheckedStrategy={Cascader.SHOW_CHILD}
            options={options.value}
            onChange={onChange}
            value={state.value}
          ></Cascader>
        </div>
      )
    }
  }
})

const showOldParam = (text: string) => {
  useModal({
    title: '原对象',
    content: (
      <div class="p_operate-log__old-param-modal">
        <JsonView defaultUnfold data={safeParse(parse(text, undefined, (v) => String(v)))}/>
      </div>
    )
  })
}
