import { reactive, ref, toRaw } from 'vue'
import { defineStore } from 'pinia'
import useCanvasStore from '../canvas'
import { formatDate, importJSONFile, saveAsJSONFile } from '../../utils'
import { useRequestErrorMessage, uuid } from '@anteng/core'
import { cloneDeep } from 'lodash'
import generateBlankSnapshot from './generate-blank-snapshot'
import { message } from '@anteng/ui'

import { $createDecorationPage, $updateDecorationPage } from '../../api'
import useEditorStore from '../editor'
import { SCOPE_CUSTOM } from '../../constants'

export interface Snapshot {
  readonly id: string
  name: string
  readonly scope?: string
  readonly template?: string
  readonly date: string
  readonly timestamp: number
  description?: string
  payload: Record<string, any>
}

const useSnapshotStore = defineStore('SNAPSHOT', () => {
  const state = reactive({
    maxCount: 20
  })

  const snapshots = ref<Snapshot[]>(JSON.parse(localStorage.getItem('lego-snapshots') || '[]'))

  const getSnapshot = (snapshot: Snapshot | string) => {
    if (typeof snapshot === 'string') {
      return snapshots.value.find((item) => item.id === snapshot)
    }
    return snapshot
  }

  /** 生成当前页面的快照 */
  const generateSnapshot = () => {
    const canvas = useCanvasStore()

    const date = new Date()
    const dateString = formatDate(date)
    const snapshot: Snapshot = {
      // TODO 这里快照的id需要是唯一的，可以考虑2种方式。 /项目id/快照id 或者 /快照uuid
      id: uuid(6),
      name: dateString,
      scope: canvas.scope,
      template: canvas.template,
      date: dateString,
      timestamp: +date,
      description: '',
      payload: cloneDeep({
        ...canvas.snapshot()
      })
    }
    return snapshot
  }

  const addSnapshot = (snapshot?: Snapshot) => {
    return new Promise((resolve, reject) => {
      if (snapshots.value.length >= state.maxCount) {
        return reject(new Error('数量已达上限，请先删除不需要的快照'))
      }
      const _snapshot = snapshot ?? generateSnapshot()
      setTimeout(() => {
        snapshots.value.push(_snapshot)
        saveAsStorage()
        resolve(snapshot)
      }, 1000)
    })
  }

  const updateSnapshot = (
    id: string,
    options: {
      name?: string
      description?: string
    }
  ) => {
    const target = getSnapshot(id)
    if (!target) {
      return false
    }
    Object.assign(target, options)
    saveAsStorage()
  }

  const removeSnapshot = (id: string) => {
    const index = snapshots.value.findIndex((item) => item.id === id)
    if (index != -1) {
      snapshots.value.splice(index, 1)
      saveAsStorage()
    } else {
      message.error('找不到快照!')
    }
  }
  const saveAsStorage = () => {
    localStorage.setItem('lego-snapshots', JSON.stringify(toRaw(snapshots.value)))
  }

  // 注意：保存和恢复快照，都要使用深拷贝的对象，防止改动影响到原来的数据
  const retrieveSnapshot = (snapshot: Snapshot | string) => {
    return new Promise((resolve, reject) => {
      let targetSnapshot: Snapshot

      if (typeof snapshot === 'string') {
        const t = snapshots.value.find((item) => item.id === snapshot)
        if (t === undefined) {
          return reject(new Error('找不到快照'))
        }
        targetSnapshot = cloneDeep(t)
      } else {
        targetSnapshot = cloneDeep(snapshot) as Snapshot
      }
      useCanvasStore().retrieveSnapshot(targetSnapshot)
      console.groupCollapsed('恢复快照', targetSnapshot.name)
      console.log(snapshot)
      console.groupEnd()
      setTimeout(() => {
        resolve(null)
      }, 300)
    })
  }

  /** 导出快照为 snapshot_{data}.json 并下载  */
  const download = (snapshot?: Snapshot | string) => {
    const target = snapshot === undefined ? generateSnapshot() : getSnapshot(snapshot)
    const date = formatDate(
      target?.timestamp ? new Date(target.timestamp) : new Date(),
      'yyyyMMddHHmmss'
    )
    saveAsJSONFile(toRaw(target) as unknown as JSON, `snapshot_${date}`)
  }

  /** 导入快照文件 */
  const load = () => {
    return new Promise((resolve, reject) => {
      importJSONFile()
        .then((res) => {
          // TODO 这里要校验 json 文件的内容是否符合快照数据结构！
          addSnapshot(res as Snapshot).then((res) => {
            message.success('导入快照文件成功！')
          })
          resolve(res)
        })
        .catch(reject)
    })
  }

  /** 预览 */
  const preview = (snapshot?: Snapshot | string) => {
    message.info('未支持预览')
    localStorage.setItem('deck-preview', JSON.stringify(snapshot ?? generateSnapshot()))
  }

  /** 发布自定义页面 */
  const deployCustomPage = (snapshot?: Snapshot) => {
    return new Promise((resolve, reject) => {
      // message.info('未支持发布')
      const editorStore = useEditorStore()
      const s = snapshot ?? generateSnapshot()
      // const data = JSON.stringify(s)
      // localStorage.setItem('deck-deploy', data)
      const title = s.payload.page.basic.name
      if (!editorStore.pageId) {
        // 创建页面
        $createDecorationPage({
          title: title,
          decorate: s
        })
          .then((res) => {
            message.success('页面发布成功')
            resolve(null)
          })
          .catch((err: any) => {
            useRequestErrorMessage(err)
            reject(err)
          })
      } else {
        // 编辑页面
        $updateDecorationPage(editorStore.pageId, {
          title: title,
          decorate: s
        })
          .then((res) => {
            message.success('页面发布成功')
            resolve(null)
          })
          .catch((err: any) => {
            useRequestErrorMessage(err)
            reject(err)
          })
      }
    })
  }

  /** 发布自定义页面 */
  const deploySystemPage = (snapshot?: Snapshot) => {
    return new Promise((resolve, reject) => {
      const s = snapshot ?? generateSnapshot()
      $updateDecorationPage(useEditorStore().pageId!, s)
        .then((res) => {
          message.success('页面发布成功')
          resolve(null)
        })
        .catch((err: any) => {
          useRequestErrorMessage(err)
          reject(err)
        })
    })
  }

  /** 发布 */
  const deploy = (snapshot?: Snapshot) => {
    if (useCanvasStore().scope === SCOPE_CUSTOM) {
      return deployCustomPage(snapshot)
    }
    return deploySystemPage(snapshot)
  }

  /** 清空画布数据 */
  const clearAllData = () => {
    retrieveSnapshot(generateBlankSnapshot())
  }

  // 初始化恢复数据

  // setTimeout(() => {
  //   //   retriveSnapshot(defaultSnapshot.value)
  //   try {
  //     const s = localStorage.getItem('deck-deploy')
  //     if (s) {
  //       retriveSnapshot(JSON.parse(s) as Snapshot)
  //     } else {
  //       // TODO 初始化demo
  //       retriveSnapshot(demo)
  //     }
  //   } catch (err) {}
  // }, 300)

  return {
    state,
    snapshots,
    generateBlankSnapshot,
    generateSnapshot,
    addSnapshot,
    removeSnapshot,
    retrieveSnapshot,
    updateSnapshot,
    getSnapshot,
    download,
    load,
    preview,
    deploy,
    clearAllData
  }
})

export default useSnapshotStore
