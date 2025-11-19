export const commonQRCodePropsDefine = {
  size: {
    type: Number,
    default: 200
  },
  logo: {
    type: String,
    default: ''
  },
  logoSize: {
    type: Number,
    default: 60
  },
  content: {
    type: String,
    default: ''
  },
  callback: Function,
  color: {
    type: String,
    default: '#000'
  },
  backgroundColor: {
    type: String,
    default: '#fff'
  },
  correctLevel: {
    type: String,
    default: 'Q'
  }
}
