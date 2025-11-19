import request from '@/utils/request'

// 查询用户计划列表列表
export function listUserPlan(query) {
  return request({
    url: '/facebook/userPlan/list',
    method: 'get',
    params: query
  })
}

// 查询用户计划列表详细
export function getUserPlan(id) {
  return request({
    url: '/facebook/userPlan/' + id,
    method: 'get'
  })
}

// 新增用户计划列表
export function addUserPlan(data) {
  return request({
    url: '/facebook/userPlan',
    method: 'post',
    data: data
  })
}

// 修改用户计划列表
export function updateUserPlan(data) {
  return request({
    url: '/facebook/userPlan',
    method: 'put',
    data: data
  })
}

// 删除用户计划列表
export function delUserPlan(id) {
  return request({
    url: '/facebook/userPlan/' + id,
    method: 'delete'
  })
}

// 批量提前结算
export function enterSettleBatch(ids) {
  return request({
    url: '/facebook/userPlan/enterSettle',
    method: 'post',
    data: ids
  })
}