import { defineComponent } from 'vue'
import Editor from '../editor'

export default defineComponent({
  name: '',
  setup() {
    // const actionTest = {
    //   action: 'weapp',
    //   config: {
    //     originalId: '原始ID',
    //     appId: 'wx123456',
    //     path: '/pages/index',
    //     params: [
    //       {
    //         key: 'id',
    //         value: '1'
    //       },
    //       {
    //         key: 'scope',
    //         value: 'home'
    //       }
    //     ],
    //     __preCondition: {
    //       isLogin: {
    //         enable: true,
    //         message: '请您先登录',
    //         handler: 'login'
    //       },
    //       isPersonalAuth: {
    //         enable: false,
    //         message: '',
    //         handler: 'personalAuth'
    //       },
    //       isVolunteer: {
    //         enable: false,
    //         message: '',
    //         handler: 'volunteerAuth'
    //       },
    //       isPartyMember: {
    //         enable: false,
    //         message: '',
    //         handler: 'partyMemberAuth'
    //       }
    //     }
    //   },
    //   remark: ''
    // }

    return () => {
      return (
        <div>
          <Editor />
          {/* <ConfigProvider prefixCls={prefixCls}>
            <Modal width="auto" visible={true}>
              <ActionModal {...actionTest} />
            </Modal>
          </ConfigProvider> */}
        </div>
      )
    }
  }
})
