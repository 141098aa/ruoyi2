import request from '@/utils/request'

// 查询授权码列表
export function listAuthorizationCode(query) {
  return request({
    url: '/facebook/authorizationCode/list',
    method: 'get',
    params: query
  })
}

// 查询授权码详细
export function getAuthorizationCode(id) {
  return request({
    url: '/facebook/authorizationCode/' + id,
    method: 'get'
  })
}

// 新增授权码
export function addAuthorizationCode(data) {
  return request({
    url: '/facebook/authorizationCode',
    method: 'post',
    data: data
  })
}

// 修改授权码
export function updateAuthorizationCode(data) {
  return request({
    url: '/facebook/authorizationCode',
    method: 'put',
    data: data
  })
}

// 删除授权码
export function delAuthorizationCode(id) {
  return request({
    url: '/facebook/authorizationCode/' + id,
    method: 'delete'
  })
}
