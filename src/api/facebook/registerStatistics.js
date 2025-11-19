import request from '@/utils/request'

// 查询注册统计列表
export function listRegisterStatistics(query) {
  return request({
    url: '/facebook/registerStatistics/list',
    method: 'get',
    params: query
  })
}

// 查询注册统计详细
export function getRegisterStatistics(id) {
  return request({
    url: '/facebook/registerStatistics/' + id,
    method: 'get'
  })
}

// 新增注册统计
export function addRegisterStatistics(data) {
  return request({
    url: '/facebook/registerStatistics',
    method: 'post',
    data: data
  })
}

// 修改注册统计
export function updateRegisterStatistics(data) {
  return request({
    url: '/facebook/registerStatistics',
    method: 'put',
    data: data
  })
}

// 删除注册统计
export function delRegisterStatistics(id) {
  return request({
    url: '/facebook/registerStatistics/' + id,
    method: 'delete'
  })
}
