import { COLOR_ERROR, COLOR_PROCESSING, COLOR_SUCCESS } from '../../../../config/index'
export enum OperateLogType {
  Create = 0,
  Update = 1,
  Delete = 2
}

export const OperateLogTypeOptions = [
  { label: '创建', value: OperateLogType.Create, color: COLOR_SUCCESS },
  { label: '更新', value: OperateLogType.Update, color: COLOR_PROCESSING },
  { label: '删除', value: OperateLogType.Delete, color: COLOR_ERROR }
]

export enum OperateLogSource {
  Manual = 0,
  Auto = 1
}

export const OperateLogSourceOptions = [
  { label: '后台操作', value: OperateLogSource.Manual },
  { label: '定时任务', value: OperateLogSource.Auto }
]

export enum OperateLogStatus {
  Success = 0,
  Fail = 1
}

export const OperateLogStatusOptions = [
  { label: '成功', value: OperateLogStatus.Success, color: COLOR_SUCCESS },
  { label: '失败', value: OperateLogStatus.Fail, color: COLOR_ERROR }
]
