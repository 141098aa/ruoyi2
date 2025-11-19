import request from '@/utils/request'

// 查询保证金列表
export function listMargin(query) {
  return request({
    url: '/facebook/margin/list',
    method: 'get',
    params: query
  })
}

// 查询保证金详细
export function getMargin(id) {
  return request({
    url: '/facebook/margin/' + id,
    method: 'get'
  })
}

// 新增保证金
export function addMargin(data) {
  return request({
    url: '/facebook/margin',
    method: 'post',
    data: data
  })
}

// 修改保证金
export function updateMargin(data) {
  return request({
    url: '/facebook/margin',
    method: 'put',
    data: data
  })
}

// 删除保证金
export function delMargin(id) {
  return request({
    url: '/facebook/margin/' + id,
    method: 'delete'
  })
}
