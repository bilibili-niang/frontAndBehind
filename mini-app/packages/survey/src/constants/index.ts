/** 问卷默认标题 */
export const DEFAULT_SURVEY_NAME = '请输入问卷名称'
/** 题目默认标题 */
export const DEFAULT_QUESTION_NAME = '请输入题目标题？'

/** 错误信息：必填 */
export const ERROR_MESSAGE_REQUIRED = '此项为必填，请作答'
/** 默认错误信息 */
export const ERROR_MESSAGE_DEFAULT = '此项为必填，请作答'

export const ANSWER_VALUE_FIELD = 'content'
export const ANSWER_EXTRA_FIELD = 'contentExtend'

/** 控件类型：选择 */
export const WIDGET_TYPE_CHOOSE = 'choose'
/** 控件类型：填空 */
export const WIDGET_TYPE_INPUT = 'input'
/** 控件类型：高级 */
export const WIDGET_TYPE_PRO = 'pro'
/** 控件类型：分段 */
export const WIDGET_TYPE_SPLIT = 'split'
/** 控件类型：信息收集 */
export const WIDGET_TYPE_COLLECTION = 'collection'
/** 控件类型：个人信息 */
export const WIDGET_TYPE_PERSONAL = 'personal'
/** 控件类型：联系方式 */
export const WIDGET_TYPE_CONTACT = 'contact'
/** 控件类型选项 */
export const WIDGET_TYPE_OPTIONS = [
  { label: '选择', value: WIDGET_TYPE_CHOOSE },
  { label: '填空', value: WIDGET_TYPE_INPUT },
  { label: '高级题型', value: WIDGET_TYPE_PRO },
  { label: '分段', value: WIDGET_TYPE_SPLIT },
  { label: '信息收集', value: WIDGET_TYPE_COLLECTION },
  { label: '个人信息', value: WIDGET_TYPE_PERSONAL },
  { label: '联系方式', value: WIDGET_TYPE_CONTACT }
]

/** 控件：单选 */
export const WIDGET_RADIO = 'radio'
/** 控件：多选 */
export const WIDGET_CHECKBOX = 'checkbox'
/** 控件：下拉选择 */
export const WIDGET_SELECT = 'select'
/** 控件：图片选择 */
export const WIDGET_IMAGE_SELECT = 'image-select'

/** 控件：填空 */
export const WIDGET_INPUT = 'input'
/** 控件：多项填空 */
export const WIDGET_MULTIPLE_INPUT = 'multiple-input'

/** 控件：评分 */
export const WIDGET_RATE = 'rate'
/** 控件：NPS量表 */
export const WIDGET_NPS = 'nps'

/** 控件：段落说明 */
export const WIDGET_PARAGRAPH = 'paragraph'
/** 控件：多选 */
export const WIDGET_DIVIDER = 'divider'

/** 控件：文件上传 */
export const WIDGET_FILE_UPLOADER = 'file-uploader'
/** 控件：图片上传 */
export const WIDGET_IMAGE_UPLOADER = 'image-uploader'

/** 控件：姓名 */
export const WIDGET_NAME = 'name'
/** 控件：身份证 */
export const WIDGET_IDENTITY = 'identity'
/** 控件：生日 */
export const WIDGET_BIRTHDAY = 'birthday'
/** 控件：性别 */
export const WIDGET_GENDER = 'gender'
/** 控件：年龄 */
export const WIDGET_AGE = 'age'
/** 控件：学历 */
export const WIDGET_DIPLOMA = 'diploma'
/** 控件：学校 */
export const WIDGET_SCHOOL = 'school'
/** 控件：专业 */
export const WIDGET_MAJOR = 'major'
/** 控件：行业 */
export const WIDGET_INDUSTRY = 'industry'
/** 控件：职业 */
export const WIDGET_PROFESSION = 'profession'

/** 控件：手机号 */
export const WIDGET_PHONE = 'phone'
/** 控件：微信号 */
export const WIDGET_WECHAT = 'wechat'
/** 控件：QQ号 */
export const WIDGET_QQ = 'qq'
/** 控件：邮箱 */
export const WIDGET_EMAIL = 'email'
/** 控件：地址 */
export const WIDGET_ADDRESS = 'address'

