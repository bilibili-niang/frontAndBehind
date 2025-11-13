import { defineAction } from '../../utils'

export default defineAction({
  key: 'survey-detail',
  title: '跳转指定问卷',
  schema: {
    type: 'object',
    properties: {
      surveyId: {
        title: '目标问卷',
        type: 'string',

        config: {
          placeholder: '请输入问卷ID'
        }
      }
    }
  }
})
