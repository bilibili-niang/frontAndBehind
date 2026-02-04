import { defineComponent, onUnmounted } from 'vue'
import './style.scss'
import { useSearchTable, useTableAction } from '../../../components/search-table'
import { useProfileFieldsMap } from '../fields'
import { $createUserProfile, $getUserList, $getUserProfileList, $updateUserProfile } from '../../../api/user-profile'
import emitter from '../../../utils/emitter'
import { Button } from '@pkg/ui'
import useCrud from '../../../hooks/useCrud'
import { CommonSelectorPropsDefine } from '../../../hooks/useCommonSelector/index'
import { DEFAULT_AVATAR } from '@pkg/config'

export default defineComponent({
  name: 'UserList',
  props: {
    ...CommonSelectorPropsDefine
  },
  setup(props) {
    const { Table, refresh } = useSearchTable({
      title: '会员列表',
      customRequest: (params) => {
        if (props.asSelector) {
          return $getUserList(params)
        }
        return $getUserProfileList(params)
      },
      toolbar: (
        <Button
          type="primary"
          onClick={() => {
            onCreate()
          }}
        >
          新建用户
        </Button>
      ),
      filter: {
        list: [
          {
            label: '用户手机号',
            key: 'phone',
            type: 'input',
            fixed: true,
            flex: props.asSelector ? 6 : 4
          },
          {
            label: '用户姓名',
            key: 'name',
            type: 'input',
            fixed: true,
            flex: props.asSelector ? 6 : 4
          },
          {
            label: '创建时间',
            key: 'createTime',
            type: 'range-picker',
            fixed: !props.asSelector,
            flex: props.asSelector ? 12 : undefined
          },
          {
            label: '更新时间',
            key: 'updateTime',
            type: 'range-picker',
            fixed: !props.asSelector,
            flex: props.asSelector ? 12 : undefined
          }
        ]
      },
      dataSourceFormat(dataSource) {
        return dataSource.map((item) => {
          return {
            id: item.userInfo?.id,
            userId: item.userId,
            nickName: item.name == item.phone ? item.realName : item.name,
            avatar: item.avatar,
            phone: item.phone,
            infoContent: item.userInfo?.infoContent ?? {},
            createTime: item.createTime,
            updateTime: item.userInfo?.updateTime ?? item.updateTime
          }
        })
      },
      table: {
        columns: [
          // { dataIndex: 'id', title: 'ID', width: 200 },
          {
            title: '用户信息',
            dataIndex: 'userInfo',
            width: 200,
            customRender: ({ record }) => {
              const { nickName, phone, avatar } = record

              const withoutName = !nickName || nickName === phone

              return (
                <div class="p_user-profile-list__user">
                  <div
                    class="avatar"
                    style={{
                      backgroundImage: `url(${avatar || DEFAULT_AVATAR})`
                    }}
                  ></div>
                  <div class="info">
                    <div class="nickname">{withoutName ? <span class="color-disabled">匿名用户</span> : nickName}</div>
                    <div class="phone">{phone}</div>
                  </div>
                </div>
              )
            }
          },

          ...Object.keys(useProfileFieldsMap).map((key) => {
            const item = (useProfileFieldsMap as any)[key]
            return { dataIndex: item.key, title: item.title, width: 150, ...item.tableRender }
          }),

          // { dataIndex: 'name', title: '用户姓名', width: 150 },
          // { dataIndex: 'phone', title: '用户手机号', width: 200 },
          // { dataIndex: 'birthday', title: '生日', width: 200 },
          // { dataIndex: 'address', title: '地址', width: 250 },
          { dataIndex: 'createTime', title: '创建时间', width: 200 },
          { dataIndex: 'updateTime', title: '更新时间', width: 200 },
          {
            dataIndex: 'action',
            title: '操作',
            width: props.asSelector ? 96 : 110,
            fixed: 'right',
            customRender({ record }) {
              if (props.asSelector) {
                return (
                  <Button
                    type="primary"
                    onClick={() => {
                      props.onSelect({
                        id: record.userId,
                        userId: record.userId,
                        name: record.infoContent?.name ?? record.userName,
                        phone: record.userPhone,
                        avatar: record.avatar
                      })
                    }}
                  >
                    选择
                  </Button>
                )
              }
              return useTableAction({
                list: [
                  {
                    title: '编辑',
                    disabled: !record.id,
                    onClick: () => {
                      onUpdate({ id: record.id, ...record.infoContent, phone: record.phone })
                    }
                  }
                  // {
                  //   title: '删除',
                  //   type: 'danger',
                  //   disabled: !record.id,
                  //   onClick: () => {
                  //     onRemove(() => {
                  //       return $deleteUserProfile(record.id)
                  //     }, refresh)
                  //   },
                  //   description: '仅删除用户信息，不会删除用户'
                  // }
                ]
              })
            }
          }
        ]
      }
    })

    emitter.on('user-profile-refresh', refresh)

    onUnmounted(() => {
      emitter.off('user-profile-refresh', refresh)
    })

    const { onCreate, onUpdate, onRemove } = useCrud({
      title: '用户信息',
      defaultValue() {
        return {}
      },
      schema: (type) => {
        return {
          type: 'object',
          properties: {
            phone: {
              title: '用户手机号',
              type: 'string',
              required: true,
              hidden: type === 'update',
              config: {
                placeholder: '请输入用户手机号'
              }
            },
            ...Object.fromEntries(Object.entries(useProfileFieldsMap).map(([key, i]) => [key, i.schema]))
          }
        }
      },
      onCreate(value) {
        const { phone, ...profile } = value
        return $createUserProfile(phone, profile).finally(refresh)
      },
      onUpdate(value) {
        const { id, phone, ...profile } = value
        return $updateUserProfile(id, profile).finally(refresh)
      }
    })

    return () => {
      return Table
    }
  }
})
