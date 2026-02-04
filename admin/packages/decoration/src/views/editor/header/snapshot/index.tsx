import { defineComponent, type PropType, ref, nextTick } from 'vue'
import './style.scss'
import { Button, Tooltip, Input, Popover } from '@pkg/ui'
import useSnapshotStore, { type Snapshot } from '../../../../stores/snapshot'
import { storeToRefs } from 'pinia'
import { Modal, message } from '@pkg/ui'

const SnapshotItem = defineComponent({
  name: 'LegoSnapshotItem',
  props: {
    item: {
      type: Object as PropType<Snapshot>,
      required: true
    }
  },
  emits: ['poppverKeepableChange'],
  setup(props, { emit }) {
    const snapshot = useSnapshotStore()

    const desc = ref(props.item.description)
    const descEditting = ref(false)
    const descInputRef = ref()
    const handleDescEdit = () => {
      desc.value = props.item.description
      descEditting.value = true
      nextTick(() => {
        descInputRef.value.focus()
      })
    }

    const handleDescEditEnd = () => {
      if (desc.value !== props.item.description) {
        snapshot.updateSnapshot(props.item.id, {
          description: desc.value
        })
      }
      descEditting.value = false
    }

    const handleRemove = () => {
      triggerKeepPopover(true)
      Modal.confirm({
        title: '删除快照',
        okText: '删除',
        content: (
          <div>
            <span class="lego-color-primary">快照将从服务器上删除，此操作不可恢复</span>，
            <br />
            如需留存可先导出为文件，确定要继续吗？
          </div>
        ),
        onOk: () => {
          snapshot.removeSnapshot(props.item.id)
          triggerKeepPopover(false)
        },
        onCancel: () => {
          triggerKeepPopover(false)
        }
      })
    }

    const triggerKeepPopover = (flag: boolean) => {
      setTimeout(() => {
        emit('poppverKeepableChange', flag)
      }, 100)
    }

    const handleRetrive = () => {
      triggerKeepPopover(true)
      Modal.confirm({
        title: '回溯快照',
        okText: '回溯',
        content: (
          <div>
            <span class="lego-color-primary">回溯后当前内容将无法恢复</span>，
            <br />
            如需留存请先保存为快照，确定要继续吗？
          </div>
        ),
        onOk: () => {
          snapshot
            .retrieveSnapshot(props.item.id)
            .then(() => {
              message.success('回溯成功')
            })
            .catch((err) => {
              message.error(err.message)
            })
          triggerKeepPopover(false)
        },
        onCancel: () => {
          triggerKeepPopover(false)
        }
      })
    }

    const handleDownLoad = () => {
      snapshot.download(props.item)
    }

    const handlePreview = () => {
      snapshot.preview(props.item)
    }

    const handleDeploy = () => {
      snapshot.deploy(props.item)
    }

    return () => {
      const item = props.item
      return (
        <div class="snapshot-item" key={item.id}>
          <div class="snapshot-item__header">
            <span class="snapshot-item__name">{item.name}</span>
            <div class="snapshot-item__actions">
              <Tooltip title="导出为文件">
                <i class="snapshot-item__action" onClick={handleDownLoad}>
                  <iconpark-icon name="download-four"></iconpark-icon>
                </i>
              </Tooltip>
              <Tooltip title="预览">
                <i class="snapshot-item__action" style="font-size: 20px;" onClick={handlePreview}>
                  <iconpark-icon name="play-one"></iconpark-icon>
                </i>
              </Tooltip>
              <Tooltip title="回溯">
                <i class="snapshot-item__action" onClick={handleRetrive}>
                  <iconpark-icon name="file-conversion"></iconpark-icon>
                </i>
              </Tooltip>
              <Tooltip title="发布">
                <i class="snapshot-item__action" onClick={handleDeploy}>
                  <iconpark-icon name="telegram"></iconpark-icon>
                </i>
              </Tooltip>
              <Tooltip title="删除">
                <i class="snapshot-item__action lego-hover-color-error" onClick={handleRemove}>
                  <iconpark-icon name="delete-one-8ic9jp2o"></iconpark-icon>
                </i>
              </Tooltip>
            </div>
          </div>
          <div class="snapshot-item__desc">
            {descEditting.value ? (
              <Input
                ref={descInputRef}
                placeholder={'暂无备注'}
                value={desc.value}
                onChange={(e) => {
                  desc.value = e.target.value
                }}
                onBlur={handleDescEditEnd}
              />
            ) : (
              <div class="snapshot-item__desc-content">
                {item.description || '暂无备注'}
                <span class="snapshot-item__action" onClick={handleDescEdit}>
                  <iconpark-icon name="edit"></iconpark-icon>
                </span>
              </div>
            )}
          </div>
        </div>
      )
    }
  }
})

