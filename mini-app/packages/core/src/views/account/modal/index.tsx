import { useCrud } from '../../../../lib'

const { onCreate, onUpdate } = useCrud({
  title: '账号管理',
  defaultValue() {
    return {
      userName: '',
      phoneNumber: '',
      password: ''
    }
  },
  schema: () => {
    return {
      type: 'object',
      properties: {
        userName: {
          title: '账号名称',
          type: 'string',
          required: true,
          config: {
            placeholder: '请输入账号名称'
          }
        },
        phoneNumber: {
          title: '账号',
          type: 'string',
          required: true,
          config: {
            placeholder: '请输入账号'
          }
        },
        password: {
          title: '账户密码',
          type: 'string',
          required: true,
          condition: (rootV) => {
            return rootV?.isEditor != true
          },
          config: {
            placeholder: '请输入密码'
          }
        },
      }
    }
  }
})

export {
  onCreate,
  onUpdate
}