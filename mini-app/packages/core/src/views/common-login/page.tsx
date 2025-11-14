import BasePage from '../../components/base-page'
import { navigateBack } from '../../utils/router'
import CommonLogin from './index'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CommonLoginPage',
  setup() {
    const onCancel = () => {
      navigateBack()
    }
    const onSuccess = () => {
      navigateBack()
    }

    return () => {
      return (
        <BasePage navigator={null} navigatorPlaceholder={false} tabsPlaceholder={false}>
          <CommonLogin reload={false} onCancel={onCancel} onSuccess={onSuccess} />
        </BasePage>
      )
    }
  }
})
