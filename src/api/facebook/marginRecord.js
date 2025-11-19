import request from '@/utils/request'

// 查询保证金记录列表
export function listMarginRecord(query) {
  return request({
    url: '/facebook/marginRecord/list',
    method: 'get',
    params: query
  })
}

// 查询保证金记录详细
export function getMarginRecord(id) {
  return request({
    url: '/facebook/marginRecord/' + id,
    method: 'get'
  })
}

// 新增保证金记录
export function addMarginRecord(data) {
  return request({
    url: '/facebook/marginRecord',
    method: 'post',
    data: data
  })
}

// 修改保证金记录
export function updateMarginRecord(data) {
  return request({
    url: '/facebook/marginRecord',
    method: 'put',
    data: data
  })
}

// 删除保证金记录
export function delMarginRecord(id) {
  return request({
    url: '/facebook/marginRecord/' + id,
    method: 'delete'
  })
}