/** 控件选项 */
export const WIDGET_OPTIONS = [
  { label: '单选', type: 0, value: WIDGET_RADIO, group: WIDGET_TYPE_CHOOSE, icon: '' },
  { label: '多选', type: 1, value: WIDGET_CHECKBOX, group: WIDGET_TYPE_CHOOSE, icon: '' },
  { label: '下拉选择', type: 2, value: WIDGET_SELECT, group: WIDGET_TYPE_CHOOSE, icon: '' },
  { label: '图片选择', value: WIDGET_IMAGE_SELECT, group: WIDGET_TYPE_CHOOSE, icon: '' },

  { label: '填空', type: 3, value: WIDGET_INPUT, group: WIDGET_TYPE_INPUT, icon: '' },
  { label: '多项填空', value: WIDGET_MULTIPLE_INPUT, group: WIDGET_TYPE_INPUT, icon: '' },

  { label: '评分', value: WIDGET_RATE, group: WIDGET_TYPE_PRO, icon: 'star' },
  { label: 'NPS量表', type: 4, value: WIDGET_NPS, group: WIDGET_TYPE_PRO, icon: '' },

  { label: '段落说明', value: WIDGET_PARAGRAPH, group: WIDGET_TYPE_SPLIT, icon: '' },
  { label: '分割线', value: WIDGET_DIVIDER, group: WIDGET_TYPE_SPLIT, icon: '' },

  {
    label: '文件上传',
    type: 5,
    value: WIDGET_FILE_UPLOADER,
    group: WIDGET_TYPE_COLLECTION,
    icon: ''
  },
  { label: '图片上传', value: WIDGET_IMAGE_UPLOADER, group: WIDGET_TYPE_COLLECTION, icon: '' },

  { label: '姓名', value: WIDGET_NAME, group: WIDGET_TYPE_PERSONAL, icon: '' },
  { label: '身份证', value: WIDGET_IDENTITY, group: WIDGET_TYPE_PERSONAL, icon: 'permissions' },
  { label: '生日', value: WIDGET_BIRTHDAY, group: WIDGET_TYPE_PERSONAL, icon: '' },
  { label: '性别', value: WIDGET_GENDER, group: WIDGET_TYPE_PERSONAL, icon: '' },
  { label: '年龄', value: WIDGET_AGE, group: WIDGET_TYPE_PERSONAL, icon: '' },
  { label: '学历', value: WIDGET_DIPLOMA, group: WIDGET_TYPE_PERSONAL, icon: '' },
  { label: '学校', value: WIDGET_SCHOOL, group: WIDGET_TYPE_PERSONAL, icon: '' },
  { label: '专业', value: WIDGET_MAJOR, group: WIDGET_TYPE_PERSONAL, icon: '' },
  { label: '行业', value: WIDGET_INDUSTRY, group: WIDGET_TYPE_PERSONAL, icon: '' },
  { label: '职业', value: WIDGET_PROFESSION, group: WIDGET_TYPE_PERSONAL, icon: '' },

  { label: '手机号', value: WIDGET_PHONE, group: WIDGET_TYPE_CONTACT, icon: 'dianhua_phone-telephone' },
  { label: '微信号', value: WIDGET_WECHAT, group: WIDGET_TYPE_CONTACT, icon: 'wechat' },
  { label: 'QQ号', value: WIDGET_QQ, group: WIDGET_TYPE_CONTACT, icon: '' },
  { label: '电子邮箱', value: WIDGET_EMAIL, group: WIDGET_TYPE_CONTACT, icon: '' },
  { label: '地址', value: WIDGET_ADDRESS, group: WIDGET_TYPE_CONTACT, icon: '' }
]

/** 输入类型：不限类型（不做校验） */
export const INPUT_TYPE_NONE = ''
/** 输入类型：数字 */
export const INPUT_TYPE_NUMBER = 'number'
/** 输入类型：日期 */
export const INPUT_TYPE_DATE = 'date'
/** 输入类型：时间 */
export const INPUT_TYPE_TIME = 'time'
/** 输入类型：电子邮箱 */
export const INPUT_TYPE_EMAIL = 'email'
/** 输入类型：中文 */
export const INPUT_TYPE_CHINESE = 'chinese'
/** 输入类型：英文 */
export const INPUT_TYPE_ENGLISH = 'english'
/** 输入类型：网址 */
export const INPUT_TYPE_URL = 'url'
/** 输入类型：身份证号码（中国大陆） */
export const INPUT_TYPE_IDENTITY = 'identity'
/** 输入类型：手机号码（中国大陆） */
export const INPUT_TYPE_PHONE = 'phone'
/** 输入类型选项 */
export const INPUT_TYPE_OPTIONS = [
  { label: '不限类型', value: INPUT_TYPE_NONE },
  { label: '数字', value: INPUT_TYPE_NUMBER },
  { label: '日期', value: INPUT_TYPE_DATE },
  { label: '时间', value: INPUT_TYPE_TIME },
  { label: '电子邮箱', value: INPUT_TYPE_EMAIL },
  { label: '中文', value: INPUT_TYPE_CHINESE },
  { label: '英文', value: INPUT_TYPE_ENGLISH },
  { label: '网址/链接', value: INPUT_TYPE_URL },
  { label: '身份证号码(中国大陆)', value: INPUT_TYPE_IDENTITY },
  { label: '手机号码(中国大陆)', value: INPUT_TYPE_PHONE }
]
