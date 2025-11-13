import request from '../request'

export const $accountList=(params:any)=>{
  return request({
    url:'/api/user/list',
    params,
    method:'get'
  })
}

export const $accountCreate=(data:any)=>{
  return request({
    url:'/api/user/create',
    data,
    method:'post'
  })
}

export const $accountDelete=(id:string)=>{
  return request({
    url:'/api/user/delete',
    params:{
      id
    },
    method:'delete'
  })
}