export default defineComponent({
  name: 'LegoSnapshot',
  setup(props, { slots }) {
    const snapshot = useSnapshotStore()
    const { snapshots } = storeToRefs(snapshot)
    const loading = ref(false)

    const popupVisible = ref(false)
    // 防止二级操作影响popover显示
    const forecePopoverKeep = ref(false)
    const onPopupVisibleChange = (v: boolean) => {
      if (forecePopoverKeep.value) {
        return false
      }
      popupVisible.value = v
    }

    const addSnapshot = () => {
      loading.value = true
      snapshot
        .addSnapshot()
        .then((res) => {
          loading.value = false
        })
        .catch((err) => {
          message.error(err.message)
          loading.value = false
        })
    }

    const handleDownLoad = () => {
      snapshot.download()
    }
    const handleLoadFile = () => {
      forecePopoverKeep.value = true
      snapshot
        .load()
        .then((res) => {
          // console.log(res)
          useSnapshotStore().retrieveSnapshot(res as Snapshot)
        })
        .catch((err) => {
          console.log('cancel')
        })
      setTimeout(() => {
        forecePopoverKeep.value = false
      }, 100)
    }

    return () => {
      return (
        <Popover
          z-index={99}
          trigger="click"
          placement="bottomLeft"
          open={popupVisible.value}
          onOpenChange={onPopupVisibleChange}
          content={
            <div class="lego-snapshot">
              <div class="lego-snapshot__header">
                <strong>快照管理</strong>
                <span class="lego-snapshot__header-tip">
                  <span class="lego-color-primary">{snapshots.value.length}</span> 个，还可创建{' '}
                  <span class="lego-color-primary">
                    {Math.max(snapshot.state.maxCount - snapshots.value.length, 0)}
                  </span>{' '}
                  个
                </span>
                <Button
                  size="small"
                  style="font-size:12px;margin-right:8px"
                  onClick={handleDownLoad}
                >
                  导出
                </Button>
                <Button
                  size="small"
                  style="font-size:12px;margin-right:8px"
                  onClick={handleLoadFile}
                >
                  导入
                </Button>
                <Button
                  size="small"
                  style="font-size:12px;"
                  type="primary"
                  loading={loading.value}
                  onClick={addSnapshot}
                >
                  生成
                </Button>
              </div>
              <div class="lego-snapshot__content">
                <div class="snapshot-list">
                  {snapshots.value.map((item) => {
                    return (
                      <SnapshotItem
                        item={item}
                        onPoppverKeepableChange={(flag) => (forecePopoverKeep.value = flag)}
                      />
                    )
                  })}
                </div>
                {snapshots.value.length === 0 && (
                  <div class="snapshot-empty">
                    <div>暂无快照</div>
                    <small>可以点击「新建快照」创建当前页面快照</small>
                    <small>或者上传「快照文件」添加快照。</small>
                  </div>
                )}
              </div>
            </div>
          }
        >
          {slots.default?.()}
        </Popover>
      )
    }
  }
})
