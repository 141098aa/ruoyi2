import request from '@/utils/request'

// 查询计划库列表
export function listPlan(query) {
  return request({
    url: '/facebook/plan/list',
    method: 'get',
    params: query
  })
}

// 查询计划库详细
export function getPlan(id) {
  return request({
    url: '/facebook/plan/' + id,
    method: 'get'
  })
}

// 新增计划库
export function addPlan(data) {
  return request({
    url: '/facebook/plan',
    method: 'post',
    data: data
  })
}

// 修改计划库
export function updatePlan(data) {
  return request({
    url: '/facebook/plan',
    method: 'put',
    data: data
  })
}

// 删除计划库
export function delPlan(id) {
  return request({
    url: '/facebook/plan/' + id,
    method: 'delete'
  })
}
