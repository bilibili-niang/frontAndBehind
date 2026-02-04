// widget的联系人,联系电话组件
import './index.scss'
import { defineComponent, ref, watch, nextTick } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { Input, message } from '@pkg/ui'
import { cloneDeep } from 'lodash'

interface Contract {
  contract: string
  phone: string
}

interface ContractError {
  contract?: string
  phone?: string
}

export default defineComponent({
  name: 'contracts',
  props: CommonWidgetPropsDefine,
  setup(props) {
    const contracts = ref<Contract[]>([])
    const inputRefs = ref<Record<string, HTMLInputElement>>({})
    const errors = ref<ContractError[]>([])

    // 初始化数据
    const initData = () => {
      const val = props.value
      if (Array.isArray(val) && val.length > 0) {
        contracts.value = cloneDeep(val)
      } else {
        // 默认添加一个空的联系方式
        contracts.value = [{ contract: '', phone: '' }]
      }
      errors.value = new Array(contracts.value.length).fill({})
    }

    // 初始化
    initData()

    watch(
      () => props.value,
      (val) => {
        if (val) {
          initData()
        }
      }
    )

    // 校验联系人
    const validateContact = (value: string): string | undefined => {
      if (!value || !value.trim()) {
        return '请输入联系人'
      }
      if (value.length > 20) {
        return '联系人不能超过20个字符'
      }
      return undefined
    }

    // 校验手机号码
    const validatePhone = (value: string): string | undefined => {
      if (!value || !value.trim()) {
        return '请输入联系电话'
      }
      if (!/^1[3-9]\d{9}$/.test(value.replace(/\D/g, ''))) {
        return '请输入正确的手机号码'
      }
      return undefined
    }

    // 校验联系方式
    const validateContract = (contract: Contract, index: number): boolean => {
      const error: ContractError = {}
      let isValid = true

      // 联系人校验
      console.log('contract value:', contract.contract, 'type:', typeof contract.contract)
      const contractError = validateContact(contract.contract)
      if (contractError) {
        error.contract = contractError
        isValid = false
        message.warning(contractError)
      }

      // 手机号码校验
      console.log('phone value:', contract.phone, 'type:', typeof contract.phone)
      const phoneError = validatePhone(contract.phone)
      if (phoneError) {
        error.phone = phoneError
        isValid = false
        message.warning(phoneError)
      }

      errors.value[index] = error
      console.log('validation result:', isValid, 'errors:', error)
      return isValid
    }

    // 校验所有联系方式
    const validateAllContracts = (): boolean => {
      let isValid = true
      errors.value = new Array(contracts.value.length).fill({})

      for (let i = 0; i < contracts.value.length; i++) {
        if (!validateContract(contracts.value[i], i)) {
          isValid = false
        }
      }

      return isValid
    }

    // 添加联系方式
    const handleAdd = () => {
      const newContracts = cloneDeep(contracts.value)
      newContracts.push({ contract: '', phone: '' })
      contracts.value = newContracts
      errors.value.push({})
      props.onChange(newContracts)

      // 自动聚焦到新添加的联系人输入框
      /*  nextTick(() => {
        const index = contracts.value.length - 1
        const ref = inputRefs.value[`contract-${index}`]
        if (ref) {
          ref.focus()
        }
      })*/
    }

    // 删除联系方式
    const handleRemove = (index: number) => {
      const newContracts = cloneDeep(contracts.value)
      newContracts.splice(index, 1)
      contracts.value = newContracts
      errors.value.splice(index, 1)
      props.onChange(newContracts)
    }

    // 格式化手机号码
    const formatPhoneNumber = (phone: string): string => {
      // 只保留数字
      return phone.replace(/\D/g, '')
    }

    // 更新联系方式
    const handleInputChange = (index: number, field: keyof Contract, value: string) => {
      // 联系人长度限制
      if (field === 'contract' && value.length > 20) {
        message.warning('联系人不能超过20个字符')
        return
      }

      // 手机号码处理
      if (field === 'phone') {
        // 移除非数字字符
        const numbers = value.replace(/\D/g, '')
        if (numbers.length > 11) {
          return
        }
        value = formatPhoneNumber(numbers)
      }

      const newContracts = cloneDeep(contracts.value)
      newContracts[index][field] = value
      contracts.value = newContracts
      props.onChange(newContracts)

      // 清除对应字段的错误信息
      if (errors.value[index]) {
        errors.value[index] = {
          ...errors.value[index],
          [field]: undefined
        }
      }

      // 联系人输入完成后自动聚焦到手机号码输入框
      /* if (field === 'contract' && value.length > 0) {
        nextTick(() => {
          const ref = inputRefs.value[`phone-${index}`]
          if (ref) {
            ref.focus()
          }
        })
      } */
    }

    // 处理按键事件
    const handleKeyDown = (index: number, field: keyof Contract, e: KeyboardEvent) => {
      // 按下回车键
      if (e.key === 'Enter') {
        e.preventDefault()
        if (field === 'contract') {
          // 联系人输入完成后聚焦到手机号码输入框
          const ref = inputRefs.value[`phone-${index}`]
          if (ref) {
            ref.focus()
          }
        } else if (field === 'phone') {
          // 手机号码输入完成后，如果是最后一个联系方式，则添加新的联系方式
          if (index === contracts.value.length - 1 && contracts.value.length < 5) {
            handleAdd()
          }
        }
      }
    }

    // 处理失去焦点事件
    const handleBlur = (index: number, field: keyof Contract) => {
      const contract = contracts.value[index]
      const error: ContractError = errors.value[index] || {}

      if (field === 'contract') {
        error.contract = validateContact(contract.contract)
      } else if (field === 'phone') {
        error.phone = validatePhone(contract.phone)
      }

      errors.value[index] = error
    }

    return () => (
      <div class="contracts-widget">
        {/*<div
          onclick={() => {
            console.log('contracts', contracts.value)
          }}
        >
          查看数据
        </div>*/}
        {contracts.value.map((item, index) => (
          <div class="contracts-item" key={index}>
            <Input
              ref={(el) => (inputRefs.value[`contract-${index}`] = el as HTMLInputElement)}
              class="contract-input"
              value={item.contract}
              maxLength={20}
              placeholder="请输入联系人"
              onChange={(e: any) => handleInputChange(index, 'contract', e.target.value)}
              onBlur={() => handleBlur(index, 'contract')}
              error={errors.value[index]?.contract}
            />
            <Input
              ref={(el) => (inputRefs.value[`phone-${index}`] = el as HTMLInputElement)}
              class="phone-input"
              value={item.phone}
              maxLength={13}
              placeholder="请输入联系电话"
              onChange={(e: any) => handleInputChange(index, 'phone', e.target.value)}
              onBlur={() => handleBlur(index, 'phone')}
              error={errors.value[index]?.phone}
            />
            {contracts.value.length > 1 && (
              <div class="remove-btn" onClick={() => handleRemove(index)}>
                删除
              </div>
            )}
          </div>
        ))}
        {contracts.value.length < 5 && (
          <div class="add-btn" onClick={handleAdd}>
            添加联系方式
          </div>
        )}
      </div>
    )
  }
})
