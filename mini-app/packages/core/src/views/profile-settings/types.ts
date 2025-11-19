export enum FiledType {
  /* ---------------------------------- 通用字段 ---------------------------------- */

  /** 姓名 */
  name = 'name',
  /** 性别：1 男性、0 女性、null 保密 */
  gender = 'gender',
  /** 生日：YYYY-MM-DD */
  birthday = 'birthday',
  /** 地址：JSON */
  address = 'address',

  /* ---------------------------------- 业务字段 ---------------------------------- */

  /** 人脸图片 */
  faceImage = 'faceImage'
}

//  const contentExample = {
//   name: '某某某',
//   gender: 1,
//   birthday: '2000-01-01',
//   address: {
//     latitude: 24.621981,
//     longitude: 118.037238,
//     address: '福建省厦门市集美区诚毅北大街软件园C区',
//     province: '福建省',
//     city: '厦门市',
//     district: '集美区',
//     title: '集美区软件园3期C区(珩圣西路北50米)',
//     code: '350211'
//   },
//   faceImage: 'https://picsum.photots/100/100'
// }

//  const demo = [
//   {
//     name: '姓名',
//     key: FiledType.name,
//     required: 1,
//     modifiable: 1,
//     sort: 4,
//     status: 1,
//     config: {} // 字段拓展配置JSON，这个版本暂时不需要
//   },
//   {
//     name: '生日',
//     key: FiledType.birthday,
//     required: 0,
//     modifiable: 1,
//     sort: 2,
//     status: 1,
//     config: {}
//   },
//   {
//     name: '性别',
//     key: FiledType.gender,
//     required: 1,
//     modifiable: 1,
//     sort: 3,
//     status: 1,
//     config: {}
//   },
//   {
//     name: '地区',
//     key: FiledType.address,
//     required: 1,
//     modifiable: 1,
//     sort: 1,
//     status: 1,
//     config: {}
//   },
//   {
//     name: '门禁人脸',
//     key: FiledType.faceImage,
//     required: 1,
//     modifiable: 1,
//     sort: 0,
//     status: 1,
//     config: {}
//   }
// ]
