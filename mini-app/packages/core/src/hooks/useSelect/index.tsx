import { Radio } from '@pkg/ui'
import useModal from '../useModal'
import { ComputedValue, useComputedValue } from '../useComputedValue'
import './style.scss'
import EmptyStatus from '../../components/empty-status'

export const useSelect = (options: {
  title?: string
  value?: ComputedValue<any>
  options: ComputedValue<{ label: string; value: any }[]>
  onSuccess?: (v: any) => void
}) => {
  const value = useComputedValue(options.value)

  const onChange = (v: any) => {
    options.onSuccess?.(v)
  }

  const optionsRef = useComputedValue(options.options)

  const modal = useModal({
    title: options.title || '请选择',
    height: 'auto',
    content: () => {
      return (
        <div class="use-select">
          <div class="use-select__list">
            {optionsRef.value.map(item => {
              return (
                <div
                  class="use-select__item"
                  onClick={() => {
                    modal.close()
                    onChange(item.value)
                  }}
                >
                  <Radio checked={item.value === value.value}></Radio>
                  <div class="text">{item.label}</div>
                </div>
              )
            })}
            {optionsRef.value.length === 0 && <EmptyStatus title="空空如也" description="暂无可用选项" />}
          </div>
        </div>
      )
    }
  })
}
