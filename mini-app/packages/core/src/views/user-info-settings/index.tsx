import { computed, defineComponent, onMounted, reactive, ref, toRaw } from 'vue'
import './style.scss'
import { $getUserProfileSettings, $initUserProfileSettings, $updateUserProfileSettings } from '../../api/user-profile'
import { SchemaForm, type Schema } from '@anteng/jsf'
import { Icon, JsonView, message, Switch, Table, Tooltip } from '@anteng/ui'
import { initialUserProfileConfig, useProfileFieldsMap } from './fields'
import { renderAnyNode } from '@anteng/utils'
import useSchemaFormModal from '../../hooks/useSchemaFormModal'
import { cloneDeep } from 'lodash'
import { useResponseMessage } from '../../hooks/useRequestErrorMessage'

export default defineComponent({
  name: 'UserInfoSettings',
  setup() {
    const rawConfig = ref()

    const getConfig = () => {
      $getUserProfileSettings()
        .then((res) => {
          if (!res.data) {
            initConfig()
            return void 0
          }

          rawConfig.value = res.data

          state.status = res.data.status

          setContent(res.data.content || [])
        })
        .catch((err) => {
          initConfig()
        })
    }

    const initialized = ref(false)
    const initConfig = () => {
      if (initialized.value) {
        return void 0
      }
      initialized.value = true
      $initUserProfileSettings(initialUserProfileConfig).finally(() => {
        getConfig()
      })
    }

    onMounted(() => {
      getConfig()
    })

    const state = reactive({
      status: 0 as number,
      content: cloneDeep(initialUserProfileConfig) as any[]
    })

    const setContent = (list: any[]) => {
      list.forEach((item) => {
        const target = state.content.find((i) => i.key === item.key)
        if (target) {
          Object.assign(target, item)
        }
      })

      state.content.sort((a, b) => b.sort - a.sort)
      console.log(state.content)
    }

    const triggerChange = () => {
      const endLoading = message.loading('设置更新中...')
      $updateUserProfileSettings(rawConfig.value.id, cloneDeep(toRaw(state)))
        .then(useResponseMessage)
        .catch((err) => useResponseMessage(err))
        .finally(() => {
          endLoading()
          getConfig()
        })
    }

    const onItemChange = (record: any, value: any) => {
      Object.assign(record, value)
      triggerChange()
    }

    const columns: any = [
      {
        title: '字段',
        width: 150,
        customRender: ({ record }: any) => {
          if (!record) return null
          return (
            <div>
              <div>{record.name}</div>
              <small class="color-disabled">{record.key}</small>
            </div>
          )
        }
      },
      {
        title: '字段说明',
        width: 400,
        customRender: ({ record }: any) => {
          const desc = (useProfileFieldsMap as any)[record.key]?.desc
          return <div class="user-info-settings-page__table-desc">{renderAnyNode(desc) || ''}</div>
        }
      },
      {
        title: '是否必填',
        width: 120,
        align: 'center',
        customRender: ({ record }: any) => {
          return (
            <div>
              {record.required === 1 ? (
                <Icon class="color-success" name="ok-bold" />
              ) : (
                <Icon style="opacity: 0.6" class="color-disabled" name="error-bold" />
              )}
            </div>
          )
        }
      },
      {
        title: (
          <Tooltip title="数值越大排序位置越靠前">
            <div>
              排序 &nbsp;
              <Icon name="helper-fill" />
            </div>
          </Tooltip>
        ),
        width: 90,
        align: 'center',
        customRender: ({ record }: any) => {
          return <div>{record.sort}</div>
        }
      },
      {
        title: '启用',
        width: 80,
        align: 'center',
        customRender: ({ record }: any) => {
          return (
            <Switch
              size="small"
              checked={record.status === 1}
              onClick={() => {
                onItemChange(record, { status: record.status === 1 ? 0 : 1 })
              }}
            />
          )
        }
      },
      {
        title: '操作',
        width: 80,
        align: 'center',
        customRender: ({ record }: any) => {
          return (
            <a
              onClick={() => {
                onItemUpdate(record, (value) => {
                  onItemChange(record, value)
                })
              }}
            >
              编辑
            </a>
          )
        }
      }
    ]

    const schema = computed<Schema>(() => {
      return {
        type: 'object',
        properties: {
          status: {
            title: '是否需要用户填写个人资料',
            description: '若关闭则小程序上不显示用户个人资料填写的入口',
            type: 'boolean',
            config: {
              numberMode: true
            }
          },
          content: {
            title: '个人资料填写字段',
            type: 'array',
            widget: (props) => {
              return (
                <div class="user-info-settings-page__table">
                  <Table pagination={false} size="small" bordered columns={columns} dataSource={props.value} />
                </div>
              )
            }
          }
        }
      }
    })

    const onChange = (v: any) => {
      Object.assign(state, v)
      triggerChange()
    }

    return () => {
      return (
        <div class="user-info-settings-page">
          {import.meta.env.DEV && (
            <div class="user-info-settings-page__preview ui-scrollbar">
              <JsonView data={state} defaultUnfold />
            </div>
          )}
            <div class="user-info-settings-page__form ui-scrollbar">
            <SchemaForm schema={schema.value} value={state} onChange={onChange} />
          </div>
        </div>
      )
    }
  }
})

const onItemUpdate = (field: any, callback: (value: any) => void) => {
  const data = reactive(cloneDeep(field))

  const onChange = (value: any) => {
    Object.assign(data, value)
  }

  // @ts-ignore
  const filedMap = useProfileFieldsMap[field.key]

  useSchemaFormModal({
    title: field.name,
    data,
    onChange,
    width: 400,
    schema: {
      type: 'object',
      properties: {
        required: {
          title: '是否必填',
          type: 'boolean',
          required: true,
          config: {
            numberMode: true
          }
        },
        sort: {
          title: '排序',
          description: '数值越大排序位置越靠前',
          type: 'number',
          required: true,
          config: {
            min: -100,
            max: 9999
          }
        },
        config: filedMap.configSchema
          ? {
              title: '其他配置',
              ...filedMap.configSchema
            }
          : {
              title: '其他配置',
              type: 'object',
              widget: () => <div class="color-disabled">该字段暂无其他配置</div>
            }
      }
    },
    onOk: (value) => {
      callback(value)
    }
  })
}
